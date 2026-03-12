
Goal: make build status deterministic so “unknown” only appears when expected, and never masks a failed/unfinished test run during publish.

What’s happening now:
- The banner reads `virtual:build-status` from the current runtime environment.
- Preview/dev and publish build run in different environments; artifacts generated during publish are not reused by your live preview session.
- In `vite.config.ts`, `runTestsOnBuild()` catches all command errors and continues; if Vitest command fails or artifacts are not produced, `buildStatusPlugin()` falls back to `unknown`.

Implementation plan:

1) Make test execution robust in `vite.config.ts`
- Keep `runTestsOnBuild` with `apply: "build"`.
- Before running tests, create output folders explicitly:
  - `test-results/`
  - `coverage/`
- Replace single-command `npx vitest run --coverage` with a more reliable execution strategy:
  - primary: local binary via Node (`node ./node_modules/vitest/vitest.mjs run --coverage`)
  - fallback: current `npx vitest run --coverage`
- Capture stderr/stdout failures and store a module-level `testRunError` string.

2) Stop swallowing build-test failures silently
- If test command fails, do not leave status ambiguous.
- Pass `testRunError` into `buildStatusPlugin` decision path so status becomes explicit `fail` with actionable message (e.g., “Vitest failed to execute during build: …”).

3) Tighten `buildStatusPlugin` status resolution
- Priority order:
  1. If `testRunError` exists → `status: "fail"` with command error details.
  2. If `results.json` shows failed tests → `status: "fail"`.
  3. If coverage exists and any metric is below threshold → `status: "fail"`.
  4. If in build mode and expected artifacts are missing after test run attempt → `status: "fail"` (not unknown).
  5. Only return `unknown` for preview/dev sessions where no local reports exist and no build-run context exists.

4) Improve unknown-state message in `BuildStatusBanner.tsx`
- Keep banner behavior in preview/dev.
- Update unknown copy to clarify environment split:
  - “No local test artifacts found in this preview session. Publish builds run tests in an isolated build environment.”
- This avoids the impression that publish did not run tests.

5) Validation checklist
- Trigger a publish build with an intentional failing test:
  - Expected: publish build status resolves to `fail` (never `unknown`).
- Trigger publish build with all tests passing:
  - Expected: `pass`.
- Open preview without local artifacts:
  - Expected: either clear “preview-local unknown” message or hidden banner (depending on chosen UX).
- Confirm copied prompt includes the concrete failure reason when status is `fail`.

Technical notes:
- No backend/database/auth changes needed.
- Keep coverage thresholds unchanged.
- Keep existing test reporters (`dot`, `json`, `text-summary`) to avoid log bloat and preserve artifact generation.
