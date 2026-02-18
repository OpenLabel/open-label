

# Fix Build: Add Missing Locale Keys + Fix Hardcoded Strings

## Current Status: Build FAILING

The audit tests fail because 15 locales are missing ~27 keys, and several components still contain hardcoded English text.

## Part 1: Fix Hardcoded Strings in PublicPassport.tsx (Critical - Public-Facing)

This is the page anyone sees when scanning a QR code. It has 7 hardcoded English strings:

| Line | Hardcoded | Fix |
|------|-----------|-----|
| 66 | `'Yes' : 'No'` | `t('common.yes') : t('common.no')` |
| 77 | `categoryInfo?.label` + `Product Passport` | `t('categories.${passport.category}')` + `t('preview.productPassport')` |
| 90 | `Check authenticity` | `t('passport.checkAuthenticity')` |
| 174 | `Confirmed` | New key `common.confirmed` |
| 194 | `Powered by` | `t('passport.poweredBy')` |
| 210 | `Legal Mentions` | `t('legal.legalMentions')` |

## Part 2: Fix Minor Hardcoded Strings

**ImageUpload.tsx line 63**: `'Failed to upload image'` fallback -- replace with new key `imageUpload.uploadFailed`

**RichTextEditor.tsx line 57**: `window.prompt('Enter URL:')` -- replace with new key `richText.enterUrl`

## Part 3: New i18n Keys to Add

Add to `en.json`:
- `common.confirmed`: "Confirmed"
- `imageUpload.uploadFailed`: "Failed to upload image"
- `richText.enterUrl`: "Enter URL:"

## Part 4: Add All Missing Keys to 15 Locales

Add the ~27 keys from the previous task PLUS the 3 new keys above to these 15 locales:
es, et, fi, ga, hr, hu, it, lt, lv, mt, pl, pt, ro, sk, sl

Total new keys per locale: ~30

## Part 5: Intentionally Excluded (Not Bugs)

These are acceptable:
- **QRCodeDialog.tsx**: "Place security seals here" + "cypheme.com" -- partner branding in SVG overlay, not translatable
- **TranslationButton.tsx**: `EU_LANGUAGES[].name` -- English names used as metadata, only `nativeName` is displayed
- **Legal pages** (Setup, Terms, Privacy, LegalMentions) -- intentionally excluded per prior decision
- **Template files** (battery.ts, textiles.ts, etc.) -- deferred, Early Alpha, and now hidden from UI

## Technical Details

### Files to modify: 18 total
- 3 component files (PublicPassport.tsx, ImageUpload.tsx, RichTextEditor.tsx) -- fix hardcoded strings
- `en.json` -- add 3 new keys
- 15 locale JSON files -- add ~30 keys each (27 from previous task + 3 new)
- Optionally: `RichTextEditor.tsx` needs `useTranslation` import added

### After this change
- All 72 audit tests should pass (24 locales x 3 tests each)
- Zero hardcoded English in any non-legal component
- PublicPassport.tsx fully internationalized for QR-code scanning users

