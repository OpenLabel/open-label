

## Plan: Increase Test Coverage to 80%+

### Current State
- **Coverage**: ~30% (2998/10097 statements)
- **Target**: 80%+ (need ~5079 more statements covered)
- **Excluded from coverage**: `src/components/ui/`, `src/test/`, `*.d.ts`

### Untested Files (by line count, descending)

| File | Lines | Has Test? |
|------|-------|-----------|
| `WineFields.tsx` | 1093 | No |
| `WinePublicPassport.tsx` | 580 | Partial (exports only) |
| `PassportForm.tsx` | ~514 | Yes (render) |
| `Index.tsx` | ~491 | Yes (render) |
| `WineRecycling.tsx` | 383 | No |
| `WineAIAutofill.tsx` | 322 | No |
| `WineIngredients.tsx` | 269 | No |
| `Dashboard.tsx` | ~202 | Yes (render) |
| `usePassports.tsx` | 190 | No |
| `CustomIngredientDialog.tsx` | 170 | No |
| `IngredientPickerDialog.tsx` | 158 | No |
| `RichTextEditor.tsx` | 157 | No |
| `useSiteConfig.tsx` | 126 | No |
| `useAuth.tsx` | 102 | No |
| `i18n/config.ts` | 103 | Yes (partial) |
| `App.tsx` | 95 | No |
| `WinePassportPreview.tsx` | 61 | No |
| `NotFound.tsx` | 26 | No |

**Total untested lines**: ~4,500+ lines across 14 files without any test coverage.

### Strategy

1. **Create new test files** for all untested components, hooks, and the App router
2. **Deepen existing tests** for files that only have basic render tests (add interaction tests, conditional branch coverage)
3. The biggest wins come from `WineFields.tsx` (1093 lines), `WinePublicPassport.tsx` (580 lines), `WineRecycling.tsx` (383 lines), and `WineAIAutofill.tsx` (322 lines) — these 4 files alone represent ~2,378 lines

### New Test Files to Create (14 files)

| # | Test File | Target Lines |
|---|-----------|-------------|
| 1 | `src/components/WineFields.test.tsx` | 1093 |
| 2 | `src/components/wine/WinePublicPassport.test.tsx` | 580 |
| 3 | `src/components/wine/WineRecycling.test.tsx` | 383 |
| 4 | `src/components/wine/WineAIAutofill.test.tsx` | 322 |
| 5 | `src/components/wine/WineIngredients.test.tsx` | 269 |
| 6 | `src/hooks/usePassports.test.tsx` | 190 |
| 7 | `src/components/wine/CustomIngredientDialog.test.tsx` | 170 |
| 8 | `src/components/wine/IngredientPickerDialog.test.tsx` | 158 |
| 9 | `src/components/RichTextEditor.test.tsx` | 157 |
| 10 | `src/hooks/useSiteConfig.test.tsx` | 126 |
| 11 | `src/hooks/useAuth.test.tsx` | 102 |
| 12 | `src/App.test.tsx` | 95 |
| 13 | `src/components/wine/WinePassportPreview.test.tsx` | 61 |
| 14 | `src/pages/NotFound.test.tsx` | 26 |

### Deepening Existing Tests (8 files)

Add branch/interaction coverage to existing render-only tests:

- `PassportForm.test.tsx` — test category switching, form submission, edit mode
- `Dashboard.test.tsx` — test empty state, passport list rendering, delete flow
- `Index.test.tsx` — test navigation links, category cards
- `PublicPassport.test.tsx` — test loading state, error state, passport display
- `Setup.test.tsx` — test form validation, submission
- `Auth.test.tsx` — test login/signup toggle, form submission
- `ResetPassword.test.tsx` — test form validation, submission states
- `ReferralStats.test.tsx` — test loading, data display states

### Estimated Coverage After

- New files cover ~3,732 lines (render tests cover ~85% of component lines)
- Deepened tests add ~500 more covered branches/lines
- **Projected**: ~7,200/10,097 = **~71% statements** at minimum
- With thorough branch testing in the deepened files: **80%+**
- Reaching 95% would require testing every branch in every component, which is possible but would mean ~40+ test files with very granular tests

### Mocking Approach (same as existing)

All new tests reuse the established mock patterns for supabase, useAuth, useSiteConfig, react-i18next, react-router-dom, and TipTap editor.

### Files Modified
- 8 existing test files (add more test cases)

### Files Created  
- 14 new test files

### Reaching 95%?

Getting to 95% is theoretically possible but would require:
- Testing every conditional branch in `WineFields.tsx` (1093 lines with many conditionals)
- Testing every error handler and edge case in hooks
- Testing the complete `WinePublicPassport.tsx` rendering with all data permutations
- This would be a separate follow-up phase after reaching 80%

**Recommendation**: Let me implement the 80% target first. We can then assess what's needed for 95%.

