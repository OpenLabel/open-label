## Problem

`generateAllergenDeclaration()` in `src/data/toyFragrances.ts` returns two hardcoded English sentences and `CategoryQuestions.tsx` writes them into `category_data.allergen_declaration_text` every time the toy form mounts/changes. Result: the source value persisted in the DB is always English.

In `ToyPublicPassport.tsx` line 506, `tr('allergen_declaration_text')` falls back to that stored English when no per-language override exists. So even after the previous i18n key fix, any DPP rendered in a non-English language still shows the English sentence (unless the user manually translated it). This is the same class of bug as before.

## Fix

1. **Stop persisting English into `allergen_declaration_text`.** Remove the auto-write effect in `src/components/CategoryQuestions.tsx` (lines ~321–338). The field becomes a pure optional user override.

2. **Simplify `generateAllergenDeclaration`** in `src/data/toyFragrances.ts`: keep the export (still imported in tests) but make it return `''` — or delete it and update imports/tests. Preferred: delete it and the import in `CategoryQuestions.tsx` to remove dead English strings from the codebase.

3. **Render via i18n in `ToyPublicPassport.tsx`** (lines 504–511): only use `tr('allergen_declaration_text')` if the user has actually written something (i.e. the raw `d.allergen_declaration_text` is truthy AND not one of the legacy auto-generated English sentences). Otherwise render the localized `toyPublic.values.fragrancesDeclared` / `noFragrancesDeclared` keys (already added in 24 locales).

   To stay safe for existing DPPs that already have the English sentence stored, add a legacy guard: treat stored values starting with `"No allergenic fragrances"` or `"The following allergenic fragrances"` as auto-generated and ignore them in favour of the i18n key.

4. **Form UX** (`src/templates/toys.ts` line 529): change the field label from "Allergen declaration (auto-generated, editable)" to "Allergen declaration (optional override)" and add a helper/placeholder explaining that leaving it empty produces a localized declaration automatically. Add an i18n key for the new label/help and translate to all 24 EU languages.

5. **Tests:** update `src/data/toyFragrances.test.ts` and `src/templates/toys.test.ts` to reflect the removed/empty function and new label. Add a test in `src/components/toys` (or extend existing) asserting the Italian public view renders the localized "No allergenic fragrances…" / "The following allergenic fragrances…" strings when `allergen_declaration_text` is empty or contains a legacy English value.

## Out of scope

- Field-level translation UI is unchanged; users can still add per-language overrides via `*_translations` maps.
- No DB migration: legacy English values remain but are ignored at render time.

## Files touched

- `src/data/toyFragrances.ts`
- `src/components/CategoryQuestions.tsx`
- `src/components/toys/ToyPublicPassport.tsx`
- `src/templates/toys.ts`
- `src/data/toyFragrances.test.ts`, `src/templates/toys.test.ts`
- `src/i18n/locales/*.json` (24 files) — new label/help key
