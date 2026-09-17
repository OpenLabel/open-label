# Apparel translation completion

## Scope
Translate only the existing `textiles.*` values in the 24 non-English locale files. Keep the English locale, Apparel template, question IDs, option values, other categories, and security policies unchanged.

## Implementation
1. Add `scripts/translate-textiles-i18n.ts` using the existing translation workflow.
   - Read the canonical 288-leaf `textiles.*` tree from English.
   - Support all 24 non-English locales and optional locale arguments for small, resumable runs.
   - Skip any target value already different from its English source.
   - Translate only values and reject responses with missing, extra, or structurally changed keys.
   - Preserve every required regulation number, standard identifier, scheme name, acronym, unit, temperature, URL/date placeholder, and example code exactly.
   - Save only the target locale’s `textiles.*` values while preserving every other locale key and the existing two-space JSON formatting.

2. Make fibre terminology deterministic rather than trusting free-form translation.
   - Include the legal constraints in every translation prompt.
   - Maintain a reviewed per-locale glossary for every `textiles.options.primaryFiber.*` value, based on Regulation (EU) 1007/2011 Annex I terminology.
   - Apply that glossary after translation, including localized qualifiers for organic cotton and recycled polyester.
   - Validate that no fibre label contains `Rayon`, `Tencel`, `Spandex`, or `Nylon`, and that all fibre keys are present.

3. Add script-level safety checks before writing each locale.
   - Verify leaf-key counts and paths exactly match English.
   - Verify protected identifiers remain present verbatim wherever they occur in the English source.
   - Reject empty values, malformed responses, untranslated ordinary English values, and unexpected changes outside `textiles.*`.
   - Print per-locale translated, skipped, unchanged-protected, and unresolved counts so completion can be reported accurately.

4. Run translation locale by locale, reviewing failures and rerunning only incomplete locales. Do not clear the debt while any ordinary Apparel value remains English or any legal fibre term is uncertain.

5. After all 24 locales pass validation:
   - Set `PENDING_TRANSLATION_PREFIXES` to an empty array while retaining `isTranslationPending` and its call sites.
   - Update the audit guard to assert that no translation debt is outstanding.

## Verification
- Compare every locale against English: exactly 288 `textiles.*` leaves and identical key paths.
- Audit all legal fibre labels against the per-locale Annex I glossary and run the forbidden-brand-name check.
- Run the complete test suite without lowering thresholds or skipping tests.
- Confirm `locales.test.ts`, `templateKeys.test.ts`, `audit.test.ts`, `zh-cn.completeness.test.ts`, and `duplicateKeys.test.ts` pass.
- Report the exact changed-key count per locale, any unresolved value, and any uncertain official fibre term. If anything remains uncertain or English, leave the debt active and report the blocker instead of claiming completion.

## Assumption
Simplified Chinese is translated professionally but is not an EU official-language Annex I version; its fibre labels will use standard Simplified Chinese textile terminology while the 23 non-English EU official languages use Annex I terms.
