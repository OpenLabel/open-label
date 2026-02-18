

# Autofill DPP Name and Product Image from AI Scanner

## What Changes

Two things currently don't get filled by the AI scanner:
1. **DPP Name** -- the top-level passport name field in PassportForm (not `category_data.product_name`)
2. **Product Image** -- when a QR code page contains a product image, it should be downloaded and set as the DPP image

The root cause is architectural: `WineAIAutofill` sits inside `WineFields` and its `onAutofill` callback only updates `category_data`. The DPP `name` and `image_url` live one level up in `PassportForm`.

## Technical Changes

### 1. Add `product_image_url` to the extraction schema (Edge Function)

In `supabase/functions/wine-label-ocr/index.ts`:
- Add a `product_image_url` field to `EXTRACTION_TOOL.function.parameters.properties` (string, URL of a product image found on a scraped web page)
- Update the system prompt to instruct the AI to extract image URLs from scraped QR code pages (not from label photos themselves -- a label photo IS the product, not a URL)
- Add it to `ALL_FIELD_KEYS` for second-pass coverage

### 2. Lift the autofill callback to PassportForm

In `src/components/wine/WineAIAutofill.tsx`:
- Add an optional `onAutofillMeta` prop: `(meta: { dppName?: string; imageUrl?: string }) => void`
- After calling `onAutofill(data.extractedData)`, also call `onAutofillMeta` with `product_name` (as `dppName`) and `product_image_url` (as `imageUrl`) if they exist in the extracted data

In `src/components/WineFields.tsx`:
- Add an optional `onAutofillMeta` prop to `WineFieldsProps`
- Pass it through to `WineAIAutofill`

In `src/pages/PassportForm.tsx`:
- Pass an `onAutofillMeta` callback to `WineFields` that sets `formData.name` (if currently empty) from `dppName`, and `formData.image_url` from `imageUrl`
- For the image URL: download it to storage first (re-use the existing upload pattern from `ImageUpload`), then set the stored URL

### 3. Download remote product image to storage

When the AI returns a `product_image_url` (from a QR-scraped page), the frontend needs to:
- Fetch the image via a simple proxy (to avoid CORS) or directly if same-origin
- Upload it to the existing storage bucket using the same pattern as `ImageUpload`
- Set the resulting storage URL as `formData.image_url`

To avoid CORS issues with arbitrary image URLs, add image downloading to the edge function itself:
- In the edge function, after merging all data, if `product_image_url` exists, fetch it and convert to base64 data URL
- Return it as `productImageBase64` alongside `extractedData`
- On the frontend, convert the base64 to a File and upload via existing storage logic

### 4. Auto-set DPP Name from product_name

The DPP `name` field is a convenience label. When it's empty and the AI extracts a `product_name`, auto-fill it. This is straightforward -- just check if `formData.name` is empty and set it.

## Summary of File Changes

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Add `product_image_url` to schema, prompt, and ALL_FIELD_KEYS. Add image download logic to return base64. |
| `src/components/wine/WineAIAutofill.tsx` | Add `onAutofillMeta` prop, call it with `dppName` and image data |
| `src/components/WineFields.tsx` | Pass through `onAutofillMeta` prop |
| `src/pages/PassportForm.tsx` | Handle `onAutofillMeta` to set name and upload/set image |

## Risk Assessment

- **Low risk**: DPP name autofill is a simple string copy
- **Medium risk**: Image download in edge function adds network dependency but is wrapped in try/catch with graceful fallback (no image = status quo)
- **No regression**: If no product_image_url is found, behavior is unchanged
