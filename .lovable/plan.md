## Add Simplified Chinese (zh-CN) as a 25th first-class language

Treat zh-CN identically to the 24 EU languages: UI strings, DPP content translations, AI auto-translate, language pickers, and a strict test that fails the build if any Chinese key is missing or empty.

### Naming

- Code: `zh-CN`
- English name: `Chinese (Simplified)`
- Native name: `简体中文`
- Locale file: `src/i18n/locales/zh-CN.json`

### Implementation steps

**1. Generate the locale file (AI-translated, then committed)**

- Run a one-off script via the AI gateway that takes `src/i18n/locales/en.json` and produces `zh-CN.json` with every leaf string translated into Simplified Chinese.
- Preserve key structure, placeholders (`{{var}}`), HTML tags, and regulatory acronyms (EU, AOC, AOP, DOC, DOCG, GTIN, etc. — keep as-is, matching the existing rule in `translate-text/index.ts:143`).
- Validate locally: same key count as `en.json`, no empty strings, no untranslated English fragments outside the allowed acronym list.

**2. Register the language**

- `src/i18n/config.ts`: import `zh-CN.json`, add `{ code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' }` to `supportedLanguages`, add `'zh-CN': { translation: zhCN }` to `resources`. `supportedLngs` and the global `LanguageSwitcher` inherit automatically.
- `src/components/TranslationButton.tsx`: add the same entry to the parallel `EU_LANGUAGES` array (this also feeds the public DPP language picker and `useAutoTranslate`).

**3. Extend the AI auto-translate edge function**

- `supabase/functions/translate-text/index.ts`:
  - Add `'zh-CN': 'Chinese (Simplified)'` to `languageNames`.
  - Bump the Zod max from 23 → 24 target languages.
  - Raise `max_tokens` from 16000 → 20000 to absorb Chinese output (CJK characters are token-dense in Gemini's tokenizer; ~25% headroom is safe).
  - Adjust the system prompt to mention Simplified Chinese explicitly and reiterate the acronym pass-through rule.

**4. Update every test that hard-codes the 24-code list**

All of these become source-of-truth gates that fail vitest if Chinese is missing:

- `src/i18n/locales/duplicateKeys.test.ts` — add `'zh-CN'` to `localeCodes`.
- `src/i18n/locales/locales.test.ts` — add import, add to `locales` map, add to `fullyUpdatedLocales`.
- `src/i18n/locales/audit.test.ts` — add import, add to `locales` map, add to `fullyUpdatedLocales`, add (empty) entry to `perLanguageAllowedValues`. This is the strict gate: every key in `en.json` must exist in `zh-CN.json` with a non-empty, non-identical-to-English value (except whitelisted acronyms).
- `src/i18n/locales/templateKeys.test.ts` — add import and map entry.
- `src/i18n/config.test.ts` — add `'zh-CN'` to `EU_LANGUAGE_CODES`, change `toBe(24)` → `toBe(25)`.
- `src/i18n/config.additional.test.ts` — change `toHaveLength(24)` → `toHaveLength(25)`; **relax the `/^[a-z]{2}$/` regex** to `/^[a-z]{2}(-[A-Z]{2})?$/` so BCP-47-style codes are allowed.

**5. Add one explicit "Chinese must be complete" test**

A new dedicated test (`src/i18n/locales/zh-cn.completeness.test.ts`) that:
- Loads `en.json` and `zh-CN.json`.
- Asserts identical key set (no missing, no extra).
- Asserts every value is a non-empty string.
- Asserts no value is byte-identical to its English counterpart unless it's an allowlisted acronym/brand (EU, AOC, DOP, GTIN, DPP, QR, URL, EAN, UE, etc.).

This is redundant with `audit.test.ts` but gives a single, clearly named failure when Chinese drifts — matching the user's explicit "vitest fails if some chinese is missing" requirement.

**6. Docs + memory**

- `README.md` lines 47 and 458: "24 Languages" → "25 Languages (24 EU + Simplified Chinese)".
- Update project memory: change the core rule from *"Strictly 24 official EU languages"* to *"24 official EU languages + Simplified Chinese (zh-CN), all first-class"*. Update the related memory entries for i18n scope and audit policy.

### Out of scope (will not change in this PR)

- The 25th-language policy applies only to zh-CN. No other non-EU languages are added.
- Demo passport seed data (Chateau Example 2022) is not in this codebase; if it lives only in the database, Chinese fields will be auto-translated by the existing AI flow when next saved — no migration is included here.
- No RTL/CJK-specific typography changes; existing Tailwind/shadcn handles CJK glyphs out of the box. Font fallback can be revisited later if you see rendering issues.

### Test plan

- All 6 modified i18n tests pass.
- New `zh-cn.completeness.test.ts` passes after AI-generated `zh-CN.json` is committed.
- Manually flip the language switcher to "简体中文" — header, dashboard, wine editor, and a published public DPP all render Chinese strings.
- `TranslationButton` "Generate with AI" produces zh-CN values for translatable DPP fields.

### Technical notes

- The translation generation step will run inside the dev sandbox via the bundled AI-gateway skill, not from a user-facing edge function. The generated `zh-CN.json` is committed to the repo so the build remains deterministic.
- The `zh-CN` code, not `zh`, matches BCP-47 and signals "Simplified" unambiguously; this is also what Gemini's tokenizer/translation prompts respond to most reliably.
