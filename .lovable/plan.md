


## Simplify Wine QR Code — Label Above, Energy Below ✅

### Layout
- **Above QR**: Just the translated word "Ingredients" (single centered word)
- **Below QR**: Just `E 100ml : XXX kJ / YY kcal` (single centered line)
- **No full ingredients list** anywhere in the QR image

### Changes Made
| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | `handleShowQR` now passes just `t('wine.ingredients')` as `wineIngredientsText` instead of the full comma-separated list |
| `src/components/QRCodeDialog.tsx` | Removed `wrapText`/`wrapTextSvg` helpers. Both PNG and SVG downloads render single centered lines. Preview also centers the label. |

## Build Status Banner — Test Failures Detection ✅

### Problem
Banner only checked coverage thresholds, not test pass/fail results. Failing tests (e.g. missing translation keys) wouldn't trigger the banner.

### Changes Made
| File | Change |
|------|--------|
| `vite.config.ts` | `buildStatusPlugin()` now reads `test-results/results.json` for failed test count in addition to coverage thresholds |
| `vitest.config.ts` | Added `json` reporter outputting to `./test-results/results.json` |
| `src/i18n/locales/en.json` | Removed `testKey` that was causing 23+ locale test failures |
