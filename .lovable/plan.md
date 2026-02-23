

## Fix: Build Timeout Due to Test Suite Size

### Root Cause

The build is **not failing due to a code error** -- all visible tests pass. The build output is truncated at the exact same point across 3 retry attempts (during the translation audit report), which indicates either:

1. **Test suite timeout** -- the test run exceeds the build server's time limit
2. **Output buffer overflow** -- the verbose translation audit output fills the build log buffer

The translation audit test (`src/i18n/locales/audit.test.ts`) prints a large report for all 24 EU languages, and when combined with the other 300+ tests, this may push the build past its limits.

### Fix Plan

**1. Reduce test output verbosity** (`src/i18n/locales/audit.test.ts`)
- Suppress the large audit report from stdout (it prints a full table for 24 languages every build)
- Keep the test assertions but remove or conditionally gate the `console.log` that prints the full report
- This reduces build log size significantly

**2. Add missing translation fields to the data contract** (`src/components/wine/WinePublicPassport.tsx` and `src/components/wine/WinePublicPassport.test.ts`)
- Add `grape_variety_translations`, `vintage_translations`, `region_translations` to `WINE_PASSPORT_FIELDS.productInfo`
- Add the same 3 fields to `CANONICAL_WINE_FIELDS.productInfo` in the test
- Add the 3 fields to `exampleCategoryData` in the test
- This ensures the data contract is complete and consistent (important for DPP safety -- if fields exist but aren't documented, they could be silently dropped)

### Technical Details

**File: `src/i18n/locales/audit.test.ts`**
- Wrap the large `console.log` report in a condition so it only prints when explicitly requested (e.g., via env var `VERBOSE_AUDIT=1`), or remove the stdout output entirely and keep only the assertions

**File: `src/components/wine/WinePublicPassport.tsx` (line 574)**
- Change `productInfo` array from 10 items to 13:
  ```
  productInfo: ['volume', 'volume_unit', 'grape_variety', 'vintage', 'country', 'region', 
    'denomination', 'sugar_classification', 'denomination_translations', 
    'sugar_classification_translations', 'grape_variety_translations', 
    'vintage_translations', 'region_translations'],
  ```

**File: `src/components/wine/WinePublicPassport.test.ts`**
- Add 3 entries to `CANONICAL_WINE_FIELDS.productInfo` (around line 28):
  ```
  'grape_variety_translations',
  'vintage_translations', 
  'region_translations',
  ```
- Add 3 entries to `exampleCategoryData` (around line 338):
  ```
  grape_variety_translations: { de: 'Cabernet Sauvignon', fr: 'Cabernet Sauvignon' },
  vintage_translations: { de: '2020', fr: '2020' },
  region_translations: { de: 'Bordeaux', fr: 'Bordeaux' },
  ```

