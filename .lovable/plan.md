

## Make Build Status Banner Work

**Root cause**: In dev/preview, `runTestsOnBuild` has `apply: "build"` so tests never run — the virtual module always resolves to "unknown". On publish, the virtual module approach works but only if the build environment can run vitest successfully.

**Solution**: Two changes to make it reliable everywhere.

### 1. `vite.config.ts` — Write `build-status.json` to `dist/` after build

Add a `writeBundle` hook to the `buildStatusPlugin` that writes the resolved status as a static JSON file (`build-status.json`) into the output directory. This creates a fetchable artifact that survives independently of the virtual module.

### 2. `src/components/BuildStatusBanner.tsx` — Fetch fallback + hide when irrelevant

- On mount, if the virtual module says `"unknown"`, fetch `/build-status.json` and use that status instead.
- If still unknown after fetch attempt (e.g., in dev where the file doesn't exist), **hide the banner entirely** — showing "unknown" in dev provides no value.
- Use `useState` + `useEffect` for the async fetch.

### 3. Hide banner in dev/preview when no useful info

The banner should only show when status is `"fail"`. Both `"pass"` and `"unknown"` (after fallback attempt) should hide it. This eliminates the confusing "unknown" state entirely.

**Files changed**: `vite.config.ts`, `src/components/BuildStatusBanner.tsx`

