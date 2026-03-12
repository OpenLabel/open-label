

## Update threshold instruction in BuildStatusBanner

**Change in `src/components/BuildStatusBanner.tsx`** (line 20):

Replace:
```
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts.
```

With:
```
DO NOT lower any thresholds in vite.config.ts or vitest.config.ts — they should all be set to 50.
```

Single line change, no other files affected.

