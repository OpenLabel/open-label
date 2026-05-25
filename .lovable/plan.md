## Problem

On the public Toy DPP, switching the language translates UI labels but leaves several **value strings** in English (visible in the Greek screenshot):

- Status chips: `yes` / `no` (EU DoC, Safety assessment, Technical documentation, etc.)
- Applicable legislation list: `Regulation (EU) 2025/2509 — Toy Safety Regulation`, GPSR, REACH, CLP, RED, LVD, EMC, RoHS, BATTERIES, AI Act, CRA, MSR, Drones, Cosmetics
- Harmonised standards list: `EN 71-1 — Mechanical and physical properties`, EN 71-2…-14, EN IEC 62115, common spec
- Customs code suffix: `95 — Toys, games and sports requisites` and the other CN chapters
- Fragrance fallback sentence and `Other` fallbacks
- A few rows that use `t('toys.public.*', 'English fallback')` whose keys don't exist in any locale yet (`docLabel`, `safetyAssessmentLabel`, `technicalDocsLabel`, `yesNoUnknown.*`, `certificateDownload`, `docReference`, `ceDeclarationStatement`)
- Also: operator-id-type, toy category, age group, identifier type, safety channel, EU operator role labels (used in manufacturer / auth-rep / EU op blocks)

Root cause: `src/templates/toys.ts` already wires each option with a `labelKey` (e.g. `toys.options.legislation.TSR`), but (a) `labelFor` / `labelsFor` in `ToyPublicPassport.tsx` ignore `labelKey` and just return `option.label`, and (b) **none** of those `toys.options.*` keys exist in any of the 24 locale JSON files.

## Fix

### 1. `src/components/toys/ToyPublicPassport.tsx`
- Change `labelFor` / `labelsFor` to accept the `t` function and, for each option, return `t(option.labelKey, option.label)` so the English `label` is only the fallback.
- Replace the `'Other'` literal fallbacks on lines 114 / 119 with `t('toyPublic.values.other')`.
- Replace the bare `String(d.eu_doc_available)` fallback with the resolved `yesNoUnknown` key (already attempted with fallback — will now resolve once keys exist).
- Keep unit suffixes like `mg/kg` untranslated (international unit).

### 2. `src/i18n/locales/en.json` — add the missing English keys (source of truth)
- `toys.public.ceDeclarationStatement`, `docLabel`, `docReference`, `safetyAssessmentLabel`, `technicalDocsLabel`, `certificateDownload`, `yesNoUnknown.{yes,no,unknown}`
- `toyPublic.values.other`
- `toys.options.operatorIdType.{EORI,GLN,LEI,VAT,NATIONAL,DUNS,ESPR,other}`
- `toys.options.toyCategory.*` (all 27 values)
- `toys.options.ageGroup.*` (all 14)
- `toys.options.identifierType.*` (8)
- `toys.options.cnChapter.*` (20) — long descriptive form (e.g. "95 — Toys, games and sports requisites")
- `toys.options.legislation.*` (15) — long regulation names
- `toys.options.standards.*` (12) — long EN 71-x descriptive form
- `toys.options.safetyChannel.{phone,email,website,form}`
- `toys.options.euOperatorRole.{importer,auth_rep,fulfilment,distributor,other}`

Source labels are pulled directly from `src/templates/toys.ts` so the English copy stays consistent with the form.

### 3. All 23 other locale files (`bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv`)
- Add the **same key tree** with professional regulatory translations.
- Use the existing `scripts/translate-toys-i18n.ts` pattern (Gemini 2.5 Pro auto-translation, JSON parse with regex fallback, 16000-token budget per request) extended to cover the new namespaces — same approach used for the previous `toyPublic` rollout.
- Manual review of regulatory-critical terms (TSR / GPSR / REACH / CLP / CE / harmonised standards / Safety Gate) in each language against existing professional acronyms already in the locale files (memory: `i18n/terminology-standards`).

### 4. Audit & tests
- Update `src/i18n/locales/audit.test.ts` only if the new English values trigger false positives (e.g. proper-noun cognates).
- `src/i18n/locales/duplicateKeys.test.ts` and `locales.test.ts` must pass (no duplicate keys, all 24 locales have identical key set).
- Full suite `bunx vitest run` must stay green (≥ 30 % coverage threshold; do not lower).

### 5. Out of scope
- The **edit form** still uses English labels via `options[].label` — switching the form to `labelKey` is a separate change and the user hasn't asked for it. Public view only.
- Wine view (unaffected).
- Generic `PublicPassport` for the "Other" category.

## Verification

1. `bunx vitest run` → all green, coverage ≥ 30 %.
2. Manually open the sample toy DPP in the preview, switch language picker to Greek, French, German, Polish, and confirm: yes/no chips, every legislation bullet, every EN 71 bullet, CN chapter description, fragrance sentence, "Other" fallbacks, and the EU DoC / Safety assessment / Tech docs rows all render in the target language.
3. Confirm the row **labels** are unchanged (already worked) and the Wine DPP is unchanged.
4. Publish required for the change to reach `open-label.eu`.
