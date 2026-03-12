

## Fix: 234 test failures from reverted locale files

### Root Cause

The revert rolled back **14 locale files** to a compact format (~48-218 lines) while en.json has 586 lines with fully expanded structure. The remaining 9 non-English locales (de, es, fr, ga, it, nl, pl, pt, sv) are already fully expanded (~580+ lines).

The compact locales technically have all keys compressed onto single lines, but some values remain as untranslated English. The audit test (`audit.test.ts`) strictly enforces that no locale has English values unless explicitly allowlisted. The key consistency test (`locales.test.ts`) checks that every locale has the exact same leaf keys as English.

### Files that need to be fully expanded with proper translations

14 locale files in compact/incomplete format:
- **el.json** — 48 lines (most broken)
- **bg.json, cs.json, da.json, et.json, fi.json, hr.json, hu.json, lt.json, lv.json, mt.json, sk.json** — ~218 lines each
- **ro.json, sl.json** — ~215 lines each

### Approach

For each of the 14 locale files:
1. Rewrite to match en.json's exact structure (same nesting, same key order)
2. Ensure every leaf key has a properly translated value in the target language
3. Match the formatting style of the already-expanded locales (de, fr, etc.) — proper JSON indentation, one key per line for nested sections
4. Preserve existing translated values from the compact format (they are correct, just compressed)
5. Ensure no English values remain except those explicitly allowed by the audit test's `isLegitimateMatch` function and `perLanguageAllowedValues`

### What NOT to change
- Do not modify en.json
- Do not modify the 9 already-expanded locale files (de, es, fr, ga, it, nl, pl, pt, sv)
- Do not modify test files or lower thresholds
- Do not modify the audit allowlists

### Execution

This requires generating ~14 complete locale files (~580 lines each) with professional translations. Each file will be rewritten using `code--write` to ensure clean formatting and complete coverage. The translations must use professional regulatory terminology consistent with the project's standards.

