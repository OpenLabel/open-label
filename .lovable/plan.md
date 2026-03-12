

## Plan: Wine QR Code with Ingredients and Energy Text

### What Changes

The QR code image for **wine passports only** will include:
- **Above the QR code**: Ingredients list (translated to the user's current UI language)
- **Below the QR code**: Energy line: `E 100ml : XXX kJ / YY kcal`

Both are rendered inside the downloadable PNG/SVG at the same width as the QR code. The print size instruction updates accordingly.

### Data Flow

The Dashboard already has the full passport object when opening the QR dialog. For wine passports, we pass the `category_data` and `category` to `QRCodeDialog`, which extracts ingredients and energy values.

### Files to Change

| File | Change |
|------|--------|
| `src/components/QRCodeDialog.tsx` | Add optional props `wineIngredientsText?: string` and `wineEnergyText?: string`. Render these above/below the QR code in the dialog preview, and draw them into PNG/SVG downloads. Adjust canvas height to be taller (QR + text rows). Update print size instruction text. |
| `src/pages/Dashboard.tsx` | In `handleShowQR`, when `passport.category === 'wine'`, build the ingredients text string (using `translateIngredient` logic + i18n) and energy text from `category_data`, then pass them as props to `QRCodeDialog`. |
| `src/i18n/locales/en.json` | Add `qrDialog.printSizeInstructionWine` key for the updated print dimensions. |

### Layout of Generated Image

```text
┌──────────────────────────┐
│  Ingredients: Grapes,    │  ← small text, wraps to QR width
│  Saccharose, Sulfites... │
├──────────────────────────┤
│                          │
│       ┌──────────┐       │
│       │  QR Code │       │
│       │          │       │
│       └──────────┘       │
│    (+ hexagon overlay)   │
├──────────────────────────┤
│ E 100ml: 350 kJ / 84 kcal│ ← single line, centered
└──────────────────────────┘
```

### Technical Details

- **Ingredients text**: Built in Dashboard by iterating `category_data.ingredients`, translating each via `t(`ingredients.${id}`)` for standard or `nameTranslations[lang]` for custom, joining with commas, prefixed with the translated "Ingredients:" label. Allergens are NOT bolded in this text version (plain text for print).
- **Energy text**: Simple string format `E 100ml : ${energyKj} kJ / ${energyKcal} kcal` from `category_data.energy_kj` and `category_data.energy_kcal`.
- **Canvas sizing**: The QR stays 250×250. Text areas add ~40px above (ingredients, wrapped) and ~20px below (energy). Total canvas height becomes dynamic based on ingredient text length.
- **Text wrapping**: For PNG, use `ctx.measureText()` to wrap ingredient text to fit within the QR width. For SVG, use `<foreignObject>` or multiple `<text>` elements.
- **Print instruction**: Updated to reflect the new taller dimensions.

