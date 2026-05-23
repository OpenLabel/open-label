## Bug

On a published DPP, switching language in the picker translates the product content (names, descriptions, ingredient translations) but UI labels stay in English.

## Root cause

- **`src/components/toys/ToyPublicPassport.tsx`** hardcodes ~80 English strings as JSX literals: section titles ("Product identity", "Manufacturer", "Compliance", "DPP infrastructure", "EU operator information", "Safety incident reporting", "Authorised representative", "EU responsible economic operator"), row labels ("Brand", "Model", "Toy category", "Intended age group", "Unique identifier", "Address", "Email", "Website", "CE marking", "Applicable legislation", "Harmonised standards", "Common specifications", "Notified body", "Customs code", "DPP version", "Last updated", "Status", "DPP service provider", "Backup copy reference", …), the header badge ("🧸 Toy — Digital Product Passport"), table headers ("Substance", "Concentration", "Component"), status chips ("Not declared", "Published"), and the report-button labels. Only a handful of strings actually go through `t()`.
- **`src/pages/PublicPassport.tsx`** (generic fallback used by category "other") renders `section.title` and `question.label` directly from the template files (`src/templates/*.ts`), which are plain English strings — so those don't translate either.
- **`src/components/wine/WinePublicPassport.tsx`** already routes labels through `t()` / `i18n.getFixedT(displayLanguage)`, so it's not affected.

The language picker itself is wired correctly — in public (non-preview) mode it calls `i18n.changeLanguage(lang)`, and `getFixedT(displayLanguage)` returns the right bundle. The strings just never asked the i18n system.

## Fix

### 1. ToyPublicPassport — replace every hardcoded UI string with `t('toyPublic.<key>')`

- Continue using `const t = i18n.getFixedT(displayLanguage)` so the view stays in sync with both public-mode (`i18n.language`) and preview-mode (`previewLanguage`).
- Add a new namespace section `toyPublic` to `src/i18n/locales/en.json` covering: header badge, all `SectionTitle` strings, all `<Row label="…">` strings, subsection titles (Authorised representative, EU responsible economic operator), the "Not declared" chip, table headers (Substance, Concentration, Component, plus any others in the fragrances block), the "Safety incident reporting" block including button copy "Report an unsafe product", and the DPP-infrastructure rows including "Published".
- Do not change layout, ordering, or business logic.

### 2. Generic PublicPassport (`other` category) — translate template-driven labels

- For each section/question rendered from `template.sections`, look up a translated label via a key like `templates.<category>.sections.<index>.title` and `templates.<category>.questions.<id>.label`, falling back to the existing English string from the template if the key is missing. This keeps the change additive and safe.
- Add the keys for the `other` template (the only category currently using this fallback view) to `en.json`. Wine and toys bypass this code path, so no keys are needed for them here.

### 3. Translate to all 24 EU languages

- Add the same keys to all 24 locale files (`bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv`) using professional regulatory terminology consistent with existing translations (per the project's localization standards memory). Run a one-off script under `/tmp` to insert keys, then have me hand-review the regulatory-sensitive terms (CE marking, harmonised standards, notified body, applicable legislation, etc.).
- The locale audit test and `duplicateKeys` test must pass.

### 4. Verification

- `bunx vitest run` — all tests, including locale audit and i18n completeness, must stay green; coverage threshold unchanged.
- Manually switch the picker on the sample toy DPP in preview and confirm every section title and field label changes; repeat for a couple of EU languages.
- Confirm Wine DPP behavior is unchanged.

## Out of scope

- Wine view (already localized).
- Translating template field values (only labels). User-entered content continues to use the existing `_translations` map / `tr()` mechanism.
- Touching the language picker itself or the i18n bootstrap.
