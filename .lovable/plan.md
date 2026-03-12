

## Fix: Proxy build-status.json fetch through a backend function to avoid CORS

### Problem
The preview and published sites are on different origins. When `virtual:build-status` returns "unknown" (no local test artifacts), the banner tries to fetch `build-status.json` from the published `site_url`, but the cross-origin fetch fails silently due to CORS.

### Solution
Create a backend function `get-build-status` that fetches the `build-status.json` from the published URL server-side (no CORS restrictions), then returns the result to the client.

### Changes

**1. New edge function `supabase/functions/get-build-status/index.ts`**
- Accepts a `url` query parameter (the published site URL + `/build-status.json`)
- Fetches it server-side and returns the JSON
- Includes CORS headers for the client

**2. Update `src/components/BuildStatusBanner.tsx`**
- Instead of fetching `build-status.json` directly, call the `get-build-status` edge function with the target URL
- Use `supabase.functions.invoke('get-build-status', { body: { url } })` 
- Keep the same resolution logic: update `resolved` state if the response contains a valid status

