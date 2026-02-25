

## No Debug Screenshot Available

The debug screenshot from your latest scan was **not saved**. The edge function logs confirm:

```
Debug screenshot capture failed: InvalidCharacterError: Failed to decode base64
    at atob (... index.ts:1067:23)
```

### Why it failed

The base64 stripping fix exists in the source file (line 799-802, 891 lines total), but the **deployed** version is different (error at line 1067, implying a longer/older compiled file). The deployment from the previous message did not stick or was overwritten.

### What the AI prompt contained

From the logs, the full prompt sent to the AI included 12,426 characters of **CDC health warning content** (not wine data) scraped from the u-label.io redirect. This is why nutritional values were wrong -- the AI never saw the real nutrition table.

### Plan

1. **Redeploy** `wine-label-ocr` to get the base64 fix live
2. **Add content relevance filter** -- before injecting scraped text, check for wine-related keywords. If the content is from cdc.gov or doesn't mention wine/ingredients/kcal, discard it and log a warning. This prevents the CDC content from polluting the AI prompt.

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Add content relevance check after Firecrawl scrape; redeploy |

### Technical details

After `markdown` is extracted from Firecrawl (~line 530), add:

```typescript
const WINE_KEYWORDS = /\b(wine|vin|vino|wein|ingredients|nutrition|kcal|kj|allergen|sulfite|carbohydrate|glucides|sucre|sugar|zucchero|zucker)\b/i;
if (markdown && !WINE_KEYWORDS.test(markdown)) {
  console.warn("Scraped content appears irrelevant (no wine keywords found). Discarding", markdown.length, "chars");
  markdown = "";
}
```

This ensures that when u-label.io redirects to CDC, the irrelevant content is silently dropped and the AI processes only the label image.

