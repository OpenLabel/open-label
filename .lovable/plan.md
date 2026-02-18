
# Fix: Show Counterfeit Protection on New Passports Too

## Problem

The Counterfeit Protection section is hidden on new passports because of a guard condition (`isEditing && existingPassport`) on line 320 of `PassportForm.tsx`. Users creating a new Wine or Other passport never see the option, which is a significant UX gap for a safety-critical feature.

## Why This is Safe to Fix

The `CounterfeitProtection` component already handles the "no slug yet" case gracefully -- if the user clicks "Enable" before saving, it shows a toast: "Please save the passport first before enabling counterfeit protection." So there's no risk in showing the component on new passports.

## Change

**File: `src/pages/PassportForm.tsx`** (1 edit)

Replace the guard on line 320:

```
// Before:
{isEditing && existingPassport && (
  <CounterfeitProtection
    passportName={formData.name}
    passportSlug={existingPassport.public_slug}
    ...
  />
)}

// After:
<CounterfeitProtection
  passportName={formData.name}
  passportSlug={existingPassport?.public_slug ?? null}
  ...
/>
```

Remove the conditional wrapper entirely. The component is always rendered. The `passportSlug` falls back to `null` when there's no existing passport, which triggers the "save first" toast if the user tries to enable it before saving.

No other files change. No new i18n keys needed (the component already has its own fallback translations).
