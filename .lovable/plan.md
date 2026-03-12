

## Investigation: 234 Tests Fail During Publish Build

### Root Cause

The `build-status.json` currently only reports `"234 test(s) failed"` -- a bare count extracted from `test-results/results.json`. No test names, no error details, no stderr/stdout from the vitest run are preserved. This makes it impossible to diagnose *which* tests fail in the publish build environment.

### Plan: Make build-status.json Verbose

**1. Enhance `buildStatusPlugin` in `vite.config.ts` to extract failed test names**

The vitest JSON reporter (`test-results/results.json`) contains a `testResults` array, each with `assertionResults` that have `status`, `fullName`, and `failureMessages`. Parse this to include up to ~50 failed test names and their error summaries in the `build-status.json` message.

**2. Capture stderr/stdout from the test run**

In `runTestsOnBuild`, save the last ~2000 chars of stderr/stdout to a module-level variable so `buildStatusPlugin` can include it in the output when tests fail. This captures vitest's own error output (e.g. missing modules, setup failures).

**3. Expand `build-status.json` schema**

Change the output from a simple `{status, message}` to:
```json
{
  "status": "fail",
  "message": "234 test(s) failed",
  "failedTests": ["src/hooks/useAuth.test.tsx > useAuth > should ...", ...],
  "stderr": "last 2000 chars of test runner output"
}
```

This keeps backward compatibility (the banner still reads `message`) while adding verbose diagnostics.

**4. Update `BuildStatusBanner.tsx` to display failed test list**

Show the `failedTests` array (if present) in a scrollable list inside the collapsible banner, so the details are visible in the preview without needing to inspect the raw JSON.

### Files to Change

| File | Change |
|------|--------|
| `vite.config.ts` | Parse failed test names from results.json; capture stderr/stdout; write expanded JSON |
| `src/components/BuildStatusBanner.tsx` | Display `failedTests` list in the collapsible details |

