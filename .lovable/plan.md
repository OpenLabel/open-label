## Goal

Eliminate every English string from the toy edit form in all 24 EU languages. Only user-entered content (their own product name/description) may remain in whatever language the user typed it. Public DPP is already clean — focus is the edit form.

## Scope (English strings to translate)

For the toys template only:

1. Disclaimer block — title + body
2. Section titles + descriptions for: Manufacturer responsibility, Product identity, Manufacturer, Authorised representative, EU responsible economic operator, Compliance, Conformity assessment & notified body, Customs commodity code, Allergenic fragrances, Safety incident reporting
3. Every field label, placeholder, and helper text in those sections (full list collected above — ~35 fields)
4. Badge labels: "Required", "Where applicable"
5. Option labels still in English: Telephone, E-mail, (and any others surfaced when scanning options dropdowns)
6. EU Safety Gate block: heading + paragraph
7. Translation-status sentences and inline notices already wired in components but not yet keyed

## Implementation

1. **Templates** — `src/templates/toys.ts`: ensure every field has `labelKey`, `helpKey`, `placeholderKey`; every section has `titleKey`, `descriptionKey`; every option has `labelKey`; disclaimer + safety-gate + badges have keys. Same pass for wine.ts / other.ts for consistency.

2. **Components** — Replace remaining literal strings in `CategoryQuestions.tsx`, `WineFields.tsx`, `PassportForm.tsx`, the disclaimer renderer, the EU Safety Gate block, and the Required / Where-applicable badge components with `t(key, 'English fallback')`. Group under an `editor.*` namespace.

3. **Locales** — Generate the full `toys.fields/sections/disclaimer/options/badges/safetyGate` + `editor.*` trees in `en.json`, then run `bun run scripts/translate-toys-i18n.ts` in 4 small batches so each call stays under the 600 s sandbox timeout:
   - `fr de nl it pt es`
   - `pl cs sk hu ro bg`
   - `sv da fi et lv lt`
   - `hr sl mt ga el` (re-run el to pick up new keys)

4. **Tests** —
   - Extend `src/i18n/locales/audit.test.ts`: every `labelKey/titleKey/helpKey/placeholderKey/descriptionKey` referenced by any template must exist in all 24 locales.
   - Add a render test that mounts `CategoryQuestions` for the toys template with `i18n.changeLanguage('fr')` and asserts French strings for "Brand name", "Manufacturer responsibility", "Toys DPP — compliance disclaimer", and the EU Safety Gate paragraph.

5. **Verification** — Re-open the French toy edit form and confirm zero English remains (excluding user-entered content). Spot-check German and Finnish too.

## Out of scope

- Wine & Other public passports (already covered earlier)
- Setup wizard and legal pages (intentionally static per memory)
- The 11 deferred category templates
