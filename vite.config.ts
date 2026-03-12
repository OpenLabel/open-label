import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { execSync } from "child_process";

const THRESHOLDS = { lines: 50, branches: 50, functions: 50, statements: 50 };

// Module-level variables to pass test-run context from runTestsOnBuild → buildStatusPlugin
let testRunError: string | null = null;
let testRunAttempted = false;
let testRunStderr: string | null = null;
let testRunStdout: string | null = null;

/** Extract up to `max` failed test names from vitest JSON reporter output */
function extractFailedTests(resultsPath: string, max = 50): string[] {
  if (!fs.existsSync(resultsPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
    const failed: string[] = [];
    for (const suite of data.testResults ?? []) {
      for (const assertion of suite.assertionResults ?? []) {
        if (assertion.status === "failed") {
          const name = assertion.fullName || assertion.ancestorTitles?.join(" > ") + " > " + assertion.title || "unknown";
          const msg = (assertion.failureMessages ?? []).join(" ").slice(0, 200);
          failed.push(msg ? `${name} — ${msg}` : name);
          if (failed.length >= max) return failed;
        }
      }
    }
    return failed;
  } catch {
    return [];
  }
}

/** Build a verbose status object from test artifacts + captured output */
function buildVerboseStatus(testResultsDir: string, coverageDir: string): object {
  const problems: string[] = [];
  const trPath = path.resolve(testResultsDir, "results.json");
  const cvPath = path.resolve(coverageDir, "coverage-summary.json");
  const trExists = fs.existsSync(trPath);
  const cvExists = fs.existsSync(cvPath);
  let failedTests: string[] = [];

  if (trExists) {
    try {
      const td = JSON.parse(fs.readFileSync(trPath, "utf-8"));
      const numFailed = td.numFailedTests ?? 0;
      if (numFailed > 0) {
        problems.push(`${numFailed} test(s) failed`);
        failedTests = extractFailedTests(trPath);
      }
    } catch {}
  }
  if (cvExists) {
    try {
      const raw = JSON.parse(fs.readFileSync(cvPath, "utf-8"));
      for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
        const actual = raw.total[metric]?.pct ?? 0;
        if (actual < (threshold as number)) problems.push(`${metric}: ${actual}% < ${threshold}%`);
      }
    } catch {}
  }

  if (testRunError) {
    return {
      status: "fail",
      message: testRunError,
      stderr: testRunStderr?.slice(-3000) || undefined,
      stdout: testRunStdout?.slice(-3000) || undefined,
    };
  }
  if (problems.length > 0) {
    return {
      status: "fail",
      message: problems.join("; "),
      failedTests: failedTests.length > 0 ? failedTests : undefined,
      stderr: testRunStderr?.slice(-3000) || undefined,
    };
  }
  if (testRunAttempted && !trExists && !cvExists) {
    return { status: "fail", message: "No test artifacts generated.", stderr: testRunStderr?.slice(-3000) || undefined };
  }
  if (!trExists && !cvExists) {
    return { status: "unknown", message: "No test artifacts." };
  }
  return { status: "pass" };
}

function buildStatusPlugin(): Plugin {
  const watchedFiles = [
    path.resolve(__dirname, "test-results/results.json"),
    path.resolve(__dirname, "coverage/coverage-summary.json"),
  ];

  return {
    name: "build-status",
    resolveId(id) {
      if (id === "virtual:build-status") return "\0virtual:build-status";
    },
    load(id) {
      if (id !== "\0virtual:build-status") return;
      const status = buildVerboseStatus(
        path.resolve(__dirname, "test-results"),
        path.resolve(__dirname, "coverage"),
      );
      return `export default ${JSON.stringify(status)}`;
    },
    writeBundle(options) {
      const dir = options.dir ?? path.resolve(__dirname, "dist");
      const status = buildVerboseStatus(
        path.resolve(__dirname, "test-results"),
        path.resolve(__dirname, "coverage"),
      );
      fs.writeFileSync(path.join(dir, "build-status.json"), JSON.stringify(status));
      console.log("[build-status] Wrote build-status.json:", JSON.stringify(status).slice(0, 500));
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/build-status.json") return next();
        const status = buildVerboseStatus(
          path.resolve(__dirname, "test-results"),
          path.resolve(__dirname, "coverage"),
        );
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(status));
      });

      for (const file of watchedFiles) {
        if (fs.existsSync(file)) {
          server.watcher.add(file);
        }
      }
      server.watcher.on("change", (changedPath) => {
        if (watchedFiles.some((f) => changedPath === f)) {
          const mod = server.moduleGraph.getModuleById("\0virtual:build-status");
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}

function runTestsOnBuild(): Plugin {
  return {
    name: "run-tests-on-build",
    apply: "build",
    buildStart() {
      testRunAttempted = true;
      testRunError = null;

      // Ensure output directories exist
      const testResultsDir = path.resolve(__dirname, "test-results");
      const coverageDir = path.resolve(__dirname, "coverage");
      if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir, { recursive: true });
      if (!fs.existsSync(coverageDir)) fs.mkdirSync(coverageDir, { recursive: true });

      try {
        console.log("[run-tests-on-build] Running vitest...");
        execSync("npx vitest run --coverage", {
          stdio: "pipe",
          cwd: __dirname,
          timeout: 300_000, // 5 min timeout
          env: { ...process.env, NODE_ENV: "test" },
        });
      } catch (err: unknown) {
        const execError = err as { stderr?: Buffer; stdout?: Buffer; status?: number };
        testRunStderr = execError.stderr?.toString().slice(-3000) || null;
        testRunStdout = execError.stdout?.toString().slice(-3000) || null;

        // Check if test artifacts were produced despite non-zero exit
        const hasResults = fs.existsSync(path.resolve(testResultsDir, "results.json"));
        const hasCoverage = fs.existsSync(path.resolve(coverageDir, "coverage-summary.json"));

        if (hasResults || hasCoverage) {
          console.warn("[run-tests-on-build] Tests finished with failures. Artifacts available for analysis.");
        } else {
          testRunError = `Vitest failed to execute during build. Exit code: ${execError.status ?? "unknown"}. ${testRunStderr || testRunStdout || "No output captured."}`.trim();
          console.error("[run-tests-on-build]", testRunError);
        }
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    runTestsOnBuild(),
    react(),
    mode === "development" && componentTagger(),
    buildStatusPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
