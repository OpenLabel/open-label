## Goal

Close the toy AI autofill schema gaps identified in the previous test, then re-run against the same PDF.

## Changes

**File: `supabase/functions/toy-label-ocr/index.ts`**

1. Add 6 properties to `EXTRACTION_TOOL.function.parameters.properties`:
   - `has_instructions_warnings` — enum `yes`/`no`
   - `public_instructions_warnings` — string (the warning text itself)
   - `eu_doc_available` — enum `yes`/`no`
   - `eu_doc_reference` — string (DoC reference — distinct from `certificate_reference`, which is the notified-body certificate)
   - `safety_assessment_completed` — enum `yes`/`no`
   - `technical_documentation_available` — enum `yes`/`no`

2. Extend `SYSTEM_PROMPT` with two short rules:
   - When the packaging/document literally states "EU Declaration of Conformity: yes", "Safety assessment: yes", "Technical documentation: yes" → populate the matching yes/no field. Same for an explicit "no".
   - When `ce_marked=true` but no 4-digit notified body number is visible, set `notified_body_involved="no"` (instead of omitting).

3. Also instruct the model to copy any visible warning text ("Not suitable for children under 36 months…", "Choking hazard", "WARNING:…") into `public_instructions_warnings` and set `has_instructions_warnings="yes"`.

## Out of scope

- No rename of `certificate_reference` — the form template has BOTH `certificate_reference` (NB cert, shown when `notified_body_involved=yes`) and `eu_doc_reference` (DoC ref). They are intentionally distinct.
- No file-size cap change — the toy OCR function has no explicit cap; the original 7 MB note was inaccurate.
- No form/UI/i18n changes — all 6 fields already exist in `src/templates/toys.ts` with full 24-language coverage.

## Validation

Re-run the same gateway extraction against `/tmp/sample-wine-dpp.pdf`… wait, that's wine. Re-run against the toy PDF (`Open_Label_.eu_-_Free_Digital_Product_Passports.pdf` from the previous turn — `/tmp/sample-toy-dpp.pdf`) and report the new coverage (expected ~32/36 visible fields, up from 27).
