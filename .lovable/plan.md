

## Fix Debug Screenshot Upload

### Root cause

Two bugs in the screenshot capture code:

1. **Wrong data path**: Firecrawl v1 nests content under `data.data`, so `screenshotData?.data?.screenshot` resolves correctly but `screenshotData?.screenshot` is the fallback and may not work. Need to check `screenshotData?.data?.screenshot` first.

2. **Data URL prefix**: Firecrawl returns screenshots as data URLs (`data:image/png;base64,iVBOR...`). The code passes this directly to `atob()`, which fails because `atob()` expects raw base64 without the prefix. Need to strip the `data:...;base64,` prefix before decoding.

### What changes

In `supabase/functions/wine-label-ocr/index.ts`, in the debug screenshot block (~line 790):

1. Fix the data access path to prioritize `screenshotData?.data?.screenshot`
2. Strip the data URL prefix before calling `atob()`:
   ```
   let base64 = screenshotBase64;
   if (base64.startsWith('data:')) {
     base64 = base64.split(',')[1];
   }
   const raw = atob(base64);
   ```

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Fix base64 decoding by stripping data URL prefix; fix Firecrawl response data path |

### Technical details

- The Firecrawl v1 API returns screenshots as data URLs with a `data:image/...;base64,` prefix
- `atob()` in Deno strictly expects raw base64 characters only
- The fix splits on `,` and takes the second part, which is the raw base64 payload
- No other files or dependencies affected

