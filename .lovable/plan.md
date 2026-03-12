

## Plan: Simplify Wine QR Code — Label Above, Energy Below, No Ingredients List

### What the user wants

- **Above QR**: Just the word "Ingredients" (translated to current language)
- **Below QR**: Just `E 100ml : XXX kJ / YY kcal`
- **NO full ingredients list anywhere** in the image

### Changes

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | In `handleShowQR`, replace the ingredients list building with just the translated label: `wineIngredientsText = t('wine.ingredients')` (e.g. "Ingredients", "Ingrédients", etc.). Keep `wineEnergyText` as-is. |
| `src/components/QRCodeDialog.tsx` | Remove `wrapText`/`wrapTextSvg` helpers (no longer needed). For `wineIngredientsText`: render as a single centered line above the QR in preview, PNG, and SVG — it's just one word. For `wineEnergyText`: render as a single centered line below the QR (already works). Remove left-aligned multi-line wrapping logic. |

### Layout

```text
┌──────────────────────────┐
│       Ingredients        │  ← single word, centered
├──────────────────────────┤
│       ┌──────────┐       │
│       │  QR Code │       │
│       └──────────┘       │
├──────────────────────────┤
│ E 100ml: 350 kJ / 84 kcal│ ← single line, centered
└──────────────────────────┘
```

Both text lines take full width (centered within the image width which matches the QR code width + padding).

