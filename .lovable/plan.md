## Goal

Bring AI-powered photo autofill to the **Toys** category, mirroring the existing Wine autofill: snap or upload a picture of the toy / its packaging, and let Gemini extract the regulated fields defined in `src/templates/toys.ts` into `category_data`.

## 1. New edge function: `toy-label-ocr`

Create `supabase/functions/toy-label-ocr/index.ts`, modeled on `wine-label-ocr`:

- Same CORS, JWT-auth, Zod validation, fair-usage quota (`increment_api_usage`, monthly limit 100, `QUOTA_EXCEEDED` code).
- Same input shape: `{ image: base64 data URL }`, ~7 MB cap, PNG/JPEG/WebP/GIF/PDF.
- Server-side QR / barcode decode via `zxing-wasm` (treated as `unique_product_identifier` candidate with `identifier_type = ean13`/`gtin` when detected, otherwise left blank).
- Model: `google/gemini-2.5-pro` via Lovable AI Gateway, multimodal (image + system prompt).
- **System prompt** = strict regulatory extraction brief covering GPSR (2023/988), Toy Safety Regulation, EN 71, mouth-contact restrictions, CE marking, notified-body number, allergenic fragrances (Annex II/III), age grading, warnings. Tells the model: return only what it can read from the image, never invent, prefer `null` over guessing, return canonical IDs for allergenic fragrances from a `KNOWN_TOY_FRAGRANCES` list mirrored from `src/data/toyFragrances.ts`.
- **Structured output** via `response_format: json_schema` keyed exactly to the `Question.id`s currently in `src/templates/toys.ts`, e.g.:
  - `product_name`, `description`, `manufacturer_name`, `manufacturer_address`, `eu_representative_name`, `eu_representative_address`, `model_number`, `batch_serial`, `unique_product_identifier`, `identifier_type`
  - `age_grading`, `under_36_months`, `mouth_contact`
  - `ce_marked`, `notified_body_involved`, `notified_body_number`
  - `warnings[]` (small parts, magnets, button cells, projectiles, long cords, etc., from a fixed enum)
  - `materials[]`, `contains_fragrance`, `fragrance_ids[]` (canonical IDs only)
  - `intended_use`, `instructions_summary`
- Returns `{ extractedData, productImageBase64 (cropped front shot when available), qrCodeUsed, quota }` exactly like the wine function so `PassportForm` reuses the same `onAutofillMeta` handler unchanged.
- Hard-coded `KNOWN_TOY_FRAGRANCES` list mirrored from `src/data/toyFragrances.ts`; add a sync test (see §5).
- Reject anything outside the schema; strip unknown keys before returning.

Config: deploys with default `verify_jwt = false` (matches wine function), JWT validated in code.

## 2. New component: `src/components/toys/ToyAIAutofill.tsx`

Copy `WineAIAutofill.tsx` 1:1, change:

- Edge function name → `toy-label-ocr`.
- Translation namespace → `toys.ai.*` (with sensible fallbacks to existing `ai.*` keys so nothing breaks before translations land).
- Dialog copy: "Scan your toy or its packaging — works best on the box face showing CE mark, age warning, and manufacturer info."
- Keep the Apple-Intelligence gradient button, drag-and-drop zone, quota dialog, experimental badge — all identical to wine.
- Keep the `useSiteConfig().ai_enabled` gate.

Add `ToyAIAutofill.test.tsx` mirroring `WineAIAutofill.test.tsx` (render gated by `ai_enabled`, button click opens dialog, file select triggers `supabase.functions.invoke('toy-label-ocr', …)`, quota dialog on `QUOTA_EXCEEDED`).

## 3. Toy autofill consumer in `ToyFields`

There is currently no `ToyFields` equivalent of `WineFields.handleAIAutofill`. Two options, picking the simpler one:

- The toys form is fully driven by the generic `CategoryQuestions` renderer over `toys.ts`. So we wire autofill **directly in `CategoryQuestions.tsx`**: when `value.__ai_autofill` is present, merge known question-`id` keys into `category_data`, normalize enums (e.g. `age_grading` must be one of the allowed options, `warnings[]` filtered against the question's option list, `fragrance_ids[]` filtered against `toyFragrances.ts`), then strip the sentinel. This keeps wine's `WineFields` path untouched.
- Unknown / unrecognized keys are dropped silently (logged in dev).

## 4. Wire into `PassportForm.tsx`

Mirror the wine block right below it:

```tsx
{formData.category === 'toys' && (
  <ToyAIAutofill
    onAutofill={(extractedData) => {
      setFormData(prev => ({
        ...prev,
        category_data: { ...prev.category_data, __ai_autofill: extractedData },
      }));
    }}
    onAutofillMeta={/* identical to wine: sets name + uploads productImageBase64 to passport-images */}
  />
)}
```

Refactor the shared `onAutofillMeta` body into a small local helper to avoid duplication.

Update `PassportForm.test.tsx` to mock `@/components/toys/ToyAIAutofill` the same way the wine one is mocked.

## 5. Data integrity & tests (mandatory per project rules)

- New `src/data/toyFragrances.integrity.test.ts` asserting `KNOWN_TOY_FRAGRANCES` in the edge function stays in sync with `src/data/toyFragrances.ts` (same pattern as the wine ingredients sync test).
- Extend the existing template tests so each `toys.ts` question id used by the AI schema actually exists (prevents schema drift if `toys.ts` is renamed).
- Component tests for `ToyAIAutofill` (see §2).
- Keep global coverage threshold untouched (never lower it).

## 6. Translations

Add an English `toys.ai.*` block to `src/i18n/locales/en.json` (button label, dialog title/description, regulatory warning copy specific to toys, quota dialog). Per project policy, translate to all 23 other EU locales in the same change using `google/gemini-2.5-pro` with the full toys regulatory context document already created in the previous step (`scripts/toys-regulatory-context.md`). Existing `locales.test.ts`, `audit.test.ts`, and `duplicateKeys.test.ts` will fail the build if any locale is incomplete.

## 7. Out of scope

- No collapsible sections / progress bar.
- No file-upload of supplier declaration or per-fragrance test reports (still boolean flags).
- No changes to wine autofill behavior.
- No new storage bucket (reuse `passport-images`).

## Files touched

- **New**: `supabase/functions/toy-label-ocr/index.ts`, `src/components/toys/ToyAIAutofill.tsx`, `src/components/toys/ToyAIAutofill.test.tsx`, `src/data/toyFragrances.integrity.test.ts`
- **Edited**: `src/pages/PassportForm.tsx`, `src/pages/PassportForm.test.tsx`, `src/components/CategoryQuestions.tsx`, `src/i18n/locales/*.json` (24 locales)
