

# Final Polish: Fix Remaining Edge Cases in AI Autoscan

## Issues

### 1. No timeouts on QR/Firecrawl fetch calls (Reliability)
The `tryQrCodeScrape()` function has 3 fetch calls with no `AbortSignal.timeout()`. If Firecrawl or the AI gateway stalls, the entire request hangs until the Deno runtime kills it.

**Fix**: Add `signal: AbortSignal.timeout(15000)` to the Firecrawl call, `signal: AbortSignal.timeout(30000)` to the two AI calls inside `tryQrCodeScrape`.

### 2. QR data blindly overrides label data (Correctness)
Lines 702-710: QR-scraped data overrides ALL first/second/third pass results. If the QR page has stale or wrong data (different vintage, wrong volume), it silently replaces correct label readings.

**Fix**: Change QR merge to only fill gaps (same logic as second pass), not override. The label image is the ground truth; the QR page is supplementary.

### 3. Missing nutritional fields in `ALL_FIELD_KEYS` (Completeness)
`fat`, `saturated_fat`, `proteins`, `salt` exist in the extraction tool schema but are missing from `ALL_FIELD_KEYS`. The second pass never tries to recover them.

**Fix**: Add these 4 fields to `ALL_FIELD_KEYS`.

### 4. No size guard on product image download (Safety)
If the scraped URL points to a very large image, it downloads entirely into edge function memory with no limit.

**Fix**: Check `Content-Length` header before downloading; skip if larger than 5MB.

## Technical Changes

### File: `supabase/functions/wine-label-ocr/index.ts`

1. Add timeouts to all 3 fetch calls inside `tryQrCodeScrape()`:
   - AI QR detection: `AbortSignal.timeout(30000)`
   - Firecrawl scrape: `AbortSignal.timeout(15000)`
   - AI extraction from scraped content: `AbortSignal.timeout(30000)`

2. Change QR merge logic (lines 702-710) from override to gap-fill:
   ```
   // Before: mergedData[key] = value (always overrides)
   // After:  if (!(key in mergedData)) mergedData[key] = value (fill gaps only)
   ```

3. Add missing fields to `ALL_FIELD_KEYS`:
   ```
   "fat", "saturated_fat", "proteins", "salt"
   ```

4. Add size guard before product image download:
   ```
   // HEAD or check Content-Length, skip if > 5MB
   ```

## Impact

- Prevents hanging requests when Firecrawl is slow or down
- Prevents QR page data from silently corrupting correct label readings
- Allows the second pass to recover 4 additional nutritional fields
- Prevents memory issues from oversized image downloads
- All changes are defensive/additive -- no regressions possible

