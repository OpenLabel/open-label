

## Analysis: Why `NODE_ENV=test` Is the Right Fix

Your instinct makes sense — but the current setup doesn't actually test the production bundle. Here's what's happening:

**What `runTestsOnBuild` does today:**
- Runs `npx vitest run --coverage` as a subprocess during `vite build`
- Vitest re-compiles every source file from scratch using its own SWC transform pipeline
- It does NOT import or test the minified production output — it runs unit tests against raw `.tsx` source files in jsdom

**Why the `jsxDEV` error is a false positive:**
- SWC's React plugin always emits `jsxDEV()` calls (the development JSX runtime)
- When `NODE_ENV=production` leaks from the parent `vite build` process, React's production entry point is resolved instead — which doesn't export `jsxDEV`
- This is purely a tooling conflict, not a real production bug. No actual user-facing code path uses `jsxDEV`

**What real production bugs look like:**
- Missing translations, broken imports, wrong logic, type errors — all of these are still caught with `NODE_ENV=test` because vitest compiles and executes the same source code either way

**Bottom line:** Setting `NODE_ENV=test` doesn't reduce test fidelity — it fixes a toolchain incompatibility. The unit tests were never testing the production bundle; they test source code logic. If you want to test the actual built output, that requires end-to-end tests (Playwright against the served `dist/`), which is a separate effort.

## Plan

**File: `vite.config.ts`** — Add `env: { ...process.env, NODE_ENV: "test" }` to the `execSync` options in `runTestsOnBuild` (line ~146). One-line change.

