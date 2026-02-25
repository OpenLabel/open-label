

## Log Full AI Input & Save Debug Screenshot on Poor Extraction

### What changes

**1. Log the full content sent to the AI (first pass)**

After building `userPromptText` (line ~669), log it in full so you can see exactly what the AI received — including the scraped QR text.

Add at line ~671 (after userPromptText is finalized):
```
console.log("=== FULL AI INPUT ===");
console.log("User prompt text length:", userPromptText.length);
console.log("User prompt text:", userPromptText);
console.log("=== END FULL AI INPUT ===");
```

Also log the raw AI response (tool call arguments) right after parsing at line ~727:
```
console.log("=== RAW AI TOOL CALL RESPONSE ===");
console.log(toolCall.function.arguments);
console.log("=== END RAW AI TOOL CALL RESPONSE ===");
```

**2. Save a Firecrawl screenshot when extraction yields fewer than 10 fields**

After the final merge (line ~757), count the extracted fields. If fewer than 10 and a QR URL was found, re-scrape the QR URL with `formats: ["screenshot"]` and upload the screenshot to the `passport-images` storage bucket under a debug path like `debug-screenshots/{userId}/{timestamp}.png`.

Then log the public URL so you can find it.

```text
Flow:
  mergedData has < 10 keys
  AND qrResult?.qrUrl exists
  → Firecrawl scrape with formats: ["screenshot"]
  → Upload base64 screenshot to storage: passport-images/debug-screenshots/{userId}/{timestamp}.png
  → Log the public URL
```

### Files changed

| File | Change |
|------|--------|
| `supabase/functions/wine-label-ocr/index.ts` | Add logging of full AI input text + raw response; add screenshot capture & storage upload on poor extraction (<10 fields) |

### Technical details

- The screenshot is saved to the existing `passport-images` public bucket under `debug-screenshots/` so you can access it via the public URL logged in the edge function logs
- Firecrawl screenshot format returns a base64 image in `data.screenshot`
- The storage upload uses the service role client (already instantiated as `supabaseService`) to bypass RLS
- No new secrets or dependencies needed — Firecrawl and storage are already configured

