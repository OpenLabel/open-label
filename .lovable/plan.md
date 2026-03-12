

## Fix: 2 Failing Locale Tests in `locales.test.ts`

### Problem

The build fails because `locales.test.ts` detects 2 locales with a different key count than English (476 keys). This is from the `it.each(fullyUpdatedLocales)` test that asserts every locale has the exact same leaf keys as `en.json`.

### Root Cause

The `en.json` file has **duplicate `"translation"` top-level keys** (lines 2-4 and lines 531-549). In JSON, the second overwrites the first. Most locales were updated inconsistently during the branding rename — some have the duplicate pattern, some merged both into one block. This can cause key count mismatches if some locales lost or gained keys in the process.

### Fix Approach

1. **Clean up `en.json`**: Remove the first (dead) `"translation": { "autoTranslating": "Translating..." }` block at lines 2-4, since `autoTranslating` already exists in the second `translation` block at line 548. This eliminates the duplicate key issue.

2. **Clean up all 23 non-English locale files**: For each locale that has a duplicate top-level `"translation"` key (bg, cs, da, el, et, fi, hr, hu, lt, lv, mt, ga), remove the dead first block — the second `translation` object already contains `autoTranslating`.

3. **Verify key alignment**: After cleanup, confirm all locales have exactly the same leaf keys as English by running the test mentally against the cleaned structure.

### Files to Edit

- `src/i18n/locales/en.json` — Remove lines 2-4 (dead duplicate `translation` block)
- ~12 compact locale files that have the same duplicate pattern (bg, cs, da, el, et, fi, hr, hu, lt, lv, mt, ga) — Remove the first `translation` block

This is a safe, minimal change — it only removes dead JSON that gets overwritten at parse time anyway.

