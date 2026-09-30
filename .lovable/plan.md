# Apparel field label sentence case

## Scope
- Update every top-level field `label` in the specified Apparel sections, excluding `responsible_operators` and `product_name`.
- Apply natural English sentence case while preserving required acronyms, certification names, technical units, and meaningful proper-name groupings.
- Make the matching `textiles.fields.<id>.label` values in the English locale identical.
- Leave help text, placeholders, option labels, and all non-English locales unchanged.

## Verification
- Add or update focused tests to enforce source and English-locale label parity and sentence-case expectations.
- Run the complete test suite without lowering thresholds.
- Report every changed label as an exact before to after pair and the final pass/fail count.

## Technical details
- Derive the affected field IDs from the section boundaries in `src/templates/textiles.ts` to avoid changing dropdown options.
- Preserve tokens such as GTIN, EAN, SKU, EU, CE, PFAS, REACH, SVHC, RSL, EPR, DPP, LCA, GOTS, OEKO-TEX, GRS, bluesign®, Fair Trade, and technical parentheticals.
