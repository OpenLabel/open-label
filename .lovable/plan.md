## Fix Debug Screenshot + Investigate u-label.io Scraping

### Issue 1: Screenshot not deploying

The edge function file has the fix (strip `data:` prefix) but the compiled/deployed version still has the old code. Need to redeploy.

### Issue 2: u-label.io redirecting to CDC

The u-label.io URL is redirecting Firecrawl to `https://www.cdc.gov/alcohol/about-alcohol-use/moderate-alcohol-use.html` — likely a geo-based redirect or age gate. This means the scraped context is completely useless (CDC health content instead of wine ingredients/nutrition).

### Plan

**1. Redeploy the edge function** to get the base64 fix live.

**2. Add logging of the actual Firecrawl response URL** to confirm whether u-label.io is redirecting. Add a log line showing the scraped URL vs. the requested URL, and log the first 200 chars of the scraped content for quick diagnosis.

### Files changed


| File                                         | Change                              |
| -------------------------------------------- | ----------------------------------- |
| `supabase/functions/wine-label-ocr/index.ts` | Add Firecrawl response URL logging; |
