## Goal
Bring the wine form's full translation UX to the toys form — manual `TranslationButton` plus AI auto-translate-on-debounce — for every public free-text field, reusing the existing `useAutoTranslate` hook and `TranslationButton` component unchanged.

## What "exactly like wine" means here
Wine fields (e.g. grape variety, vintage, region):
- An inline `TranslationButton` sits next to the input.
- `useAutoTranslate` debounces value changes (1.5–3s) and calls the existing translate edge function to fill the other 23 EU languages.
- User-edited translations are protected via `markAsUserEdited`.
- Translations live on `category_data` under `<field>_translations`.
- The public DPP prefers `translations[currentLang]` over the raw value.

We will reuse: `useAutoTranslate`, `TranslationButton`, the translate edge function — no new translation infra.

## Toys fields to make translatable
Public-facing free text only:
- `public_instructions_warnings` (textarea)
- `allergen_declaration_text` (textarea — already auto-generated, but editable)
- `common_specifications` (textarea)
- `other_standards` (textarea)
- `brand_name` (text) — optional; brand names are usually not translated. Include behind the same flag so it works if a user wants localized branding, but auto-translate stays off by default.

Excluded: identifiers, addresses, emails, URLs, dates, codes, regulatory references.

## Technical sketch
1. **`src/templates/base.ts`** — add `translatable?: boolean` to `TemplateQuestion`. Add an optional `autoTranslate?: boolean` (default true when `translatable`).

2. **`src/templates/toys.ts`** — set `translatable: true` on the four textarea fields above. Leave `brand_name` as `translatable: true, autoTranslate: false` so brand names don't auto-fan-out unless the user clicks the button.

3. **New component `src/components/TranslatableField.tsx`** — wraps a single `Input` or `Textarea` and:
   - Accepts `{ id, value, onChange, translations, onTranslationsChange, sourceLanguage, fieldLabel, multiline, placeholder, autoTranslate }`.
   - Calls `useAutoTranslate({ value, sourceLanguage, existingTranslations: translations, onTranslationsGenerated, enabled: autoTranslate && !!value.trim(), debounceMs: 3000 })`.
   - Renders the input + a `TranslationButton` in a `flex gap-2` row, plus the same "Translating…" muted hint wine uses.
   - On manual save from `TranslationButton`, marks each lang as user-edited before calling `onTranslationsChange`.
   - This isolates the hook call so it stays stable per field (hooks rules satisfied because each translatable field becomes its own component instance, keyed by `question.id`).

4. **`src/components/CategoryQuestions.tsx`** — in the `text` and `textarea` render branches, when `question.translatable`, render `<TranslatableField multiline={type==='textarea'} ... />` reading/writing `data[`${question.id}_translations`]` via `handleChange`. Non-translatable fields keep current rendering.

5. **`src/components/toys/ToyPublicPassport.tsx`** — add a tiny helper:
   ```ts
   const tr = (id: string) => {
     const t = d[`${id}_translations`] as Record<string,string> | undefined;
     return t?.[currentLang] || (d[id] as string) || '';
   };
   ```
   Use it for the four fields when rendering. `currentLang` already exists (used by language switcher); confirm during implementation.

6. **Tests**
   - `src/templates/toys.test.ts`: assert the four fields carry `translatable: true`.
   - `src/components/TranslatableField.test.tsx`: render shows input + button; typing triggers `onChange`; mock `useAutoTranslate` to verify it's wired with the right args.
   - `src/components/CategoryQuestions.test.tsx` (or extend existing): renders `TranslationButton` next to a translatable textarea, not next to a non-translatable one.
   - `src/components/toys/ToyPublicPassport.test.tsx`: when `public_instructions_warnings_translations.fr` is set and lang=fr, the French text shows.

## Out of scope
- Translating select option labels (already i18n'd at the locale layer).
- Building a new translate endpoint — we reuse the wine one as-is.
