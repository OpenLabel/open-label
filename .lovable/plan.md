

## Why the Banner Isn't Showing

The `BuildStatusBanner` reads from a Vite virtual module (`virtual:build-status`) that checks **code coverage percentages** in `coverage/coverage-summary.json` — not whether individual tests pass or fail.

The missing `testKey` causes the **locale audit tests to fail**, but those test failures don't reduce coverage percentages. Coverage measures "how much code is executed by tests," not "how many tests pass." So coverage stays above 50% and the banner reports `"pass"`.

### To make the banner react to test failures, two options:

**Option A — Extend the plugin to also check test results (recommended)**
- Modify `buildStatusPlugin()` in `vite.config.ts` to also look for a test results file (e.g., a JSON reporter output)
- If any tests failed in the last run, set status to `"fail"` with a message listing the failure count

**Option B — Make the banner check translations at runtime**
- Instead of relying on the build plugin, have `BuildStatusBanner` import the locale files directly and compare keys at runtime
- This would catch missing keys without needing a test run, but adds bundle size

### Cleanup reminder
The `testKey: "AHAHA THIS IS A TEST"` in `en.json` should be removed once testing is complete — it's currently causing 23+ locale test failures.

