import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

const THRESHOLDS = { lines: 50, branches: 50, functions: 50, statements: 50 };

function buildStatusPlugin(): Plugin {
  return {
    name: "build-status",
    resolveId(id) {
      if (id === "virtual:build-status") return "\0virtual:build-status";
    },
    load(id) {
      if (id !== "\0virtual:build-status") return;

      const coveragePath = path.resolve(__dirname, "coverage/coverage-summary.json");
      
      if (!fs.existsSync(coveragePath)) {
        return `export default ${JSON.stringify({ status: "unknown", message: "No coverage report found. Run tests before building." })}`;
      }

      try {
        const raw = JSON.parse(fs.readFileSync(coveragePath, "utf-8"));
        const total = raw.total;
        const failures: string[] = [];

        for (const [metric, threshold] of Object.entries(THRESHOLDS)) {
          const actual = total[metric]?.pct ?? 0;
          if (actual < threshold) {
            failures.push(`${metric}: ${actual}% < ${threshold}%`);
          }
        }

        if (failures.length > 0) {
          return `export default ${JSON.stringify({ status: "fail", message: `Coverage thresholds not met: ${failures.join(", ")}` })}`;
        }

        return `export default ${JSON.stringify({ status: "pass" })}`;
      } catch (e) {
        return `export default ${JSON.stringify({ status: "unknown", message: "Failed to parse coverage report." })}`;
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
