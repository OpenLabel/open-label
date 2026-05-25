## Why the form is still English

The toy template (`src/templates/toys.ts`) already wires `labelKey`, `helpKey`, `placeholderKey`, `titleKey`, `descriptionKey` onto every field/section, and the renderer (`CategoryQuestions.tsx`) already resolves them via `t(key, englishFallback)`. The reason Greek users see English is simply that **none of those keys exist in any locale JSON** (including `en.json`) — so i18next falls back to the inline English string. Last turn we added `toys.options.*` and `toyPublic.*`; we never added `toys.fields.*`, `toys.sections.*`, `toys.disclaimer.*`, or the matching wine/other keys.

## Scope (per user)

Translate **everything** visible in the edit form into all 24 EU languages, for **all templates** (toys + wine + other):
- Section titles & descriptions
- Field labels, helper text, placeholders, tooltips
- Compliance disclaimer banner
- Option dropdown values (toys already done last turn — verify only)
- Any other hardcoded English in the editor chrome (TBD chip, "Required" badge, save bar, etc.)

## Plan

### 1. Audit hardcoded strings in the editor surface
Grep `CategoryQuestions.tsx`, `PassportForm.tsx`, `WineFields.tsx`, and the toy/wine preview wrappers for any string literals not already routed through `t(...)`. Add new keys under a single `editor.*` namespace (e.g. `editor.required`, `editor.tbd`, `editor.save`, `editor.translate`, etc.). Replace literals with `t('editor.x', 'English fallback')`.

### 2. Toys template (the big one)
Generate a complete `toys.fields.*`, `toys.sections.*`, `toys.disclaimer.*` tree in `en.json` by walking `src/templates/toys.ts` programmatically (one-off script under `scripts/extract-toys-i18n.ts`) so every `labelKey`, `helpKey`, `placeholderKey`, `titleKey`, `descriptionKey` referenced by the template has a matching English entry.

### 3. Wine & Other templates
Wine and Other templates don't currently carry `labelKey`/`titleKey` on their fields. Add them (mirroring the toys helper pattern) and create `wine.fields.*` / `wine.sections.*` / `other.fields.*` / `other.sections.*` trees in `en.json`. Wine's custom `WineFields.tsx` editor will also be swept for hardcoded labels (same `t(key, fallback)` treatment).

### 4. Propagate to 23 other locales
Extend `scripts/translate-toys-i18n.ts` (the existing translation script) to cover the new `toys.fields/sections/disclaimer`, `wine.fields/sections`, `other.fields/sections`, and `editor.*` trees. Run it once to produce professional regulatory translations in BG, CS, DA, DE, EL, ES, ET, FI, FR, GA, HR, HU, IT, LT, LV, MT, NL, PL, PT, RO, SK, SL, SV. Terminology follows existing project standards (TSR, REACH, "Regulations", etc.).

### 5. Tests & verification
- `duplicateKeys.test.ts` and `locales.test.ts` must stay green.
- Extend `audit.test.ts` so any `labelKey`/`titleKey`/`helpKey`/`placeholderKey`/`descriptionKey` referenced by any template in `src/templates/*.ts` is required to exist in every locale file (prevents future regressions).
- Add a render test that mounts `CategoryQuestions` for toys with `i18n.changeLanguage('el')` and asserts the Greek string appears for at least "Brand name", "Manufacturer responsibility", and the disclaimer title.
- Manual: open a toy DPP in preview, switch to Greek / French / German / Polish, confirm every label, section, helper, placeholder, and the disclaimer renders in the target language.

### 6. Out of scope
- Public passport view (already done last turn).
- Setup wizard and legal pages (intentionally static — memory `localization-scope`).
- The 11 deferred category templates (no UI exposes them).

### Files touched
- `src/templates/toys.ts` (verify), `src/templates/wine.ts`, `src/templates/other.ts` — add `labelKey`/`titleKey`/etc.
- `src/components/CategoryQuestions.tsx`, `src/components/WineFields.tsx`, `src/pages/PassportForm.tsx` — replace any remaining literals with `t()`.
- `scripts/extract-toys-i18n.ts` (new), `scripts/translate-toys-i18n.ts` (extend).
- All 24 `src/i18n/locales/*.json`.
- `src/i18n/locales/audit.test.ts` + new render test.
