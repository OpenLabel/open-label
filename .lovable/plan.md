## Goal

Run the Wine AI Autofill against the uploaded PDF (a printout of the demo Chateau Example 2022 DPP) and report coverage + improvement recommendations — same methodology as the toy test.

## How I will run it

1. Copy the PDF to `/tmp/sample-wine-dpp.pdf`.
2. Call `google/gemini-2.5-pro` via the Lovable AI Gateway with the **exact same prompt and `extract_wine_label_data` tool schema** the `wine-label-ocr` edge function uses (browser file upload isn't supported by the automation harness, so a direct gateway call is the cleanest way to reproduce the autofill output).
3. Pretty-print the returned JSON and diff against the PDF's ground truth.

## Ground truth in the PDF (19 expected fields)

- product_name "Chateau Example 2022", product_type "wine"
- vintage 2022, volume 750 ml
- grape_variety "Merlot, Cabernet Sauvignon"
- alcohol_percent 13.5
- country France, region Bordeaux, denomination "Bordeaux AOC"
- sugar_classification Dry
- energy_kj 322, energy_kcal 77, carbohydrates 0.3, sugar 0.3 (fat/sat/protein/salt: "negligible")
- detected_ingredients: grapes, sulfites, tartaric_acid
- packaging_components: bottle GL 70 / colorless glass / glass collection, cork CORK / natural cork / general waste
- producer_name "Domaine Example" (only on page 2 in the Legal Information block)

## What I will report

- Hit / miss / wrong table
- Coverage %
- Concrete improvement recommendations (e.g. prompt hints for the "Dry/Sec" sugar classification, handling of "negligible" → 0 for fat/sat/protein/salt, multi-page PDF reading for producer_name on page 2, ingredient ID matching for tartaric acid E334)

## Out of scope this turn

- Shipping any fix — diagnosis only. I'll offer to implement the recommended changes after you read the report.
