

## Fetch `build-status.json` from Published URL

**Approach**: The published URL is already stored in the database as `short_url` in `site_config` (e.g. `https://open-label.eu`). The `BuildStatusBanner` can use `useSiteConfig()` to get this value and fetch `build-status.json` from the published site.

### Changes

**`src/components/BuildStatusBanner.tsx`**:
1. Import and call `useSiteConfig()` to get `config.short_url`
2. In the `useEffect` that fetches `/build-status.json`, construct the URL as `${config.short_url}/build-status.json` when `short_url` is set, falling back to `/build-status.json` (relative) otherwise
3. Add CORS consideration: the published site serves static files, so `build-status.json` should be fetchable cross-origin. If CORS blocks it, we can use `mode: 'cors'` or fall back gracefully.

**Flow**:
- In preview/dev: banner fetches `https://open-label.eu/build-status.json` (the last published build result)
- On published site: same fetch works (same-origin)
- If `short_url` is not configured: falls back to relative `/build-status.json`

This means the preview will always show the **last published** build status, which is the meaningful signal for quality gating.

