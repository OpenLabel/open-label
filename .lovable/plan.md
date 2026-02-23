

## Add Translation Buttons to Missing Fields

### Problem
Several text fields that appear on the public DPP lack translation buttons:

**Wine category** -- these three fields in `WineFields.tsx` are missing translation icons:
- Grape Variety
- Vintage
- Region

**Non-wine categories** -- Product Name and Description already have translation buttons (they are in `PassportForm.tsx`). If you are not seeing them, it may be because you are looking at a wine passport (wine has its own separate Name field without a translation button in the Product Identity card). Let me know if you see another field missing.

### Plan

**File: `src/components/WineFields.tsx`**

For each of the 3 fields (Grape Variety, Vintage, Region):

1. Add auto-translate hooks (similar to existing denomination/sugar classification pattern):
   - `grape_variety_translations`, `vintage_translations`, `region_translations` state handling
   - `useAutoTranslate` hook for each field

2. Wrap each `<Input>` in a `<div className="flex gap-2">` with a `<TranslationButton>` next to it, following the exact same pattern used for Denomination (lines 590-609)

3. Store translations in `data.grape_variety_translations`, `data.vintage_translations`, `data.region_translations`

### Fields affected

| Field | Data key | Translations key |
|---|---|---|
| Grape Variety | `grape_variety` | `grape_variety_translations` |
| Vintage | `vintage` | `vintage_translations` |
| Region | `region` | `region_translations` |

### Technical details

Each field gets:
- A `useCallback` for handling translation saves
- A `useAutoTranslate` hook for auto-translating on input change
- A translating indicator next to the label
- A `TranslationButton` next to the input
- The same user-edit precedence logic already used by Denomination

The public passport component (`WinePublicPassport.tsx`) and the edge function (`get-public-passport`) will also need to be checked to ensure translated values for these fields are displayed when a viewer selects a different language.

No new dependencies needed. No database changes.

