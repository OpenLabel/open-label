

## Fix: Coverage Report Overflowing Build Log

### Root Cause

All 311 tests pass successfully, but the build is killed during the **coverage report output**. The `vitest.config.ts` uses `reporter: ["text", "text-summary", "html", "json"]` — the `"text"` reporter prints a row for **every file in the project**, producing a massive table that overflows the build server's log buffer.

### Fix

**File: `vitest.config.ts` (line 14)**

Remove the `"text"` reporter (the giant per-file table) and keep only `"text-summary"` for console output:

```ts
reporter: ["text-summary", "html", "json"],
```

This keeps:
- `text-summary` — a compact 5-line summary printed to console (passes/fails/coverage %)
- `html` and `json` — full details written to files (no console output)

This removes:
- `text` — the massive per-file coverage table that overflows the build log

No other changes needed. Tests and thresholds remain identical.

