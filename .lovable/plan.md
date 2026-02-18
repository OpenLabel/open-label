

# Fix Multi-Pass AI Extraction: Make Second Pass Actually Work

## Problem

The second pass is ineffective (found 0-1 additional fields out of 12-17 missing). Root causes:
- The second pass doesn't tell the AI what was already extracted, so it repeats the same blind spots
- Both passes use the same model (gemini-2.5-flash), producing identical failures
- The prompt is too generic ("look harder") instead of giving concrete guidance

## Changes

### Edge Function (`supabase/functions/wine-label-ocr/index.ts`)

**1. Include first-pass results in the second-pass prompt**

Update `runSecondPass()` to pass the already-extracted data as context:

```
You already extracted this data:
- product_name: (not found)
- country: "France"
- energy_kcal: 63
...

Now focus ONLY on the missing fields listed below.
```

This gives the AI anchoring context so it knows what it already found and can look for what it missed.

**2. Use a stronger model for the second pass**

Switch from `google/gemini-2.5-flash` to `google/gemini-2.5-pro` for the second pass only. The Pro model has stronger vision capabilities and is better at reading small print, which is exactly where the first pass fails.

**3. Improve the second-pass prompt to be more directive**

Replace the vague "look harder" prompt with specific, field-by-field instructions:
- For `product_name`: "Look for the largest/most prominent text on the front label"
- For `alcohol_percent`: "Look for '% vol' or '% alc' text, usually in small print"
- For `volume`: "Look for 'ml', 'cl', or 'L' usually near the bottom of the label"
- Generic fallback for other fields

**4. Add a third pass for critical fields still missing**

If `product_name` or `alcohol_percent` are still empty after two passes, run a tiny targeted extraction for just those 1-2 critical fields using the Pro model.

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Rewrite `runSecondPass()` with context-aware prompt, use Pro model, add optional third pass for critical fields |

## No frontend changes needed

The response format stays the same. Only the server-side extraction quality improves.

