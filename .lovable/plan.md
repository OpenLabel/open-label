

## Fix Build: Translate 7 Untranslated Strings in All 23 Locales

The build is failing because 7 English strings remain untranslated across all 23 non-English locale files. The audit test detects these as untranslated values.

### Strings to translate

| Key | English |
|-----|---------|
| `landing.ai.tags.productLabels` | "Product Labels" |
| `landing.ai.tags.ingredientLists` | "Ingredient Lists" |
| `landing.categories.subtitle` | "Templates built from official EU regulations..." |
| `landing.timeline.feb2027.title` | "Batteries — Coming Soon" |
| `landing.timeline.feb2027.badge` | "February 2027" |
| `landing.timeline.active.description` | "Wine & Spirits (EU 2021/2117) already requires..." |
| `landing.timeline.rollout.description` | "Textiles, electronics, furniture..." |

### What changes
- **Edit 23 locale JSON files** — translate each of the 7 keys to the correct language
- **No changes** to `audit.test.ts`, `englishExpectedKeys`, `perLanguageAllowedValues`, or `isLegitimateMatch`

### Files
`src/i18n/locales/bg.json`, `cs.json`, `da.json`, `de.json`, `el.json`, `es.json`, `et.json`, `fi.json`, `fr.json`, `ga.json`, `hr.json`, `hu.json`, `it.json`, `lt.json`, `lv.json`, `mt.json`, `nl.json`, `pl.json`, `pt.json`, `ro.json`, `sk.json`, `sl.json`, `sv.json`

