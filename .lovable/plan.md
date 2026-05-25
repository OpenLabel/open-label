## Goal

Run a real end-to-end test of the Toy AI Autofill using the uploaded PDF (which is a printout of the demo toy DPP), then measure coverage and recommend improvements.

## How I will run the test

1. Copy `user-uploads://Open_Label_.eu_-_Free_Digital_Product_Passports.pdf` to `/tmp/sample-toy-dpp.pdf` so the browser can upload it.
2. Open the dashboard, click **Create New → Toys**, open the AI autofill dialog, and upload the PDF (the file input already accepts `image/*,.pdf`).
3. Wait for the `toy-label-ocr` edge function to return, then dump the form state to compare against the ground-truth content of the PDF.

## What I will measure

The PDF contains ~30 explicit fields the autofill should be able to recover. I will score:

- **Hit rate** — fields correctly extracted / fields visibly present in the PDF
- **Wrong values** — fields filled with incorrect content (safety risk)
- **Missed obvious fields** — anything explicitly printed but left blank
- **Format issues** — enum mismatches, address splitting (street/city/postal/country), barcode → GTIN backfill, etc.

Ground-truth fields in the PDF (33 fields total):
- Identity: brand, model, SKU, toy_category (plush), age_group (3+), GTIN, description, instructions/warnings, product image
- Manufacturer: legal name, street, city, postal, country, email, website, VAT operator ID
- Compliance: ce_marked, EU DoC available + reference, safety_assessment, technical_documentation, legislation (TSR + GPSR), 3× EN-71 standards, customs code (CN 95)
- Safety reporting: channels (email + website), safety email, safety website
- Allergenic fragrances: none declared (should set `has_allergenic_fragrances=no`)

## Deliverables

A written analysis containing:
- Per-field hit / miss / wrong table
- Coverage percentage
- Concrete, prioritised list of improvements (prompt tweaks, schema additions, post-processing, PDF-specific handling, missing fields like `eu_doc_available` / `eu_doc_reference` / `safety_assessment_completed` / `technical_documentation_available` / `safety_channels` if I find gaps)

No production data is modified — the test creates an unsaved draft passport.

## Out of scope

- Actually shipping improvements (only diagnosis + recommendations this turn)
- Wine autofill
