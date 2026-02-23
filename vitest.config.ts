import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    reporters: ["dot"],
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "html", "json"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/test/",
        "src/components/ui/",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 30,
        branches: 30,
        functions: 30,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
