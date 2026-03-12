import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { execSync } from "child_process";

const THRESHOLDS = { lines: 50, branches: 50, functions: 50, statements: 50 };

// Module-level variable to pass test-run errors from runTestsOnBuild → buildStatusPlugin
let testRunError: string | null = null;
let testRunAttempted = false;

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

      const problems: string[] = [];

      // Priority 1: If test execution itself failed
      if (testRunError) {
        return `export default ${JSON.stringify({ status: "fail", message: testRunError })}`;
      }

      // 2. Check test results
      const testResultsPath = watchedFiles[0];
      let testResultsExist = false;
      if (fs.existsSync(testResultsPath)) {
        testResultsExist = true;
        try {
          const testData = JSON.parse(fs.readFileSync(testResultsPath, "utf-8"));
          const failed = testData.numFailedTests ?? 0;
          if (failed > 0) {
            problems.push(`${failed} test(s) failed`);
          }
        } catch {
          // ignore parse errors
        }
      }

      // 3. Check coverage thresholds
      const coveragePath = watchedFiles[1];
      let coverageExists = false;
      if (fs.existsSync(coveragePath)) {
        coverageExists = true;
        try {
          const raw = JSON.parse(fs.readFileSync(coveragePath, "utf-8"));
          const total = raw.total;
          for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
            const actual = total[metric]?.pct ?? 0;
            if (actual < threshold) {
              problems.push(`${metric}: ${actual}% < ${threshold}%`);
            }
          }
        } catch {
          // ignore parse errors
        }
      }

      // Return fail if any problems found
      if (problems.length > 0) {
        return `export default ${JSON.stringify({ status: "fail", message: problems.join("; ") })}`;
      }

      // Priority 4: If build ran tests but no artifacts were produced → fail
      if (testRunAttempted && !testResultsExist && !coverageExists) {
        return `export default ${JSON.stringify({ status: "fail", message: "Test run completed but no test/coverage artifacts were generated. Check vitest configuration." })}`;
      }

      // Only unknown if in dev/preview with no artifacts and no build context
      if (!testResultsExist && !coverageExists) {
        return `export default ${JSON.stringify({ status: "unknown", message: "No local test artifacts found. Publish builds run tests in an isolated build environment." })}`;
      }

      return `export default ${JSON.stringify({ status: "pass" })}`;
    },
    configureServer(server) {
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
        });
      } catch (err: unknown) {
        const execError = err as { stderr?: Buffer; stdout?: Buffer; status?: number };
        const stderr = execError.stderr?.toString().slice(-500) || "";
        const stdout = execError.stdout?.toString().slice(-500) || "";

        // Check if test artifacts were produced despite non-zero exit
        const hasResults = fs.existsSync(path.resolve(testResultsDir, "results.json"));
        const hasCoverage = fs.existsSync(path.resolve(coverageDir, "coverage-summary.json"));

        if (hasResults || hasCoverage) {
          // Tests ran but some failed — artifacts exist, let buildStatusPlugin parse them
          console.warn("[run-tests-on-build] Tests finished with failures. Artifacts available for analysis.");
        } else {
          // Tests could not run at all
          testRunError = `Vitest failed to execute during build. Exit code: ${execError.status ?? "unknown"}. ${stderr || stdout || "No output captured."}`.trim();
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
