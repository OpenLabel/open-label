

## Add Tests to Reach 50%+ Code Coverage

The current coverage is at ~29.69%. To reach 50%+, we need to add tests for the many untested source files. The strategy focuses on **pure logic and data files** (no React component rendering needed) to maximize coverage with simple, fast tests.

### New Test Files to Create

**1. `src/templates/wine.test.ts`** -- Test WineTemplate class
- Verify `id`, `name`, `description`, `icon` properties
- Verify `sections` is empty (uses custom component)
- Verify `getRequiredLogos()` returns empty array
- Test `volumeUnits` and `wineCountries` exports for completeness and no duplicates

**2. `src/templates/battery.test.ts`** -- Test BatteryTemplate class
- Verify template properties (`id`, `name`, `description`, `icon`)
- Verify all 6 sections exist with correct titles
- Verify all question IDs are unique
- Test `getRequiredLogos()` with various data inputs (separate_collection_required, carbon_footprint_class)
- Verify required fields are marked as such

**3. `src/templates/textiles.test.ts`** -- Test TextilesTemplate
- Same pattern: properties, sections, question uniqueness, required fields

**4. `src/templates/construction.test.ts`** -- Test ConstructionTemplate

**5. `src/templates/electronics.test.ts`** -- Test ElectronicsTemplate

**6. `src/templates/cosmetics.test.ts`** -- Test CosmeticsTemplate

**7. `src/templates/furniture.test.ts`** -- Test FurnitureTemplate

**8. `src/templates/tires.test.ts`** -- Test TiresTemplate

**9. `src/templates/toys.test.ts`** -- Test ToysTemplate

**10. `src/templates/detergents.test.ts`** -- Test DetergentsTemplate

**11. `src/templates/iron_steel.test.ts`** -- Test IronSteelTemplate

**12. `src/templates/aluminum.test.ts`** -- Test AluminumTemplate

Each template test will follow a consistent pattern:
- Verify class properties match expected values
- Verify all section titles are present
- Verify no duplicate question IDs across sections
- Verify all questions have valid types (`text`, `textarea`, `select`, `checkbox`, `number`)
- Verify select questions have options arrays
- Test `getRequiredLogos()` if defined

**13. `src/data/wineIngredients.additional.test.ts`** -- Test utility functions
- `getAllIngredients()` returns flat list, correct count
- `getIngredientById()` finds known IDs, returns undefined for unknown
- `getIngredientCategory()` maps ingredients to categories correctly
- `wineProductTypes` has expected entries

**14. `src/data/wineRecycling.additional.test.ts`** -- Test utility functions
- `getCompositionsByCategory()` returns correct structure
- `disposalMethods` has no duplicate IDs
- `materialCategories` structure
- `packagingMaterialTypes` has no duplicate IDs

**15. `src/data/knownIngredientIds.test.ts`** -- Test canonical ID list
- All IDs are unique
- All IDs are snake_case
- No empty strings

**16. `src/i18n/config.additional.test.ts`** -- Test i18n config exports
- `supportedLanguages` has `code`, `name`, `nativeName` for each entry
- Default export is the i18n instance
- `SupportedLanguage` type covers all 24 codes

**17. `src/components/TranslationButton.test.ts`** -- Test EU_LANGUAGES constant
- 24 entries, no duplicates, all ISO 639-1 codes
- Matches `supportedLanguages` from i18n config

### Coverage Thresholds Update

**File: `vitest.config.ts`**
- Raise thresholds to enforce the new minimum:
  ```
  lines: 50, branches: 35, functions: 30, statements: 50
  ```

### Estimated Impact

Currently ~311 tests covering ~29.69%. Adding ~150-200 new tests covering all 12 template files, data utility functions, and configuration exports should push coverage well above 50% since these are pure TypeScript files with no JSX rendering needed.

