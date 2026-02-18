
# Automated Tests: Bug Prevention and Security Only

## Philosophy
Only tests that catch real bugs or security vulnerabilities. No business logic validation (like alcohol content correctness). Every test answers: "What breaks or becomes dangerous if this goes wrong?"

## Test Categories

### 1. Edge Function Security Tests (Deno)

These are the highest-value tests -- they protect the publicly exposed attack surface.

**`supabase/functions/get-public-passport/index_test.ts`**
- Rejects malformed slugs (SQL injection patterns, XSS payloads, wrong length) -- prevents data exfiltration
- Rejects invalid JSON body -- prevents crashes
- Returns 404 for nonexistent slug (not 500) -- prevents error leak
- CORS preflight returns correct headers -- prevents browser blocking

**`supabase/functions/send-counterfeit-request/index_test.ts`**
- Rejects missing/invalid email -- prevents email injection
- Rejects empty passport name -- prevents sending broken emails
- Rejects invalid URL format -- prevents open redirect in email links
- CORS preflight works correctly

**`supabase/functions/translate-text/index_test.ts`**
- Rejects empty text -- prevents wasting AI quota on empty calls
- Rejects empty target languages array -- prevents crash
- CORS preflight works

**`supabase/functions/wine-label-ocr/index_test.ts`**
- Rejects request without auth header (401) -- prevents unauthorized AI usage
- Rejects invalid image format -- prevents sending garbage to AI API
- CORS preflight works

### 2. Data Integrity Tests (prevent runtime crashes from bad static data)

**`src/data/wineIngredients.integrity.test.ts`**
- No duplicate ingredient IDs across all categories -- duplicates cause UI key collisions and wrong ingredient selection
- Every ingredient has non-empty `id` and `name` -- missing values crash the ingredient picker
- All category IDs are non-empty and unique -- prevents rendering bugs

**`src/data/wineRecycling.integrity.test.ts`**
- No duplicate IDs in `packagingMaterialTypes`, `materialCompositions`, `disposalMethods`
- Every `materialComposition.categoryId` references a known category -- orphaned references cause filter bugs
- All entries have non-empty `id` and `name` -- prevents crashes

### 3. Template Structural Integrity (prevent form rendering crashes)

**`src/templates/allTemplates.test.ts`**
- Every template section question has non-empty `id`, `label`, and valid `type`
- Select-type questions always have a non-empty `options` array -- missing options crashes the Select component
- No duplicate question IDs within any single template -- causes React key collisions and data overwrites
- Question `type` is one of the valid enum values -- invalid type crashes CategoryQuestions renderer

### 4. i18n Configuration Integrity

**`src/i18n/config.test.ts`**
- All 24 EU language codes are configured -- missing language = broken public passport for that locale
- No duplicate language codes -- causes unpredictable language switching
- Every language code is exactly 2 characters (ISO 639-1) -- invalid codes break the i18n system

### 5. DOMPurify / XSS Prevention

**`src/pages/PublicPassport.security.test.ts`**
- Verify that DOMPurify is used on passport description before rendering -- this is the only `dangerouslySetInnerHTML` in the codebase, so we test that the sanitization call exists and strips malicious payloads
- Test that script tags, onerror handlers, and javascript: URLs are removed from description HTML

### 6. QR Validation (extend existing -- prevent counterfeit QR codes)

**`src/lib/qrValidation.test.ts`** (extend)
- Empty/whitespace expected URL returns mismatch -- prevents accepting any QR as valid
- Very long URLs are handled without crash

### 7. Route Protection

**`src/App.routing.test.ts`**
- `/setup` redirects to `/` when setup is complete -- prevents re-running setup (security)
- Public passport route `/p/:slug` works even during setup mode -- ensures published DPPs remain accessible
- Unknown routes go to NotFound -- prevents information leakage

## What We Are NOT Testing
- Whether alcohol calculations are correct (business logic, not a bug)
- Whether specific nutritional values are accurate (not our responsibility)
- Visual appearance or styling
- Component snapshots (brittle, low bug-prevention value)

## Test Count Estimate

| Category | New Tests |
|----------|-----------|
| Edge function security (4 functions) | ~16 |
| Data integrity (ingredients + recycling) | ~10 |
| Template structural integrity | ~6 |
| i18n config integrity | ~4 |
| XSS/DOMPurify | ~4 |
| QR validation extensions | ~2 |
| Route protection | ~3 |
| **Total new** | **~45** |
| Existing | 200 |
| **Grand total** | **~245** |

## Implementation Order
1. Edge function security tests (highest risk surface)
2. XSS / DOMPurify tests (direct safety impact)
3. Data integrity tests (prevent runtime crashes)
4. Template structural tests (prevent form crashes)
5. i18n config test (prevent broken locales)
6. QR validation extensions
7. Route protection tests

## Technical Details

- Edge function tests use Deno test runner, call deployed functions via HTTP, load env from `.env` via `dotenv/load.ts`
- Frontend tests use Vitest + React Testing Library
- Data/template tests are pure logic -- no mocking needed, fast and reliable
- XSS tests use DOMPurify directly to verify sanitization behavior
- Route tests render `<App />` with `MemoryRouter` and mock Supabase client
