

## Updated Plan: Build Status Banner (Preview-Only)

Yes — the Lovable preview URL always contains `preview` in the hostname (e.g. `id-preview--*.lovable.app`), while the published site does not. The banner component can check this at runtime and only render in preview.

### Changes from Previous Plan

The only addition is a runtime guard in `BuildStatusBanner.tsx`:

```typescript
const isPreview = window.location.hostname.includes('preview');
if (!isPreview) return null;
```

This means the banner will **never** appear on the published site (`digital-product-passports-com.lovable.app` or any custom domain), only in the Lovable preview.

### Full Plan Summary

| File | Action | Purpose |
|------|--------|---------|
| `vitest.config.ts` | Edit | Remove `thresholds` block, ensure `json` reporter outputs `coverage/coverage-summary.json` |
| `vite.config.ts` | Edit | Add Vite plugin that reads coverage JSON at build time, checks thresholds (50/50/50/50), injects result as `virtual:build-status` |
| `src/vite-env.d.ts` | Edit | Add `declare module 'virtual:build-status'` |
| `src/components/BuildStatusBanner.tsx` | Create | Red banner, **only renders when hostname includes "preview"**, shows failure reason + copyable Lovable prompt |
| `src/pages/Dashboard.tsx` | Edit | Render `<BuildStatusBanner />` at top of main |

The banner displays the exact prompt:
> "Check why the build fail and if it's due to missing test add more tests, if it's due to missing translations, do the translations. But DO NOT lower the thresholds and DO NOT modify the legitimate English match rules at all."

