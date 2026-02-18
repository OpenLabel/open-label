

# Fix Wine Label AI Scanner

## Problems Identified

1. **QR code detection never works**: The current approach asks an AI vision model to "decode" a QR code from an image. LLMs cannot reliably decode QR codes -- they can see them but can't read the encoded data. The logs confirm: no QR detection ever fired for this scan.

2. **Merge priority is backwards**: When QR data IS available, image-extracted data currently overrides it. QR-linked pages typically have more complete, structured data and should take priority.

3. **AI extraction missed obvious label text**: "Rosé", "CONTIENT DES SULFITES", misread energy (63 kcal as 83), confused producer vs product name, and misidentified the bottler's town as a wine region.

## Solution

### 1. Use a real QR code decoder (server-side)

Replace the AI-based QR detection with a proper image processing approach:
- Decode the base64 image to raw pixel data using a Deno-compatible image library
- Use a QR decoding library (e.g., `jsqr` via esm.sh or a Deno-native alternative) to find and decode QR codes
- Fall back to AI-based detection only if the library fails (some photos have perspective distortion)

### 2. Reverse merge priority

Change the merge logic so:
- Image extraction provides the BASE data
- QR-scraped page data OVERRIDES it (since it's more structured and reliable)
- This means if QR gives `energy_kcal: 63` and image gives `energy_kcal: 83`, the correct QR value wins

### 3. Improve system prompt for better extraction

Enhance the extraction prompt to:
- Explicitly instruct: "Read ALL text on the label carefully, including small print"
- Clarify product_name vs producer_name distinction
- Emphasize allergen/ingredient detection ("CONTIENT DES SULFITES" = Sulfites)
- Instruct to look for wine color/type (Rosé, Rouge, Blanc) and include it in product_name
- Warn against confusing bottler address towns with wine regions
- Stress exact number reading for energy values

## Technical Changes

### File: `supabase/functions/wine-label-ocr/index.ts`

**A. Add image decoding + QR detection library**

Add imports for image decoding and QR code scanning at the top. Use `esm.sh` to import `jsqr` and a PNG/JPEG decoder for Deno.

Create a new `decodeQrFromBase64` function that:
1. Strips the data URL prefix
2. Decodes the base64 to binary
3. Decodes the image to raw RGBA pixel data
4. Runs jsQR on the pixel data
5. Returns the decoded URL string or null

**B. Update `tryQrCodeScrape` function**

- First, try the library-based QR decoder (fast, reliable)
- If it finds a URL, proceed directly to Firecrawl scraping
- Only if the library fails, fall back to the existing AI vision approach (for perspective-distorted photos)
- Add better logging throughout

**C. Reverse merge priority (lines ~397-417)**

Change from:
```
QR data = base, Image data = override
```
To:
```
Image data = base, QR data = override
```

So QR-sourced data always wins when available.

**D. Improve SYSTEM_PROMPT**

Add explicit instructions:
- "Read the wine type/color (Rouge, Rosé, Blanc, etc.) and include it in the product_name"
- "product_name is the marketing name of the wine (e.g., 'Pompon Rouge Rosé'), not the producer/winery name"
- "Look for allergen mentions like 'CONTIENT DES SULFITES' and map to detected_ingredients"
- "The bottler address city is NOT the wine region"
- "Read numbers very carefully -- double-check energy values against what is printed"

### File: `supabase/functions/wine-label-ocr/index_test.ts`

No changes needed -- existing tests cover auth, CORS, and validation, which remain the same.

## Risk Assessment

- **Low risk**: Prompt improvements and merge reorder are safe changes
- **Medium risk**: Adding image decoding in Deno edge functions -- need to verify library compatibility with Deno runtime. If image decoding fails, the function gracefully falls back to AI-only detection (current behavior)
- The function still works without a QR code (pure image extraction), so no regression for labels without QR codes
