

## Rename App to "Open Label" with open-label.eu

### Scope

Replace all "Digital - Product - Passports .com" / "DPP" branding with "Open Label" / "OL" across the entire codebase, and update all URLs to `open-label.eu`.

### Changes

**1. index.html** — Update `<title>`, `<meta>` tags (description, og:title, og:description, author)

**2. Page branding (5 files)**
- `src/pages/Index.tsx` — Header logo `DPP` → `OL`, brand text → `Open Label .eu`, footer, GitHub link, copyright fallback
- `src/pages/Dashboard.tsx` — Header logo and brand text
- `src/pages/Auth.tsx` — Header logo and brand text
- `src/pages/ResetPassword.tsx` — Header logo and brand text
- `src/pages/Setup.tsx` — Example URL `digital-product-passports.com` → `open-label.eu`

**3. Public passport links (2 files)**
- `src/pages/PublicPassport.tsx` — `href` and display text in "Powered by" footer → `open-label.eu` / `Open Label .eu`
- `src/components/wine/WinePublicPassport.tsx` — Same change

**4. Preview component**
- `src/components/PassportPreview.tsx` — Brand text in powered-by section

**5. Contact email**
- `src/components/wine/WineAIAutofill.tsx` — `contact@digital-product-passports.com` → `contact@open-label.eu`

**6. All 24 locale JSON files** — Update:
- `wine.hidePromo`: `"Digital - Product - Passports .com"` → `"Open Label .eu"` in en + all 23 translations
- `wine.displaySettingsDesc`: `"Digital Product Passport"` → keep as-is (generic EU term, not brand)
- Any other brand references in locale strings

**7. DPPLanguagePicker** — Keep component name (it's a technical term for Digital Product Passport, not the brand). Update JSDoc comment only.

**8. Test files** — Update brand assertions:
- `src/pages/Auth.test.tsx` — `'DPP'` → `'OL'`
- `src/pages/Index.test.tsx` — No brand-specific assertions to change
- `src/lib/qrCodeGeneration.safety.test.ts` — Update example URLs
- `src/lib/qrValidation.security.test.ts` — Update example URLs
- `src/i18n/locales/audit.test.ts` — No changes needed (allowlists don't reference brand)

**9. Locale translation audit compliance**
- The `hidePromo` key contains the brand name in all 24 languages. Each will be updated to reference "Open Label .eu" instead
- The `perLanguageAllowedValues` in audit.test.ts may need "Open Label" added since it appears identically across languages (it's a brand name)

### Files to edit: ~35 files total
- `index.html`
- 5 page files, 2 component files, 1 preview component, 1 AI component
- 24 locale JSON files
- 3-4 test files

