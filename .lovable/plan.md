## Toys DPP — finalize spec compliance (revised)

All five gap fixes you approved, plus two updates you requested:
- Question labels in `toys.ts` (and category templates generally) **will** be translated, not left hardcoded English.
- The translation script uses a stronger model with full regulatory context, not Flash.

### 1. `mouth_contact` question

Add a yes/no `mouth_contact` field to the Product identity section of `src/templates/toys.ts` (required, badge `required`). In `src/components/CategoryQuestions.tsx`, broaden the existing under-36-months warning trigger so `mouth_contact === 'yes'` also fires the stricter-restrictions banner.

### 2. Real certificate upload (replaces checkbox)

- Add a new `file` question type to `src/templates/base.ts`.
- In `toys.ts`, replace `certificate_uploaded` (checkbox) with `notified_body_certificate_url` (type `file`, badge `where_applicable`, `showWhen` notified body = yes).
- In `CategoryQuestions.tsx`, add a `case 'file'` renderer that uploads to the existing `passport-images` bucket under `{user.id}/certificates/`, accepts `application/pdf,image/*`, enforces a 5 MB limit, and stores the resulting public URL in `category_data[question.id]`. Show preview link + remove button.
- In `ToyPublicPassport.tsx`, render the URL as a "Conformity certificate" download link when present.

### 3. Toys-specific required-field validation

In `src/pages/PassportForm.tsx`, when `formData.category === 'toys'`, block save on empty `image_url` (toast `toys.validation.imageRequired`) or empty `description` (toast `toys.validation.descriptionRequired`).

### 4. Refactor: translatable category-template content (NEW SCOPE)

The current engine renders `question.label`, `question.helpText`, and `option.label` as raw English strings. This will be refactored so all template-defined text flows through `t()`.

- Extend `src/templates/base.ts` `Question` and option types with optional `labelKey`, `helpKey`, and per-option `labelKey` (string i18n keys). Backward compatible: when `labelKey` is absent, fall back to the literal `label`.
- Add a single helper `tLabel(t, q)` / `tOption(t, o)` used by `CategoryQuestions.tsx` (and any other template renderer) so all template text passes through i18n at one chokepoint.
- For every question, option, and section in `src/templates/toys.ts`, set a `labelKey` / `helpKey` under a clear namespace, e.g. `toys.fields.<question_id>.label`, `toys.fields.<question_id>.help`, `toys.fields.<question_id>.options.<value>`, `toys.sections.<section_id>.title`. Same treatment for `src/templates/wine.ts` so the engine is consistent (no behavior change for wine if the English strings stay byte-identical, but locales will then translate them).
- Update the existing `validTypes` / template tests to assert that every question has a `labelKey` for `toys` and `wine`.

### 5. UI-string translations

- Add a `toys` namespace to `src/i18n/locales/en.json` covering:
  - Section titles and every question label/help/option from `toys.ts` (per §4 above).
  - Form-side banners: disclaimer, three warnings (under-36-months, mouth contact, unknown allergens), suggest-legislation list, EU Safety Gate notice, validation toasts, certificate upload labels.
  - `FragrancePicker.tsx` UI: empty state, add button, dialog title, search placeholder, column labels, the three checkbox labels, done/remove/no-results.
  - `ToyPublicPassport.tsx`: every row label (Brand, Model, SKU, Toy category, Age group, Identifier, Manufacturer, Address, Email, Website, Operator identifier, Role, Legal name, CE marking / marked / not declared, Applicable legislation, Harmonised standards, Common specifications, Other standards, Notified body, Number, Certificate, Customs code, DPP service provider, Backup reference, DPP version, Last updated, Status, Published), section titles, sole-responsibility paragraph, fragrance table headers (Substance, CAS, Concentration, Component) and safety-reporting labels (Telephone, Email, Web, EU Safety Gate Portal, Report an unsafe product).
- Switch every hardcoded English string in `CategoryQuestions.tsx`, `FragrancePicker.tsx`, and `ToyPublicPassport.tsx` to `t('toys.…')` calls.

### 6. Translate to 23 EU locales — stronger model, full context

A one-off script at `scripts/translate-toys-keys.ts`:
- Loads the new `toys` subtree from `en.json` and the full text of the toys regulation spec (`Regulation (EU) 2025/2509` summary kept alongside the script as a context file).
- For each of the 23 target locales (bg/cs/da/de/el/es/et/fi/fr/ga/hr/hu/it/lt/lv/mt/nl/pl/pt/ro/sk/sl/sv), calls the Lovable AI Gateway with **`google/gemini-2.5-pro`** (no Flash), `responseFormat: json_schema` mirroring the EN structure, and a system prompt that includes:
  - The full regulatory context (toy-safety terminology, CE marking, notified body, GPSR, TSR, harmonised standards, allergenic fragrances, mouth-contact restrictions).
  - The target language's ISO code, native name, and official EU regulatory register conventions for that language.
  - Instructions to preserve placeholder syntax (`{{list}}`), keep accepted English acronyms (CE, GPSR, TSR, CAS, EU, DPP, ISO, IEC, CN), and produce translations consistent with the existing locale's regulatory wording (script reads a few representative existing keys per locale to anchor tone).
- Writes results into each `src/i18n/locales/<code>.json` at the same nested path, preserving order and surrounding keys.
- Failures (rate limit, validation mismatch, missing key) are retried per-locale with exponential backoff and surfaced loudly; the script exits non-zero if any locale ends up with < 100% of the EN keys.
- Script is committed so we can regenerate translations when the toys text evolves.
- `src/i18n/locales/locales.test.ts`, `audit.test.ts`, and `duplicateKeys.test.ts` enforce key parity and untranslated-string detection on the resulting files.

### 7. Verification

- `bunx vitest run` — keep all current tests green and verify the new template-engine translation test and translation completeness tests pass.
- Manual: create a toys passport, leave image empty → blocked; upload a certificate → public view shows the download link; switch UI language to FR and DE → all toy section titles, field labels, and warnings render translated.

### Files changed

```text
src/templates/base.ts                          (file type, labelKey/helpKey support)
src/templates/toys.ts                          (mouth_contact, file cert, labelKey on every field)
src/templates/wine.ts                          (labelKey on every field, for consistency)
src/components/CategoryQuestions.tsx           (file renderer, mouth-contact warning, tLabel/tOption)
src/components/toys/FragrancePicker.tsx        (t() calls)
src/components/toys/ToyPublicPassport.tsx      (t() calls + certificate link)
src/pages/PassportForm.tsx                     (toys image+description validation)
src/i18n/locales/en.json                       (toys.* namespace + template field keys)
src/i18n/locales/{bg,cs,da,de,el,es,et,fi,fr,ga,hr,hu,it,lt,lv,mt,nl,pl,pt,ro,sk,sl,sv}.json
scripts/translate-toys-keys.ts                 (gemini-2.5-pro batch translator with regulatory context)
scripts/toys-regulatory-context.md             (context file injected into the translation prompt)
src/templates/toys.test.ts, base.test.ts, allTemplates.test.ts  (labelKey assertions, file type)
```

### Out of scope

- Collapsible sections and progress bar (you declined).
- File uploads for supplier declaration and per-fragrance test reports (still boolean flags).
- AI autofill for toys.
