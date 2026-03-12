

## Plan: Increase Function Coverage from 39.53% to 50%+

The build fails because function coverage is 39.53%, below the 50% threshold. The fix is to add test files for untested source files and expand tests for files with many untested internal functions.

### Strategy

We need to cover approximately 10.5 percentage points more functions. The highest-impact targets are files with many exported/internal functions that currently have no or minimal test coverage.

### Files to Create/Modify

**1. Create `src/hooks/use-toast.test.ts`** (NEW)
- `use-toast.ts` has 6+ functions (`genId`, `reducer`, `dispatch`, `toast`, `useToast`, `addToRemoveQueue`) — all untested.
- Test `reducer` for ADD_TOAST, UPDATE_TOAST, DISMISS_TOAST, REMOVE_TOAST actions.
- Test `toast()` and `useToast()` hook via `renderHook`.

**2. Create `src/hooks/use-mobile.test.tsx`** (NEW)
- `useIsMobile` hook — untested.
- Test with mocked `matchMedia`.

**3. Create `src/components/BuildStatusBanner.test.tsx`** (NEW)
- `buildPrompt` (internal but exercised through render) and the main component.
- Mock `useSiteConfig`, `supabase.functions.invoke`, `import.meta.env.DEV`.
- Test loading state, fail state with `failedTests`, pass state (hidden), copy button.

**4. Expand `src/pages/Dashboard.test.tsx`**
- Add tests that exercise `handleDragEnd` (via DnD mock), `handleShowQR`, `handleSignOut` callbacks by triggering the mocked card buttons.

**5. Expand `src/pages/PassportForm.test.tsx`**
- Test category change via the select, which exercises `handleCategoryDataChange` and re-render logic.

**6. Create `src/lib/qrValidation.test.additional.ts`** or expand existing
- `validateQrFromImageData` has complex branching — add tests for the decode-failure and URL-mismatch paths.

**7. Create `src/data/wineIngredients.functions.test.ts`** (NEW)
- Test `getIngredientById`, `getIngredientCategory` helper functions from `wineIngredients.ts`.

These 7 changes target files with the most uncovered functions and should push function coverage above 50%.

### No Config Changes
- Thresholds remain at 50 in both `vite.config.ts` and `vitest.config.ts`.
- No tests deleted or skipped.
- No locale or audit changes needed.

