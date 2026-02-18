

# Improve AI Autoscan: Fix Broken Inputs, Add Multilingual Support, Boost Quality

## Issues Found

### 1. PDF/Document uploads are silently rejected (Bug)
The Zod validation schema only accepts `data:image/(png|jpeg|jpg|webp|gif)` but the upload dialog accepts `.pdf,.doc,.docx` files. Any non-image file will fail with a 400 error. This means the "Supported formats" hint in the UI is misleading.

**Fix**: Extend the Zod regex to also accept `data:application/pdf` and generic data URLs, or handle PDF conversion.

### 2. French/multilingual ingredient names don't match (Major gap)
Most wine labels are in French, Italian, German, etc. The AI often returns ingredient names in the label's language (e.g., "acide tartrique", "sulfites", "gomme arabique"). The `INGREDIENT_ALIASES` map only has English aliases, so these won't match and end up as unrecognized custom ingredients.

**Fix**: Add ~40 French, Italian, German, and Spanish aliases to the `INGREDIENT_ALIASES` map (e.g., `"acide tartrique"` -> `tartaric_acid`, `"gomme arabique"` -> `gum_arabic`).

### 3. AI prompt doesn't instruct English-normalized ingredient output
The system prompt should explicitly tell the AI to return ingredient names in English to maximize matching against the internal database.

**Fix**: Add instruction to SYSTEM_PROMPT: "Always return detected_ingredients names in English, even if the label is in another language."

### 4. First pass uses the weaker model
The first pass (which does the most work) uses `gemini-2.5-flash` while only the second/third passes use `gemini-2.5-pro`. Since the first pass extracts the bulk of the data, upgrading it would have the biggest impact on quality.

**Fix**: Upgrade the first pass from `gemini-2.5-flash` to `gemini-2.5-pro`.

### 5. No timeouts on AI calls
The first pass `fetch()` has no `AbortSignal.timeout()`, so it could hang indefinitely if the AI gateway is slow.

**Fix**: Add `signal: AbortSignal.timeout(60000)` to all AI fetch calls.

### 6. E-number aliases are incomplete
Common E-numbers like E 466 (carboxymethylcellulose), E 456 (potassium polyaspartate), E 938 (argon), E 941 (nitrogen), E 290 (carbon dioxide), E 516 (calcium sulfate), E 297 (fumaric acid) are missing from the alias map.

**Fix**: Add all E-numbers from the `wineIngredients.ts` database to the alias map.

## Technical Changes

### File: `supabase/functions/wine-label-ocr/index.ts`

1. Extend `WineOCRSchema` to accept PDF data URLs:
   ```
   .refine(val => /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf);base64,/.test(val), ...)
   ```

2. Add to `SYSTEM_PROMPT`:
   ```
   - ALWAYS return detected_ingredients names in ENGLISH, even if the label is in French, Italian, German, or another language. For example: "acide tartrique" should be returned as "Tartaric acid", "gomme arabique" as "Gum arabic".
   ```

3. Upgrade first pass model from `google/gemini-2.5-flash` to `google/gemini-2.5-pro`

4. Add `signal: AbortSignal.timeout(60000)` to all three AI fetch calls (first pass, second pass, critical pass)

### File: `src/components/WineFields.tsx`

1. Expand `INGREDIENT_ALIASES` with:
   - All E-numbers from `wineIngredients.ts` that aren't already covered
   - French aliases (~15): `"acide tartrique"`, `"gomme arabique"`, `"acide citrique"`, `"acide malique"`, `"acide lactique"`, `"acide ascorbique"`, `"dioxyde de soufre"`, `"sorbate de potassium"`, `"metabisulfite de potassium"`, `"bisulfite de potassium"`, `"gelatine"`, `"bentonite"`, `"caséine"`, `"albumine"`, `"colle de poisson"`
   - Italian aliases (~10): `"acido tartarico"`, `"gomma arabica"`, `"acido citrico"`, `"anidride solforosa"`, `"solfiti"`, `"acido ascorbico"`, `"acido malico"`, `"gelatina"`, `"caseina"`, `"albumina"`
   - German aliases (~10): `"schwefeldioxid"`, `"weinsäure"`, `"zitronensäure"`, `"milchsäure"`, `"ascorbinsäure"`, `"gummi arabicum"`, `"kaliumsorbat"`, `"gelatine"`, `"kasein"`, `"hausenblase"`
   - Spanish aliases (~8): `"sulfitos"`, `"ácido tartárico"`, `"goma arábiga"`, `"ácido cítrico"`, `"dióxido de azufre"`, `"ácido ascórbico"`, `"gelatina"`, `"caseína"`

## Summary

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Accept PDF input, add English-output instruction, upgrade to Pro model, add timeouts |
| `src/components/WineFields.tsx` | Add ~50 multilingual ingredient aliases and missing E-numbers |

## Impact

- PDFs will no longer silently fail
- French/Italian/German/Spanish labels will have much better ingredient matching
- First pass extraction quality improves significantly with the Pro model
- No regressions: all changes are additive or fallback-safe

