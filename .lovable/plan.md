## Goal

Wrap up the toy i18n work: (1) visually verify FR form + DE preview show no English, (2) add a targeted template-keys audit test.

## Step 1 — Browser verification

1. `navigate_to_sandbox` to the dashboard, log into the existing preview session.
2. Switch app language to **Français**.
3. Create or open a Toy DPP → screenshot the form sections (Identity, Manufacturer, Compliance, Safety, Allergens, Warnings).
4. Open the preview/public passport, switch preview language to **Deutsch**, screenshot.
5. Report any English leftovers (excluding user-entered free text and the allow-listed proper nouns already documented in `audit.test.ts`).

## Step 2 — Template-keys audit test

Add `src/i18n/locales/templateKeys.test.ts` that:

- Imports `categoryTemplates` (or directly `toysTemplate`) from `src/templates/toys.ts`.
- Walks every field and section, derives the required i18n keys:
  - `toys.fields.<id>.label` (always)
  - `toys.fields.<id>.hint` (only if `hint` / `hintKey` is set on the field)
  - `toys.fields.<id>.options.<value>` (for each enum option)
  - `toys.sections.<id>.title`
  - `toys.disclaimer.*` keys referenced via `disclaimerKey`
- For each of the 24 EU locales, asserts every required key resolves to a non-empty string.
- Fails with a clear message listing the locale + missing key path.

Test is **additive**: it doesn't change the existing `audit.test.ts`, just narrows the scope to template-derived keys so a future field addition without translations is caught immediately.

## Out of scope

- No production code or template changes.
- No re-running of `translate-toys-i18n.ts` (all 24 locales are already complete per `bun -e` field count check).
- No threshold/coverage changes.

After implementation, I run the new test (and the full audit test) and report results.
