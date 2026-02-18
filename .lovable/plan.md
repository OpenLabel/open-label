

# Internationalize All Hardcoded Strings (Excluding Legal Pages)

## Goal
Replace every hardcoded English string in non-legal pages/components with `t()` calls, add the corresponding keys to `en.json`, propagate them to all 23 other EU locale files, and ensure all tests pass.

## Scope

**In scope:** Auth.tsx, Dashboard.tsx, PassportForm.tsx, SortablePassportCard.tsx, CategoryQuestions.tsx, ImageUpload.tsx, WineAIAutofill.tsx, and Zod validation messages in Auth.tsx.

**Out of scope (intentionally static):** Setup.tsx, Terms.tsx, PrivacyPolicy.tsx, LegalMentions.tsx. Template files (battery.ts, textiles.ts, etc.) are also deferred -- they are "Early Alpha" and would require ~300+ keys across 11 files, which is a separate effort.

---

## Hardcoded Strings to Fix

### 1. Auth.tsx (6 fixes)
| Line | Current hardcoded string | New i18n key |
|------|--------------------------|-------------|
| 15 | `'Please enter a valid email address'` | `auth.validation.invalidEmail` |
| 16 | `'Password must be at least 6 characters'` | `auth.validation.shortPassword` |
| 64 | `'Account created!'` / `'You can now sign in.'` | Already exists: `auth.accountCreated` / `auth.accountCreatedDesc` |
| 68 | `'Check your email'` / `'Password reset link sent.'` | Already exists: `auth.checkEmail` / `auth.resetLinkSent` |
| 100 | `'Reset your password'` | Already exists: `auth.resetSubtitle` |
| 111 | `'Sending...'` / `'Send Reset Link'` | Already exists: `auth.sending` / `auth.sendResetLink` |
| 114 | `'{t('common.back')} to sign in'` | Already exists: `auth.backToSignIn` |
| 143 | `'Forgot password?'` | Already exists: `auth.forgotPassword` |

Most already have keys -- they just aren't being used. Only 2 genuinely new keys needed (Zod messages).

### 2. Dashboard.tsx (3 fixes)
| Line | Current | Key (already exists) |
|------|---------|---------------------|
| 88 | `'Passport duplicated'` | `dashboard.duplicated` |
| 95 | `'Are you sure you want to delete this passport?'` | `dashboard.confirmDelete` |
| 98 | `'Passport deleted'` | `dashboard.deleted` |

All keys already exist in en.json -- just need to replace hardcoded strings with `t()` calls.

### 3. PassportForm.tsx (3 fixes)
| Line | Current | Key (already exists) |
|------|---------|---------------------|
| 114 | `'Please enter a product name'` | `passport.enterProductName` |
| 126 | `'Passport updated successfully'` | `passport.updated` |
| 131 | `'Passport created successfully'` | `passport.created` |
| 310 | `Details` (partial hardcode) | `passport.details` |

All keys already exist.

### 4. SortablePassportCard.tsx (3 fixes)
| Lines | Current | Key (already exists) |
|-------|---------|---------------------|
| 57, 146 | `aria-label="Drag to reorder"` | New: `dashboard.dragToReorder` |
| 94, 182 | `Show QR Code` | `dashboard.showQr` |
| 121, 209 | `Duplicate` | `dashboard.duplicate` |

1 new key needed (`dashboard.dragToReorder`).

### 5. CategoryQuestions.tsx (3 fixes)
| Line | Current | New key |
|------|---------|---------|
| 81 | `'Select an option'` | `common.selectOption` |
| 100 | `'No additional information required...'` | `passport.noAdditionalInfo` |
| 111 | `'Early Alpha'` + description paragraph | `passport.earlyAlpha` / `passport.earlyAlphaDesc` |

4 new keys needed.

### 6. ImageUpload.tsx (5 fixes)
| Line | Current | New key |
|------|---------|---------|
| 26 | `'You must be logged in to upload images'` | `imageUpload.loginRequired` |
| 31 | `'Please upload an image file'` | `imageUpload.invalidType` |
| 36 | `'Image must be less than 5MB'` | `imageUpload.tooLarge` |
| 113 | `'Uploading...'` | `imageUpload.uploading` |
| 118 | `'Upload Product Image'` | `imageUpload.uploadButton` |

5 new keys needed. Component needs `useTranslation` import.

### 7. WineAIAutofill.tsx (10+ fixes)
| Line | Current | New key |
|------|---------|---------|
| 139 | `'Autofill with AI'` | `ai.autofillButton` |
| 142 | `'Experimental'` | `ai.experimental` |
| 165 | `'AI Label Scanner'` | `ai.scannerTitle` |
| 168 | `'Upload a wine label photo...'` | `ai.scannerDescription` |
| 175 | `'Experimental feature: Please double-check...'` | `ai.experimentalWarning` |
| 89 | `'AI Autofill Complete'` | `ai.autofillComplete` |
| 90 | `'Fields have been populated...'` | `ai.autofillCompleteDesc` |
| 95 | `'No data extracted from the label'` | `ai.noDataExtracted` |
| 110 | `'Processing Failed'` | `ai.processingFailed` |
| 111 | `'Failed to extract data from the label'` | `ai.processingFailedDesc` |
| 255 | `'Fair Usage Quota Exceeded'` | `ai.quotaExceeded` |
| 258 | `'You've reached the monthly limit...'` | `ai.quotaExceededDesc` |
| 264 | quota body paragraph | `ai.quotaExceededBody` |
| 267 | contact paragraph | `ai.quotaContactBody` |
| 277 | `'Close'` | `common.close` (exists) |
| 286 | `'Contact Us'` | `ai.contactUs` |

~13 new keys needed.

---

## Summary of Changes

### New i18n keys to add: ~25 keys total
- `auth.validation.*` (2)
- `dashboard.dragToReorder` (1)
- `common.selectOption` (1)
- `passport.noAdditionalInfo`, `passport.earlyAlpha`, `passport.earlyAlphaDesc` (3)
- `imageUpload.*` (5)
- `ai.*` (13)

### Files to modify: 7 component files + 24 locale JSON files

### Implementation steps:
1. Add all ~25 new keys to `en.json`
2. Replace hardcoded strings with `t()` calls in each of the 7 component files
3. Add `useTranslation` import to `ImageUpload.tsx` (only file missing it)
4. Add matching translations to all 23 non-English locale files
5. Run all tests to confirm 100% key parity and build passes

