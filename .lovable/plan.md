

## Serve `build-status.json` in Dev/Preview via Middleware

**Problem**: `writeBundle` only runs during `vite build` (publish). The dev server has no `dist/` folder, so `fetch('/build-status.json')` returns Vite's SPA fallback HTML.

**Solution**: Add a dev server middleware in the existing `configureServer` hook that intercepts `GET /build-status.json` and returns the resolved status dynamically by reading the same `test-results/results.json` and `coverage/coverage-summary.json` artifacts from disk.

### Changes

**`vite.config.ts`** — inside `configureServer(server)`:

Add `server.middlewares.use()` before the watcher setup. When a request hits `/build-status.json`, compute the status from the local test/coverage artifacts (same logic as `writeBundle`) and return it as JSON. This means:

- If you've run `npx vitest run --coverage` locally, the banner will pick up pass/fail from those artifacts.
- If no artifacts exist, it returns `{"status":"unknown","message":"No test artifacts."}`.
- The file watcher already invalidates the virtual module on artifact changes, so both the virtual module and the middleware stay in sync.

This is ~15 lines added to the existing `configureServer` block. No new files needed.

