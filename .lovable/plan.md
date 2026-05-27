Add the Toys category to the "Supported Product Categories" section of the home page (`src/pages/Index.tsx`).

## Change

In the `productCategories` array (lines 29-42), insert a Toys entry between `wine` and `other`:

```ts
{ key: 'toys', status: 'active', regulation: 'EU 2025/2509', deadline: 'active' }
```

This matches the existing entry in `src/templates/index.ts` `categoryList`, where Toys is already marked active with regulation `EU 2025/2509`.

## Translations check

The card renders `t('categories.toys')` and `t('categoryDescriptions.toys')`. I'll verify both keys exist in all 24 locale files (`src/i18n/locales/*.json`) and add them where missing, using professional regulatory terminology consistent with existing entries.

No other files need changes.