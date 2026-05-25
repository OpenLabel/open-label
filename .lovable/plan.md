# Audit Toy form in Italian, fix English leftovers

## Steps

1. **Browse in Italian**: Switch app language to Italiano, open "Crea un giocattolo d'esempio" (toy creation form). Walk every section: Identity, Manufacturer, Authorised representative, Responsible economic operator, Compliance, Safety Gate, Instructions & warnings, Allergens/fragrances, Counterfeit protection, Disclaimer, action buttons, toasts.
2. **Capture leftovers**: Screenshot each section. List every English string found, with its DOM location and likely source (i18n key missing in `it.json`, hardcoded string in a `.tsx`, or generator like `generateAllergenDeclaration`).
3. **Classify**:
   - Missing `it` translation for an existing key → add to `src/i18n/locales/it.json` (and mirror to the other 23 locales if the key is also missing there).
   - Hardcoded English in a component → replace with `t('toys.…')` and add the key to all 24 locales.
   - Generator output (e.g. `toyFragrances.ts::generateAllergenDeclaration`) → make it i18n-aware using the already-existing `toys.allergens.*` keys, in all 24 locales.
4. **Re-verify in Italian**: Reload the form, confirm zero English leftovers (excluding user-entered free text and allow-listed proper nouns like "EU Safety Gate", "CE", brand names).
5. **Run tests**: `bunx vitest run src/i18n/locales/templateKeys.test.ts` plus any nearby i18n audits to confirm no regression. Do not lower thresholds.

## Out of scope
- DE preview re-check (already verified last turn).
- Schema/edge function changes.
- The known `generateAllergenDeclaration` issue will only be touched if it actually surfaces in the Italian form during the audit; otherwise left for a separate task.

## Deliverable
Updated locale files + minimal component edits so the Italian Toy form renders with no English leftovers, plus a short report listing what was fixed.
