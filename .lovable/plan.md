

## Problem

Your `build` script is `"vitest run --coverage; vite build"`. The `;` operator is a Unix shell feature — it runs the second command regardless of the first's exit code. However, **Lovable's build environment doesn't use `package.json` scripts**. It runs `vite build` directly, so your `vitest run --coverage` prefix never executes, and `test-results/results.json` is never generated.

## Solution

Since you can't control how Lovable triggers the build, the approach is to **run tests inside the Vite build process itself** using a custom Vite plugin.

### Modify `vite.config.ts`:
- Add a new plugin (or extend `buildStatusPlugin`) that runs `vitest run --coverage` as a **child process** during Vite's `buildStart` hook (only in production build mode, not dev server).
- Use Node's `child_process.execSync` to run `npx vitest run --coverage` synchronously before the build proceeds.
- This guarantees `test-results/results.json` and `coverage/coverage-summary.json` exist when the `buildStatusPlugin` reads them during the `load` hook.

```text
buildStart hook (production only)
  └─ execSync("npx vitest run --coverage")
      └─ generates test-results/results.json
      └─ generates coverage/coverage-summary.json
  
load("virtual:build-status")
  └─ reads those files → pass/fail/unknown
```

### Key details:
- Guard with `apply: 'build'` so it only runs during `vite build`, not `vite dev`.
- Wrap in try/catch so test failures don't abort the build — they just produce artifacts the status plugin reads.
- No changes needed to `BuildStatusBanner.tsx` or `vitest.config.ts`.

