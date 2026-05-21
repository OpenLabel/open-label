## Goal
Let users save and publish a DPP even when template-`required` fields are empty, and surface a clear non-blocking warning listing which mandatory fields are still missing.

## Current state
- `PassportForm.handleSubmit` only hard-blocks on: product name, plus (for toys) image and description. Template `required: true` fields are not enforced.
- `CategoryQuestions` already renders a red asterisk next to required fields but no summary.
- The toys-specific disclaimer Alert lives at the top of `CategoryQuestions` output.

So nothing needs to be relaxed — only the warning UI is missing.

## Change
Add a "Missing mandatory fields" alert rendered just below the existing legal disclaimer (the `toys.disclaimer` Alert for toys; for non-toys categories, render it at the top of the questions block above the first section).

### Behavior
- Iterates every section + question in the active template; respects `evaluateShowWhen` so hidden conditional fields are not flagged.
- A field counts as missing when `question.required === true` AND value is `undefined`, `null`, `''`, `false` (for checkboxes), or `[]` (for `multi_select`).
- Also flags the top-level prerequisites that block save today (product name; toys image; toys description) so the warning matches the eventual publish-time reality, but does NOT change `handleSubmit` blocking for those — they remain hard requirements (image/description are TSR-mandatory for toys).
  - Actually: per the user's instruction, relax these too so the DPP can always be saved. Move the toys image/description checks from hard-block to the warning list. Keep product name as the only hard block (a passport needs a name to exist).
- Renders as an amber/warning Alert (same style as existing `toyWarnings`) with:
  - Title: "Some mandatory fields are not filled" (translated).
  - Body: short sentence "You can still save and publish this DPP, but the following fields are required for full compliance:" followed by a bulleted list of the translated field labels, grouped by section title.
  - Hidden entirely when nothing is missing.

### Files touched
1. **`src/components/CategoryQuestions.tsx`** — compute `missingRequired: { sectionTitle, fieldLabel }[]` (memoized over `template` + `data` + `i18n.language`), render the new Alert right after the existing toys disclaimer / at the top for other categories.
2. **`src/pages/PassportForm.tsx`** — remove the two toys hard-blocks for `image_url` and `description`; keep the product-name check.
3. **`src/i18n/locales/en.json`** + 23 EU locale files — add three keys: `validation.missingRequiredTitle`, `validation.missingRequiredBody`, and reuse existing section/field label keys (no new per-field strings needed).
4. **Tests**
   - `src/components/CategoryQuestions.test.tsx` — add cases: alert hidden when no required field is empty; alert shows expected labels when some are; hidden required fields (failing `showWhen`) are not listed.
   - `src/pages/PassportForm.test.tsx` — toys passport with missing image/description can now be saved (no toast block), product name still blocks.

## Out of scope
- Changing what counts as "required" in the templates.
- Per-field inline validation messages — the asterisk + summary banner is the UX.
- Publish-gating logic (already absent today; user explicitly wants save to succeed).
