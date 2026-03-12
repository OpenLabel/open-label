

## Fix: 234 Test Failures

### Root Cause Analysis

The primary issue is **duplicate JSON keys** across locale files. While `JSON.parse` keeps the last occurrence, this creates inconsistencies that the locale tests detect:

1. **`en.json`**: Has duplicate `"translation"` key (lines 2-4 and 532-549). The first one only has `autoTranslating`, the second has the full section. Must remove the first duplicate.

2. **Multiple locale files** have the same duplicate `"translation"` at the top (lines 2-4): `bg`, `cs`, `da`, `el`, `et`, `fi`, `ga`, `hr`, `hu`, `lv`, `mt`. These all have a standalone `"translation": { "autoTranslating": "..." }` at the top AND a full `"translation"` section later.

3. **`de.json`**: Has duplicate `"recycling"` key (lines 461-484 and 547-570). The second overwrites the first.

### Fix Plan

**For all locale files with duplicate `"translation"` at lines 2-4** (en, bg, cs, da, el, et, fi, ga, hr, hu, lv, mt):
- Remove lines 2-4 (the `"translation": { "autoTranslating": "..." }` stub)
- The full `"translation"` section later in the file already contains `autoTranslating`

**For `de.json` duplicate `"recycling"`**:
- Remove the first `"recycling"` block (lines 461-484) since the second one (lines 547-570) already has all keys including `editCustomType`

### Files to Edit (13 files)

1. `src/i18n/locales/en.json` — remove lines 2-4
2. `src/i18n/locales/bg.json` — remove lines 2-4
3. `src/i18n/locales/cs.json` — remove lines 2-4
4. `src/i18n/locales/da.json` — remove lines 2-4
5. `src/i18n/locales/el.json` — remove lines 2-4
6. `src/i18n/locales/et.json` — remove lines 2-4
7. `src/i18n/locales/fi.json` — remove lines 2-4
8. `src/i18n/locales/ga.json` — remove lines 2-4
9. `src/i18n/locales/hr.json` — remove lines 2-4
10. `src/i18n/locales/hu.json` — remove lines 2-4
11. `src/i18n/locales/lv.json` — remove lines 2-4
12. `src/i18n/locales/mt.json` — remove lines 2-4
13. `src/i18n/locales/de.json` — remove first duplicate `recycling` section (lines 461-484)

No test files are modified. No thresholds are lowered. No audit rules are changed.

