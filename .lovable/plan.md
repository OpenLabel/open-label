# Fix: Wine Label OCR Memory Limit Exceeded

## Root Cause

The `decodeQrFromBase64` function decodes the full-resolution uploaded image into raw RGBA pixels in memory. A typical phone photo (4000x3000) produces a ~48MB pixel buffer, which exceeds the edge function's memory limit (150MB with libraries overhead).

## Solution

**Remove the in-function image decoding entirely.** Instead, rely on these two approaches for QR detection:

### Approach A: Client-side QR decode (belt and suspenders)

Move QR decoding to the **frontend** before uploading. The browser has Canvas API access, which can decode images without memory constraints. The frontend already imports `jsqr` (it's in `package.json`).

Flow:

1. Frontend: Load image into canvas, run jsQR, get URL
2. Frontend: Send both `image` (base64) and `qrUrl` (if found) to the edge function
3. Edge function: If `qrUrl` is provided, scrape it with Firecrawl in parallel with AI image extraction
4. Edge function: Merge results (QR data overrides image data, as already implemented)

This is the most robust approach -- the browser handles image decoding natively with no memory issues, and jsQR runs efficiently on canvas pixel data.

## Recommended: Approach B (client-side QR)

This gives us reliable QR decoding without any edge function memory risk.

## Technical Changes

### 1. `supabase/functions/wine-label-ocr/index.ts`

- Remove imports: `jsQR`, `pngs`, `jpegts`
- Remove the `decodeQrFromBase64` function entirely
- Update input schema to accept optional `qrUrl` field (string, URL format)
- Update `tryQrCodeScrape` to accept `qrUrl` as a parameter instead of trying to decode from image
- If `qrUrl` is provided, skip AI QR detection and go straight to Firecrawl scraping
- If `qrUrl` is not provided, fall back to AI vision QR detection (existing logic, kept as backup)

### 2. `src/components/wine/WineAIAutofill.tsx` (or wherever the scan is triggered)

- Before calling the edge function, load the image into an off-screen canvas
- Run `jsQR` on the canvas pixel data (already installed as a dependency)
- If a URL is found, pass it as `qrUrl` alongside `image` in the request body

### 3. Update input validation schema

Add optional `qrUrl` to `WineOCRSchema`:

```
qrUrl: z.string().url().optional()
```

## Risk Assessment

- **Low risk**: Removing server-side image decoding only removes the memory problem
- **Low risk**: Client-side QR decoding uses battle-tested browser APIs
- **No regression**: Labels without QR codes work exactly as before (AI image extraction)
- **Improvement**: Labels WITH QR codes now reliably get decoded since browser canvas handles any image size