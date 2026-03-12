

## Fix BuildStatusBanner: Show by default, hide only on confirmed "pass"

### Logic
- Banner is **always visible** by default (including during loading)
- Fetch published build status via edge function proxy
- **Only hide** if the fetch succeeds AND returns `status: 'pass'`
- All other cases (loading, fetch error, unknown, fail, no site_url) → show the banner

### Changes to `src/components/BuildStatusBanner.tsx`

1. State: `resolved` starts as `null` (loading)
2. Remove the `virtual:build-status` import — not needed anymore
3. `useEffect`: always fetch from `config?.site_url` via edge function. On success, set `resolved`. On error, set `resolved` to `{ status: 'unknown', message: 'Could not fetch build status' }`.
4. If no `site_url` configured, set `resolved` to `{ status: 'unknown', message: 'No site URL configured' }`.
5. Early return: `if (resolved?.status === 'pass') return null;` — this is the **only** case that hides the banner.
6. While `resolved` is `null`, show the banner in a loading state (collapsed, title says "⚠️ Checking build status…").
7. Once resolved to fail/unknown, show the existing collapsed error banner.

