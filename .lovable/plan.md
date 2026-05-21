## Scope

Add four regulatory fields to the toys DPP — CE marking declaration, EU Declaration of Conformity, Safety assessment & technical documentation, and Instructions/warnings — wire them into the form, the published public passport, and 24 EU language locale files.

## Template changes — `src/templates/toys.ts`

**Extend `compliance` section** (replace the bare `ce_marked` checkbox and add new fields):

1. `ce_declaration_ack` — `checkbox`, `required: true`, label = the fixed legal statement ("The manufacturer declares that this toy complies …"), `helpKey` = the helper text ("Only toys bearing CE marking can be placed on the EU market…"). Replaces the existing `ce_marked` semantics (we keep `ce_marked` as a hidden mirror so the existing `getRequiredLogos()` still triggers the CE logo).
2. `eu_doc_available` — `select` YES_NO_UNKNOWN, `required: true`.
3. `eu_doc_reference` — `text`, required when `eu_doc_available === 'yes'`, `showWhen`.
4. `eu_doc_upload` — `file` (PDF/image, 5 MB), `showWhen yes`, marked **internal** (see base change below).
5. `safety_assessment_completed` — `select` YES_NO_UNKNOWN, `required: true`, with helper text about chemical/physical/mechanical… risks.
6. `technical_documentation_available` — `select` YES_NO_UNKNOWN, `required: true`.
7. `technical_documentation_upload` — `file`, `showWhen yes`, **internal**.

Each of the three yes/no/unknown fields uses a new `warnWhen` declaration so that selecting `no` or `unknown` shows the regulatory warning text under the field (see base change).

**Extend `product_identity` section** with the instructions toggle:

8. `has_instructions_warnings` — `select` YES_NO, `required: true`.
9. `public_instructions_warnings` — `textarea`, required when `yes`, helper text per spec.

## Base template changes — `src/templates/base.ts`

Add two optional properties to `TemplateQuestion`:

- `internal?: boolean` — file/text fields flagged internal are never rendered in the public DPP; the form shows a small "Internal — not shown publicly" badge next to the upload.
- `warnWhen?: { equals: unknown[]; messageKey: string; message: string }` — when current value matches, the form renders a warning callout under the field.

Both are additive; no existing fields change behaviour.

## Form rendering — `src/components/passport/QuestionRenderer.tsx` (or equivalent)

- Render the "Internal" badge for `internal === true` file/text inputs.
- Render a warning callout (existing warning styling) when `warnWhen` matches.
- Validation rule: form cannot be submitted if any `required` field is empty — already enforced; just confirm the new fields are picked up.

## Public passport — `src/components/toys/ToyPublicPassport.tsx`

- In the Compliance block, render:
  - The CE declaration statement (always shown when `ce_declaration_ack === true`).
  - "Declaration of Conformity: <status> — Ref: <eu_doc_reference>" when available. Never link `eu_doc_upload` publicly.
  - "Safety assessment: <status>" and "Technical documentation: <status>". Never link `technical_documentation_upload` publicly.
- New "Instructions and warnings" sub-block under product identity / safety, showing `public_instructions_warnings` when `has_instructions_warnings === 'yes'`.

## i18n — `src/i18n/locales/*.json` × 24

Add the new keys under `toys.sections.compliance.*`, `toys.questions.<id>.*` (label / help / warn), `toys.options.yesNoUnknown.*` (reuse existing if present), and `toys.public.*` (status labels, "Instructions and warnings", "Internal — not shown publicly", legal statement).

English authored manually (regulatory wording must be exact). Other 23 locales generated via the existing `translate-text` edge function (gemini-2.5-pro), preserving professional regulatory acronyms (UE in FR/IT/ES/PT/RO, EU in others) and the term "CE marking" unchanged.

`src/i18n/audit.test.ts` will fail until all 24 locales contain the new keys — that is the regression lock.

## Tests

- `src/templates/__tests__/toys.test.ts` — assert new fields exist with correct `required`, `showWhen`, `internal`, `warnWhen`.
- `src/components/toys/__tests__/ToyPublicPassport.test.tsx` — assert internal uploads never render in public DOM; assert CE statement and DoC reference render.
- i18n audit catches missing keys in any of 24 locales.

## Out of scope

- Changing `ce_marked` storage shape for existing published DPPs (back-compat: if `ce_declaration_ack` missing but `ce_marked === true`, treat as acknowledged).
- A separate "mark this upload public" toggle per file — defaults to internal as specified; making it user-toggleable can come later.
- Stale signup toast, en-GB sweep, live preview language picker (tracked separately).
