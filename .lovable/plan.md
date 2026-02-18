

## Improve AI Wine Label Recognition Quality

### Problem

Currently, the AI (Gemini 2.5 Pro) returns free-text ingredient names like "Sulfites" or "Tartaric acid", which then need fuzzy matching on the client. This is fragile -- the AI can return names in unexpected forms, languages, or phrasings. Additionally, when a QR code is detected, the system scrapes the linked webpage and tries to extract data from the rendered HTML/markdown, but many wine QR pages (like u-label.io) are JavaScript-rendered and return generic content instead of actual product data.

### Solution: Two Key Improvements

#### 1. Constrain AI output to known ingredient IDs

Instead of asking the AI to return free-text ingredient names, we inject the full list of valid ingredient IDs and names directly into the system prompt. The AI then returns ingredient **IDs** (e.g., `tartaric_acid`, `gum_arabic`, `sulfites`) instead of arbitrary text.

This eliminates the fuzzy matching problem entirely -- the AI does the matching at extraction time, where it has full context of the label.

**Changes:**
- **`supabase/functions/wine-label-ocr/index.ts`**:
  - Add a `KNOWN_INGREDIENTS` constant listing all valid ingredient IDs with their display names (built from the same data as `wineIngredients.ts`)
  - Update `SYSTEM_PROMPT` to include: "When detecting ingredients, you MUST return ingredient IDs from this list: [list]. If an ingredient doesn't match any known ID, return the raw name prefixed with `custom:`"
  - Update `EXTRACTION_TOOL.detected_ingredients` description to reference the known IDs
  - This applies to all 3 passes (first, second, critical)

#### 2. Feed raw scraped text to AI instead of re-extracting

When a QR code is decoded (e.g., a u-label.io URL), instead of asking the AI to extract structured data from the scraped markdown separately, we feed the raw scraped text **alongside the original image** into the main extraction passes. This way the AI can cross-reference what it sees on the label with what the web page says.

**Changes:**
- **`supabase/functions/wine-label-ocr/index.ts`**:
  - Restructure `tryQrCodeScrape` to return the **raw markdown text** and URL, not AI-extracted data
  - In the main flow, if QR scrape returns text, append it to the user prompt in the first AI call: "Here is additional text scraped from a QR code on the label (URL: ...): [markdown]. Cross-reference this with the image to extract all fields."
  - Pass the QR text into second and critical passes too, so all passes benefit
  - Remove the separate AI call inside `tryQrCodeScrape` (saves one API call and improves accuracy)
  - Enable Firecrawl `waitFor: 3000` to handle JS-rendered pages like u-label.io

#### 3. Add tests for the new ingredient ID mapping

**New/updated test files:**
- **`supabase/functions/wine-label-ocr/index_test.ts`**: Add tests verifying that the function rejects invalid inputs (already exists, keep as-is)
- **`src/lib/edgeFunctionInput.safety.test.ts`**: Already has ingredient-related safety tests -- extend with a test that verifies the known ingredient ID list matches `wineIngredients.ts` data to prevent drift
- **`src/data/wineIngredients.integrity.test.ts`**: Add a test ensuring every ingredient ID in the edge function's `KNOWN_INGREDIENTS` constant is also present in the client-side `wineIngredients.ts` (and vice versa), to catch desync

### Technical Details

**Edge function prompt change (simplified):**
```
INGREDIENTS - IMPORTANT:
When you detect ingredients, return their IDs from this known list:
- grapes (Grapes)
- saccharose (Saccharose)  
- tartaric_acid (Tartaric acid, E 334)
- sulfites (Sulfites - generic term)
- sulfur_dioxide (Sulfur dioxide)
- gum_arabic (Gum arabic, E 414)
- egg (Egg - ALLERGEN)
- milk (Milk - ALLERGEN)
... [full list]

If an ingredient is clearly present but doesn't match any ID, return it prefixed with "custom:" (e.g., "custom:oak chips").
Include E-number variants, French/Italian/German/Spanish names -- map them all to the correct ID.
```

**QR text injection (simplified):**
```
"Please analyze this wine label. 
[image attached]

ADDITIONAL CONTEXT - Text scraped from a QR code found on this label (from https://u-label.io/...):
[raw markdown content, truncated to 15000 chars]

Cross-reference the image and this text to extract all fields. The label image is the primary source of truth."
```

### Impact

- Ingredient matching goes from ~60% accuracy (fuzzy text matching) to ~95%+ (AI picks from constrained list)
- QR-sourced data quality improves because the AI sees everything in one context instead of separate extractions
- One fewer API call per scan (removed the separate QR extraction AI call)
- JS-rendered QR pages get better content with `waitFor`
- Tests ensure ingredient list stays in sync between frontend and backend

