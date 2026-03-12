

## Plan: Add Tests to Reach 50% Functions Coverage

### Problem
Build fails because functions coverage is 34% (101/297), below the 50% threshold. All 653 tests pass but the coverage gate blocks deployment.

### Strategy
Focus on files with many exported/internal functions that currently have minimal testing. The highest-impact targets are:

1. **`CategoryQuestions.tsx`** — Add tests that exercise `handleChange` and `renderQuestion` for each question type (text, textarea, number, checkbox, select) by interacting with form elements.

2. **`Dashboard.tsx`** — Add tests for `handleDuplicate`, `handleDelete`, `handleShowQR`, `getPublicUrl`, `getCategoryIcon`, and the drag-end handler by rendering with passport data and simulating clicks.

3. **`PassportForm.tsx`** — Add tests for form submission (`handleSubmit`), category change, description change, and the unsaved-changes dialog.

4. **`PassportPreview.tsx`** — Add tests for `getDisplayValue` branches (boolean true/false, null, string) and rendering with category data that has filled fields, required logos, and counterfeit protection.

5. **`QRCodeDialog.tsx`** — Add tests for `handleCopyUrl` (click copy button), and the `getRoundedHexagonPath` function.

6. **`SortablePassportCard.tsx`** — Add tests for button click handlers (edit, duplicate, delete, QR) by simulating clicks and verifying callback invocations.

7. **`ImageUpload.tsx`** — Add tests for `handleUpload` validation branches (no user, invalid file type, file too large) and `handleRemove`.

8. **`CounterfeitProtection.tsx`** — Add tests for `handleEnable` when no slug (local toggle), and `handleDisable`.

9. **`DPPLanguagePicker.tsx`** — Add tests for `getEffectiveLanguage` with non-EU language fallback and language change handler.

10. **`useAutoTranslate.ts`** — Add tests for `markAsUserEdited`, `isUserEdited`, and the debounce/translate flow.

### Files to Create/Modify

| File | Action | Tests Added |
|------|--------|-------------|
| `src/components/CategoryQuestions.test.tsx` | Expand | 5 interaction tests (one per question type) |
| `src/pages/Dashboard.test.tsx` | Expand | 6 tests (with passports, click handlers) |
| `src/components/SortablePassportCard.test.tsx` | Expand | 4 tests (click callbacks) |
| `src/components/PassportPreview.test.tsx` | Expand | 4 tests (display value branches, logos, counterfeit) |
| `src/components/QRCodeDialog.test.tsx` | Expand | 2 tests (copy button, no-url state) |
| `src/components/ImageUpload.test.tsx` | Expand | 3 tests (validation branches) |
| `src/components/CounterfeitProtection.test.tsx` | Expand | 2 tests (enable/disable clicks) |
| `src/components/DPPLanguagePicker.test.tsx` | Expand | 2 tests (fallback, change handler) |
| `src/hooks/useAutoTranslate.test.ts` | Expand | 3 tests (mark edited, debounce) |
| `src/pages/PassportForm.test.tsx` | Expand | 3 tests (category change, form interaction) |

### Estimated Impact
Adding ~34 tests that exercise callbacks and event handlers should cover approximately 50-60 additional functions, pushing functions coverage from 34% (~101/297) to above 50% (~149/297).

