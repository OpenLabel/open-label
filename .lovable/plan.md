

## Comprehensive Translation Audit Plan

### Problem Statement
There are two distinct issues in the translation files:
1. **Missing keys**: Several locale files (ga, sv) are severely truncated with only ~30-80 keys vs the ~438 in English. Greek (el) is also incomplete at ~46 lines.
2. **Untranslated values**: Some "complete" locale files contain English words instead of proper translations -- words that were never actually translated.

### Approach: Enhanced Vitest Audit Test

The best approach is to add a new comprehensive test file that runs as part of `vitest` and produces a detailed audit report. This is better than a runtime utility because:
- It runs automatically in CI/CD
- It catches regressions immediately
- It produces a clear, actionable report

### What the Audit Will Check

**1. Missing Keys Detection (already partially exists)**
- Compare every locale against the English reference
- Report exact missing key paths per locale

**2. Untranslated Value Detection (new)**
- For every non-English locale, compare each value against the English value
- If the value is identical to English, flag it as "potentially untranslated"
- Exclude known legitimate matches from false positives:
  - E-numbers (e.g., "E220", "E938")
  - Chemical formulas (e.g., "C4H6O6")
  - Proper nouns kept in original form (e.g., "Chateau Margaux", "AOC", "AOP", "IGP")
  - Technical abbreviations (e.g., "JSON/XML", "BIM", "NFC/RFID", "ISO 15459", "DPP", "ESPR", "PDF", "QR")
  - Number patterns and units (e.g., "750", "100", "kcal", "kJ", "g/L")
  - Brand names (e.g., "GitHub", "Powered by")
  - Single-character or very short values (1-2 chars)
  - Values that are mostly numbers/symbols

**3. File Completeness Summary**
- Total keys per locale vs English reference
- Percentage completion per locale
- Clear pass/fail per locale

### Implementation Details

**New file: `src/i18n/locales/audit.test.ts`**

This test file will:
1. Import all 24 locale JSON files
2. Flatten all nested keys into dot-notation paths
3. For each non-English locale:
   - List all missing keys (keys in English but not in the locale)
   - List all extra keys (keys in locale but not in English)
   - List all values identical to English (excluding allowlist)
4. Print a summary table to console
5. Fail the test if any locale has untranslated values above a threshold

The allowlist for legitimate English matches will include:
- Values shorter than 3 characters
- Values matching regex for E-numbers, chemical formulas, units
- Values containing only numbers, punctuation, or technical codes
- Specific known keys like `poweredBy`, `hidePromo` where English brand names are expected

**Update to `locales.test.ts`**
- Add `ga`, `sv`, `el` and remaining locales to the tracking so their incompleteness is visible (not necessarily enforced yet)

### Execution Order
1. Create `src/i18n/locales/audit.test.ts` with the comprehensive audit logic
2. Run tests to get the full report of:
   - Which locales are missing keys (and which keys)
   - Which locales have untranslated English strings (and which keys)
3. Use that report to systematically fix each locale file
4. Expand the severely truncated files (ga, sv) to full key parity

### Expected Output
The test will print something like:
```text
=== Translation Audit Report ===
bg: 438/438 keys, 3 potentially untranslated
cs: 438/438 keys, 5 potentially untranslated  
da: 438/438 keys, 2 potentially untranslated
...
ga: 32/438 keys, INCOMPLETE (7% coverage)
sv: 28/438 keys, INCOMPLETE (6% coverage)
```

And for each locale with issues, it will list the specific keys, making it easy to fix them one by one.

