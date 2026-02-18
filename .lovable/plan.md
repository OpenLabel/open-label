

# Improve AI Label Scanner: Extract More Data with Multi-Pass

## Problem

The AI scanner currently extracts only basic fields from the wine label. From your Pompon Rouge Rose image, visible data includes product name, alcohol %, volume, country, producer/bottler, energy values (260 kJ / 63 kcal), sulfites, and recycling symbols -- but the scanner misses most of it.

Two root causes:
1. The extraction schema is missing key fields (recycling/packaging info, product description, lot number)
2. A single AI call often fails to extract everything, especially small-print details

## Solution

### 1. Expand the extraction schema

Add new fields to the extraction tool:
- `packaging_components`: array of objects with `type` (bottle, capsule, cork, etc.), `material` (glass, plastic, etc.), and `material_code` (e.g., "GL 70")
- `lot_number`: string for lot/batch number
- `barcode`: string for EAN/UPC barcode
- `description`: string for any marketing/tasting description text
- `serving_temperature`: string for serving temperature if visible

### 2. Add recycling/packaging symbol recognition to the prompt

Update SYSTEM_PROMPT to explicitly instruct the AI to:
- Read recycling symbols (Triman, Mobius loop, Tidyman, glass recycling)
- Identify packaging components and material codes (e.g., "GL 70" for green glass)
- Read the "FR" sorting instructions text

### 3. Improve ingredient name matching

The current matching is exact. Add fuzzy matching:
- "Sulphites" should match "Sulfites"
- Case-insensitive already exists, but add common aliases (SO2, E 220, etc.)

### 4. Multi-pass extraction for empty fields

After the first extraction, check which form fields are still empty. If many remain, run a second focused AI call with a prompt like "Look specifically for these missing details: [list of empty fields]". This catches small print the AI skimmed over.

Flow:
1. First pass: current extraction (broad scan)
2. Check which fields in the result are null/empty
3. If more than 3 fields are empty, run a second pass with a focused prompt listing just the missing fields
4. Merge results (second pass fills gaps, first pass values kept)

### 5. Map packaging data to recycling form

In `handleAIAutofill` in WineFields.tsx, map the new `packaging_components` array to the recycling materials format used by WineRecycling component.

## Technical Details

### Edge function changes (`supabase/functions/wine-label-ocr/index.ts`)

- Expand `EXTRACTION_TOOL.function.parameters.properties` with new fields
- Update `SYSTEM_PROMPT` with packaging/recycling reading instructions
- Add a `runSecondPass()` function that takes the image, the first-pass results, and re-prompts for missing fields only
- Call second pass conditionally (if >3 fields still null)

### Frontend changes (`src/components/WineFields.tsx`)

- In `handleAIAutofill`, map `packaging_components` to `recycling_materials` format
- Add alias mapping for ingredient matching (e.g., "Sulphites" to "sulfites" id)

### No new dependencies needed

All changes are within existing files. The multi-pass runs server-side within the same edge function invocation, so no additional API calls from the frontend.

