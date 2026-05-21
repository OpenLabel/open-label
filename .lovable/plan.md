
# Fix toys i18n + live preview language picker

## 1. Toys i18n — populate all keys in 24 locales

**Root cause:** `toys.ts` references `toys.fields.*`, `toys.sections.*`, `toys.options.*`, `toys.ai.*`, `toys.warnings.*`, `toys.public.*` keys that don't exist in any locale file, so every label falls back to its hardcoded English default.

**Fix:**
1. **Source of truth — `en.json`:** generate the full `toys.*` subtree from `src/templates/toys.ts` itself (one-off script walks `sections[]`, `questions[]`, each `opts(...)` block) plus the hand-written `toys.ai.*`, `toys.warnings.mouth_contact`, `toys.public.*`, and certificate upload strings used in `CategoryQuestions.tsx` / `ToyPublicPassport.tsx`. Guarantees zero drift between template and locale.
2. **Translate to the 23 other EU languages** using the existing `translate-text` edge function (gemini-2.5-pro, batched — same pipeline used for wine). Write results into each `src/i18n/locales/{code}.json`. Keep professional regulatory acronyms per language (e.g. `UE` not `EU` in FR/IT/ES/PT/RO).
3. **Lock it in** by extending `src/i18n/locales/audit.test.ts` so the `toys.*` namespace is part of the strict-completeness check — future drift fails the build (per i18n audit policy).

## 4. Live Preview language picker is a no-op

**Root cause:** the toys preview (and `PassportPreview` wrapper) reads labels via the global `useTranslation()` bound to `i18n.language`. The `DPPLanguagePicker` updates local state but no translation rebinds.

**Fix:** thread the selected preview language into the preview subtree using the same pattern wine already uses — wrap the preview in `<I18nextProvider i18n={previewI18n}>` (a cloned instance pinned via `i18n.cloneInstance({ lng })`), or pass `t = i18n.getFixedT(lang)` down. Re-renders all labels when the picker changes. After #1 lands, the toys preview will visibly switch across all 24 locales.

## Technical details

- **Files touched:** `src/i18n/locales/*.json` (24, generated), `src/i18n/locales/audit.test.ts`, `src/components/PassportPreview.tsx` and/or `src/components/toys/ToyPublicPassport.tsx` (preview wrapper).
- **Tooling:** one-shot `scripts/generate-toys-i18n.ts` reads `toys.ts`, emits the `toys.*` subtree, then calls `translate-text` per locale. Idempotent and re-runnable when toys fields change.
- **No DB / no edge function changes** beyond reusing `translate-text`.
- **Tests:** duplicate-key, locales-audit, and toys-template tests must pass; coverage threshold stays at 30%.

## Out of scope

- Stale signup toast (#2) and en.json en-US/en-GB sweep (#3) — explicitly skipped per user.
- Recycling-table data-vs-i18n decision — separate pass.
