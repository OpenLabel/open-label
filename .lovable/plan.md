# Fix English leftover in Italian Toy DPP preview

## Problem found
Audited the live preview iframe of the sample Toy DPP in **Italian**. Almost everything is translated (sections, field labels, badges, compliance text, regulations, customs, footer). **One English string leaks through:**

> "No allergenic fragrances subject to labelling requirements are declared as present at or above 10 mg/kg."

Shown in the "Sicurezza e informazioni chimiche" section.

## Root cause
- `src/data/toyFragrances.ts::generateAllergenDeclaration()` writes this English sentence into `category_data.allergen_declaration_text` whenever the user selects "No" for allergenic fragrances (and into the sample seed).
- `src/components/toys/ToyPublicPassport.tsx` line 505 renders `tr('allergen_declaration_text')` first, falling back to `t('toyPublic.values.noFragrancesDeclared')` only when empty. Since the stored string is non-empty English, the i18n key is never reached.
- Localized keys `toyPublic.values.noFragrancesDeclared` already exist in all 24 locales — they just aren't used.

## Fix
In `ToyPublicPassport.tsx`, when `has_allergenic_fragrances !== 'yes'` (or no fragrances are listed), render the localized `t('toyPublic.values.noFragrancesDeclared')` directly and ignore the stored English sentence. When `has_allergenic_fragrances === 'yes'` and fragrances exist, keep current behaviour: prefer `tr('allergen_declaration_text')` (which respects user edits + per-language translations), and only fall back to a localized template using `toyPublic.values.fragrancesDeclared` with `{{names}}` interpolation.

### Code change (single file)
`src/components/toys/ToyPublicPassport.tsx` lines 501–507 — replace with the conditional shown in the steps above.

### i18n additions
- Add `toyPublic.values.fragrancesDeclared` key with `{{names}}` placeholder to all 24 locale files (`en, bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv`). EN string: *"The following allergenic fragrances subject to labelling requirements are present at or above 10 mg/kg: {{names}}."* Translate to each EU language using existing terminology already used in `toys.allergens.*`.
- `toyPublic.values.noFragrancesDeclared` already exists in all 24 locales — no change.

## Out of scope
- `generateAllergenDeclaration()` in `src/data/toyFragrances.ts` stays as-is (still used by the form helper to populate the textarea the user can edit). The public/preview view no longer trusts it as authoritative.
- Sample seed description "A soft plush bear demonstration passport…" is user-editable free text, not a UI string.
- Form audit (FR + DE) — already done last turn.

## Verify
1. Reload `/passport/<id>/edit`, set preview language to Italian → confirm allergen sentence reads *"Nessuna fragranza allergenica soggetta a obblighi di etichettatura è dichiarata presente in concentrazione pari o superiore a 10 mg/kg."* (or equivalent existing IT translation of `noFragrancesDeclared`).
2. Spot-check 2 other locales (DE, FR) in preview.
3. Run `bunx vitest run src/i18n/locales/templateKeys.test.ts src/components/toys` to confirm no regression.
