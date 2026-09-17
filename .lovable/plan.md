# Self-maintaining multi-industry demo passport

Replace the hand-made wine row at `/p/de00000000000001` with in-code demo passports for every active category, rendered through the exact same public components as real passports, and guarded by tests that go red when a template drifts from its sample.

## 1. Sample registry (`src/data/samples/`)

- `toys.ts` — `buildSampleToyPassport` moved verbatim from `src/data/sampleToyPassport.ts`; the old path becomes a re-export so the dashboard "Create sample toy" button is unchanged.
- `wine.ts` — `buildSampleWinePassport`, mirroring the current demo row: "Chateau Example 2022", Bordeaux AOC, France, Merlot + Cabernet Sauvignon, 13.5% vol, 750 ml, vintage 2022, sugar term "Dry", producer "Domaine Example". Ingredients use the real ids `grapes`, `sulfites` (allergen), `tartaric_acid`. Packaging uses `packaging_materials` with `gl_70` (glass bottle) and the natural cork entry, both with disposal methods. Nutrition (`energy_kcal`, `energy_kj`, `carbohydrates`, `sugar`) is computed at build time by `calculateWineNutrition`, never hard-coded.
- `textiles.ts` — `buildSampleTextilesPassport`, filling every `required` question plus a representative optional set: 80% cotton / 20% recycled polyester, full composition text, care symbols, one certification (GOTS) with a certificate reference, country of assembly Portugal, `made_in_eu: true`, and the French EPR take-back line. Only option values that exist in the template; `show_advanced_fields` is not set.
- `index.ts` — `SAMPLE_PASSPORTS: Partial<Record<ProductCategory, () => PassportFormData>>` registering wine, toys, textiles, plus `getSamplePassport(category)`.

All samples use fictitious data, `.example` domains for every URL and email, and a description stating the data is fictitious.

## 2. Shared public renderer

- `src/components/GenericPublicPassport.tsx` — the generic branch currently inline in `PublicPassport.tsx`, moved as-is, prop shape `{ name, image_url, description, category_data, updated_at }` plus `category`.
- `src/components/PublicPassportView.tsx` — dispatcher on `category`: wine → `WinePublicPassport`, toys → `ToyPublicPassport`, else `GenericPublicPassport`.
- `PublicPassport.tsx` uses the dispatcher; rendered output for real passports is byte-identical, so its existing tests pass unchanged.

## 3. Demo route

- `src/pages/Demo.tsx` at `/demo` and `/demo/:category`; `/demo` and any unknown or unsampled category redirect to `/demo/wine`.
- Tabs derived from `categoryList.filter(c => c.status === 'active' && c.value !== 'other' && SAMPLE_PASSPORTS[c.value])`, in `categoryList` order, showing the category icon and `t('categories.<value>')`; the active tab is reflected in the URL.
- Top banner (translated, `demo.*` keys in all 25 locales): "Demo passport. All data is fictitious." plus a "Create your own passport" button to `/auth`.
- Below it `<PublicPassportView>` with `getSamplePassport(category)()` and `updated_at` set to the build date. Nothing is fetched from the backend. `document.title` is set to the sample's name.
- `'/demo'` added to `TRACKING_EXEMPT_PATH_PREFIXES`, with the matching assertion in `trackingExemptions.test.ts`, so the demo carries no tag and no cookie banner.

## 4. Entry points

Landing page "View Demo Passport" and every other `de00000000000001` reference in `src/`, `README.md` and `TESTING.md` point to `/demo`. `/demo` added to `public/sitemap.xml` and listed in `public/llms.txt`. The existing database row is left untouched.

## 5. Tests (`src/data/samples/samples.test.ts`)

- (a) Every `categoryList` entry with `status === 'active'` and `value !== 'other'` has a sample — failure message "Category X is active but has no demo sample in src/data/samples". This is what fails when a new category is switched to active.
- (b) For every section-based sample: required questions whose `showWhen` evaluates true (via `evaluateShowWhen`) have a non-empty value; select values and multi_select arrays only use declared option values; every `category_data` key is a question id, `<id>_translations`, or one of `product_name`, `product_name_translations`, `description_translations`.
- (c) Wine: every key is in `WINE_PASSPORT_FIELDS`; every ingredient id resolves via `getIngredientById`; every packaging composition id resolves in `wineRecycling.ts`; `energy_kj` / `energy_kcal` equal what `calculateWineNutrition` returns for the sample's inputs.
- (d) Demo page rendering: one tab per sampled active category, switching tabs changes the URL and the rendered product name, unknown category redirects to wine. Backend mocked the way `publicPassportNoTracking.test.tsx` does.

TESTING.md gains a "Demo passports" section: how to add a sample for a new category, and that any template change must come with a sample update or the suite goes red.

## Assumptions

- **Wine key allowlist.** `WINE_PASSPORT_FIELDS` does not list `product_name` / `product_name_translations`, yet `WinePublicPassport` reads the product name only from there (it deliberately never falls back to the internal DPP name). Test (c) therefore allows `WINE_PASSPORT_FIELDS` plus the same three generic keys as test (b); without that the wine demo would render with no title.
- **EPR field.** `take_back_scheme_epr` is gated behind `show_advanced_fields` in the form. The sample still carries the French EPR line as requested — it is valid stored data and renders publicly; it simply is not visible in the form's basic mode.
- Nothing under `supabase/`, `WinePublicPassport.tsx`, `ToyPublicPassport.tsx` or `/p/*` behaviour is modified. No analytics on `/demo`. Full suite run and count reported at the end.
