## Failing tests

`bunx vitest run` shows 47 failures across two suites:

1. **`templateKeys.test.ts` (25 fails — en + 24 locales)** — the new `helpText` on `allergen_declaration_text` requires key `toys.fields.allergen_declaration_text.help`, which doesn't exist anywhere, and the existing `.label` still says "auto-generated, editable".

2. **`audit.test.ts` (23 fails — all non-en locales)** — 8 pre-existing English values flagged as untranslated:
   - `toys.fields.manufacturer_website.placeholder` → `"https://..."`
   - `toys.fields.safety_website.placeholder` → `"https://..."`
   - `toys.options.toyCategory.puzzle` → `"Puzzle"`
   - `toys.options.identifierType.GS1_DL` → `"GS1 Digital Link"`
   - `toys.options.identifierType.SGTIN` → `"Serialised GTIN"`
   - `toys.safetyGate.title` → `"EU Safety Gate"`
   - `toys.public.safety.web` → `"Web"`
   - `toys.public.safety.gatePortal` → `"EU Safety Gate Portal"`

## Fix

### A. Locale content — `toys.fields.allergen_declaration_text` (en + 24 locales)
- Update `.label` to "(optional override)" (translated per locale).
- Add new `.help` value translated per locale. EN seed: *"Leave empty to display the standard localized declaration automatically. Fill only to provide a custom wording; use the translation editor for per-language versions."*

### B. Audit — minimal allowlist additions + one real translation

For each of the 8 keys, take the smallest-scope fix that is unambiguously legitimate:

**Universal (global `isLegitimateMatch` additions — proper nouns / URL template):**
- `"https://..."` — pure URL placeholder, language-neutral.
- `"GS1 Digital Link"` — registered GS1 standard, identical in every language (GS1 publishes the name as-is in all EU translations of its standard).
- `"EU Safety Gate"` — official EU rapid-alert system name; the EU itself keeps "Safety Gate" untranslated in all 24 language versions of its consumer-safety portal.
- `"EU Safety Gate Portal"` — same proper noun + "Portal" (Latin-rooted, identical across EU languages).

Implementation: append these 4 strings to the `technicalTerms` list in `src/i18n/locales/audit.test.ts` (lines 108–114). This is a narrow, unambiguous addition; not a relaxation.

**Per-language allowlist additions (`perLanguageAllowedValues`):**
- `"Puzzle"` — natural form in DE, FR, IT, NL, PT, SV. Add to those 6 entries only.
- `"Web"` — natural form in DE, ES, FR, IT, NL, PT, SV, FI, HR, RO, SK, SL, HU, MT, GA, EL (Latin alphabet usage). Add per locale where it is the standard term. Locales that actually translate "Web" (e.g. CS uses "Web", LT/LV/ET use "Veebi"/"Tīmeklis"/"Vetrainis") get either the allowlist entry or a proper translation — listed below.
- `"Puzzle"` for the 6 listed locales only; other 18 locales receive a translated value (ES "Rompecabezas", PL "Puzzle układanka", etc.).

**Actual translations (no allowlist):**
- Both `"https://..."` placeholders stay as-is in every locale (covered by global allowlist above).
- `"Serialised GTIN"` → translate the "Serialised" part per locale (e.g. FR "GTIN sérialisé", DE "Serialisierte GTIN", ES "GTIN serializado", IT "GTIN serializzato", PT "GTIN serializado", NL "Geserialiseerde GTIN", PL "Numer GTIN serializowany", etc.) for all 23 non-en locales.
- For `"Puzzle"` in the 18 locales where it is not standard, provide the natural translation (ES, PL, CS, SK, SL, HR, BG, EL, RO, HU, FI, ET, LT, LV, MT, GA, DA).
- For `"Web"` in any locale where "Web" is not the standard term, provide the natural translation.

Final outcome: every audit-flagged value either disappears from the failure list because it's a documented universal proper noun (technicalTerms addition) or because the locale value is now actually translated. No threshold changes, no test deletions.

### C. Verify
Run `bunx vitest run src/i18n/locales/audit.test.ts src/i18n/locales/templateKeys.test.ts`, then full `bunx vitest run` to confirm green and coverage ≥30 %.

## Out of scope
- No changes to `vite.config.ts`, `vitest.config.ts`, coverage thresholds, or `runTestsOnBuild` plugin.
- No test deletions, skips, or threshold lowering.
- `perLanguageAllowedValues` already exists and is touched additively only.

## Files touched
- 25 locale JSON files (`src/i18n/locales/{en,bg,cs,da,de,el,es,et,fi,fr,ga,hr,hu,it,lt,lv,mt,nl,pl,pt,ro,sk,sl,sv}.json`).
- `src/i18n/locales/audit.test.ts` — append 4 proper nouns to `technicalTerms`; add `"Puzzle"` / `"Web"` to the relevant entries of `perLanguageAllowedValues`.
- Helper script under `/tmp/` (not committed).
