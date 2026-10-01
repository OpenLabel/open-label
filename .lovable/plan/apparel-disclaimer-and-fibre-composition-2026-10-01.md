# Apparel disclaimer and fibre composition

## Scope
Implement two independent Apparel-only changes without altering any other category.

## 1. Apparel compliance disclaimer
- Add an Apparel-specific informational disclaimer in `CategoryQuestions`, using the same rendering pattern as Toys.
- Exclude Apparel from the generic Early Alpha warning while leaving that fallback unchanged for all other applicable categories.
- Add the approved title and text under new `textiles.disclaimer.*` keys in English and professionally translate both keys across all 24 supported non-English locales.
- Add focused tests proving Apparel shows its disclaimer, does not show Early Alpha, and unaffected categories retain existing behavior.

## 2. Structured fibre composition
- Define one shared fibre option list in the Apparel template and use it for both primary and secondary fibre selectors.
- Add a `none` option for single-fibre products, while preserving existing stored legacy values without migration.
- Make `full_composition` optional and describe/render it as supplementary extended composition detail.
- Generate the public composition from the structured fields using translated fibre option labels, for example `80% Cotton, 20% Recycled Polyester`; omit the secondary part when it is `none` or incomplete.
- Replace fuzzy secondary-fibre warning detection with direct membership in `SYNTHETIC_FIBER_IDS`.
- Add or update Apparel tests for shared dropdown options, optional full composition, translated generated composition, supplementary detail, and exact synthetic-fibre matching.

## Verification
- Run the complete test suite without changing thresholds or skips.
- Check the current preview build status after edits.
- Report exact pass/fail totals and the complete changed-file list, confirming no other category files changed.
