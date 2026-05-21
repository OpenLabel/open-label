## Goal

The toys public DPP doesn't show a language picker, so visitors can't switch to one of the 24 EU languages even though translatable fields now exist. Mirror the wine passport pattern.

## Changes

### `src/components/toys/ToyPublicPassport.tsx`
- Import `DPPLanguagePicker`.
- Extend props with optional `previewLanguage?: string` and `onPreviewLanguageChange?: (lang: string) => void` (same shape as wine).
- Compute `displayLanguage = previewLanguage || i18n.language.split('-')[0]` and use it inside `tr()` instead of `currentLang`. Also pass it to `useTranslation` via `i18n.getFixedT(displayLanguage)` (or replace `t` similarly to wine) so static labels in the toy passport also switch with the picker.
- Render the picker at the top of the page (above the header block), right-aligned, with `localOnly={isPreview}`, `currentLanguage={previewLanguage}`, `onLanguageChange={onPreviewLanguageChange}` — same JSX wrapper as `WinePublicPassport`.

### `src/components/PassportPreview.tsx`
- Pass `isPreview previewLanguage={previewLanguage} onPreviewLanguageChange={setPreviewLanguage}` to `<ToyPublicPassport>` (currently only `passport` and `isPreview` are forwarded).

### `src/pages/PublicPassport.tsx`
- No prop change needed (public route relies on global `i18n.language`, picker updates it via `localOnly={false}`).

## Out of scope
- Translating additional toy fields (already done in previous step for the five flagged fields).
- Changing the picker component itself or its language list.
- Tests beyond the existing render tests (can add a quick assertion that `DPPLanguagePicker` renders in `ToyPublicPassport` if desired).
