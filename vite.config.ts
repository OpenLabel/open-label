import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import { execSync } from "child_process";

const THRESHOLDS = { lines: 50, branches: 50, functions: 50, statements: 50 };

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

      // 1. Check test results (prioritize failures)
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

      // 2. Check coverage thresholds
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

      // Only unknown if no artifacts exist at all
      if (!testResultsExist && !coverageExists) {
        return `export default ${JSON.stringify({ status: "unknown", message: "No test/coverage reports found. Run tests before building." })}`;
      }

      return `export default ${JSON.stringify({ status: "pass" })}`;
    },
    configureServer(server) {
      // Watch test result files for HMR updates
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
      try {
        console.log("[run-tests-on-build] Running vitest...");
        execSync("npx vitest run --coverage", {
          stdio: "inherit",
          cwd: __dirname,
        });
      } catch {
        // Tests failed — artifacts are still written, buildStatusPlugin will detect failures
        console.warn("[run-tests-on-build] Tests finished with failures.");
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
