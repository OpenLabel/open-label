
Goal: make the build banner reliably visible in preview and correctly fail on test failures.

Diagnosis (from current code + runtime):
- The banner is only mounted in `Dashboard` (`src/pages/Dashboard.tsx`), but you are currently on `/`, so it won’t render there.
- `BuildStatusBanner` hides itself unless `hostname.includes("preview")`, but current preview host is `*.lovableproject.com`, so `isPreview` is false.
- In `vite.config.ts`, the plugin returns `"unknown"` immediately when coverage file is missing, which can mask failed tests.
- Current `test-results/results.json` shows `numFailedTests: 0`, so unless tests are re-run after adding `testKey`, fail status won’t be detected.

Implementation plan:
1) `src/components/BuildStatusBanner.tsx`
- Replace preview detection with robust logic:
  - show in dev/preview hosts (`import.meta.env.DEV` OR `*.lovableproject.com` OR `hostname` contains `preview`)
  - still hide on published production domain.
2) `src/App.tsx` + `src/pages/Dashboard.tsx`
- Move `<BuildStatusBanner />` to app-level layout (above routed pages) so it appears on `/`, `/auth`, and dashboard.
- Remove dashboard-local banner instance to avoid duplicates.
3) `vite.config.ts` (build status plugin)
- Refactor status decision order:
  - if failed tests > 0 → `status: "fail"` (even without coverage file)
  - then evaluate coverage thresholds when coverage exists
  - only return `status: "unknown"` when required artifacts are missing and no explicit failure exists.
4) `vite.config.ts` (reactivity)
- Add file watching/invalidation for `test-results/results.json` and `coverage/coverage-summary.json` so banner updates after test reruns without restarting the dev server.

Technical details:
- Keep existing banner UI/wording unchanged.
- Do not change coverage thresholds.
- Do not alter translation audit allowlists/rules.
- This is a visibility + status-resolution fix only.

Validation steps:
- Re-run tests after adding `testKey`, confirm `numFailedTests > 0` in `test-results/results.json`.
- Open preview at `/` and verify banner appears with fail message.
- Confirm banner is hidden on published site.
