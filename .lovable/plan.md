

## Fix: Translate 7 Untranslated Strings Across All 23 Locales

### Problem
The build fails because the translation audit test detects 7 English strings that remain untranslated in all 23 non-English locale files. The audit test and its allowlists will **not** be modified.

### What needs translating
These 7 keys are still in English across all 23 locales:

| Key | English Value |
|-----|--------------|
| `landing.ai.tags.productLabels` | "Product Labels" |
| `landing.ai.tags.ingredientLists` | "Ingredient Lists" |
| `landing.categories.subtitle` | "Templates built from official EU regulations and delegated acts. More categories will be added as delegated acts are published." |
| `landing.timeline.feb2027.title` | "Batteries — Coming Soon" |
| `landing.timeline.feb2027.badge` | "February 2027" |
| `landing.timeline.active.description` | "Wine & Spirits (EU 2021/2117) already requires digital declarations including ingredient lists and nutritional information." |
| `landing.timeline.rollout.description` | "Textiles, electronics, furniture, iron/steel, aluminum, construction products, toys, cosmetics, tires, and detergents will require DPPs as delegated acts are published." |

### What stays the same
- `src/i18n/locales/audit.test.ts` — **no changes**
- `englishExpectedKeys` list — **no changes**
- `perLanguageAllowedValues` — **no changes**
- `isLegitimateMatch` function — **no changes**

### Files to edit (23 locale JSON files)
Each file gets the 7 keys translated to its respective language:

`bg.json`, `cs.json`, `da.json`, `de.json`, `el.json`, `es.json`, `et.json`, `fi.json`, `fr.json`, `ga.json`, `hr.json`, `hu.json`, `it.json`, `lt.json`, `lv.json`, `mt.json`, `nl.json`, `pl.json`, `pt.json`, `ro.json`, `sk.json`, `sl.json`, `sv.json`

Total: 7 strings × 23 languages = 161 translations using professional EU regulatory terminology consistent with each file's existing style.

