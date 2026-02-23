## Emphasize "Free Forever" in the Landing Page Hero Title

### Change

Update the hero title translation key across all 24 locale files to make "free" prominent in the main heading.

**Current title:** "Create Unlimited Digital Product Passports"

**New title:** "Unlimited Digital Product Passports 100% Free"

This keeps the existing message while adding the strong "Free Forever" commitment. The em dash separates it cleanly and makes it scannable.

### Technical Details

#### 1. Update `src/i18n/locales/en.json`

- Change `landing.hero.title` from `"Create Unlimited Digital Product Passports"` to `"Create Unlimited Digital Product Passports — Free Forever"`

#### 2. Update all 23 other locale files

Mirror the same change with English placeholder text (bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv).

No changes needed in `Index.tsx` — the component already renders `{t('landing.hero.title')}` as a single string in the `<h1>` tag.