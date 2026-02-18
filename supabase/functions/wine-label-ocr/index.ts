import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { readBarcodes, type ReaderOptions } from "npm:zxing-wasm@2/reader";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const WineOCRSchema = z.object({
  image: z.string()
    .min(1, "Image is required")
    .max(10_000_000, "Image data too large (max ~7MB)")
    .refine(
      (val) => /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf);base64,/.test(val),
      "Invalid format - must be a valid base64 image or PDF data URL"
    ),
});

const MONTHLY_LIMIT = 100;

/**
 * Known ingredient IDs — mirrored from src/data/wineIngredients.ts.
 * The AI must return these IDs instead of free-text names.
 * If adding/removing ingredients, update BOTH this list and the frontend data file,
 * and ensure the sync test in wineIngredients.integrity.test.ts passes.
 */
export const KNOWN_INGREDIENTS: { id: string; name: string; eNumber?: string; isAllergen?: boolean }[] = [
  // General
  { id: "grapes", name: "Grapes" },
  { id: "saccharose", name: "Saccharose" },
  { id: "aleppo_pine_resin", name: "Aleppo pine resin" },
  { id: "caramel", name: "Caramel" },
  { id: "concentrated_grape_must", name: "Concentrated grape must" },
  { id: "grape_must", name: "Grape must" },
  { id: "rectified_concentrated_grape_must", name: "Rectified concentrated grape must" },
  { id: "filling_dosage", name: "Filling dosage" },
  { id: "expedition_dosage", name: "Expedition dosage" },
  // Gases
  { id: "argon", name: "Argon", eNumber: "E 938" },
  { id: "nitrogen", name: "Nitrogen", eNumber: "E 941" },
  { id: "carbon_dioxide", name: "Carbon dioxide", eNumber: "E 290" },
  { id: "protective_atmosphere", name: "Bottled under protective atmosphere" },
  // Acidity regulators
  { id: "tartaric_acid", name: "Tartaric acid", eNumber: "E 334" },
  { id: "malic_acid", name: "Malic acid", eNumber: "E 296" },
  { id: "lactic_acid", name: "Lactic acid", eNumber: "E 270" },
  { id: "calcium_sulfate", name: "Calcium sulfate", eNumber: "E 516" },
  { id: "citric_acid", name: "Citric acid", eNumber: "E 330" },
  // Stabilizers
  { id: "citric_acid_stabilizer", name: "Citric acid (stabilizer)", eNumber: "E 330" },
  { id: "metatartaric_acid", name: "Metatartaric acid", eNumber: "E 353" },
  { id: "gum_arabic", name: "Gum arabic", eNumber: "E 414" },
  { id: "yeast_mannoproteins", name: "Yeast mannoproteins" },
  { id: "carboxymethylcellulose", name: "Carboxymethylcellulose", eNumber: "E 466" },
  { id: "potassium_polyaspartate", name: "Potassium polyaspartate", eNumber: "E 456" },
  { id: "fumaric_acid", name: "Fumaric acid", eNumber: "E 297" },
  // Preservatives
  { id: "potassium_sorbate", name: "Potassium sorbate", eNumber: "E 202" },
  { id: "lysozyme", name: "Lysozyme", eNumber: "E 1105" },
  { id: "ascorbic_acid", name: "L-Ascorbic acid", eNumber: "E 300" },
  { id: "dmdc", name: "Dimethyl dicarbonate (DMDC)" },
  { id: "sulfites", name: "Sulfites" },
  { id: "sulfur_dioxide", name: "Sulfur dioxide" },
  { id: "potassium_bisulfite", name: "Potassium bisulfite" },
  { id: "potassium_metabisulfite", name: "Potassium metabisulfite" },
  // Processing aids
  { id: "egg", name: "Egg", isAllergen: true },
  { id: "milk", name: "Milk", isAllergen: true },
  { id: "casein", name: "Casein", isAllergen: true },
  { id: "albumin", name: "Albumin", isAllergen: true },
  { id: "isinglass", name: "Isinglass (fish bladder)", isAllergen: true },
  { id: "bentonite", name: "Bentonite" },
  { id: "gelatin", name: "Gelatin" },
  { id: "pea_protein", name: "Pea protein" },
  { id: "potato_protein", name: "Potato protein" },
  { id: "pvpp", name: "PVPP (Polyvinylpolypyrrolidone)" },
];

/** Build the ingredient reference section for the system prompt */
function buildIngredientPromptSection(): string {
  const lines = KNOWN_INGREDIENTS.map((ing) => {
    let desc = `- ${ing.id} → "${ing.name}"`;
    if (ing.eNumber) desc += ` (${ing.eNumber})`;
    if (ing.isAllergen) desc += ` [ALLERGEN]`;
    return desc;
  });
  return `INGREDIENTS — CRITICAL INSTRUCTIONS:
When you detect ingredients, you MUST return their IDs from this known list:
${lines.join("\n")}

Rules:
- Return the ingredient ID (e.g., "tartaric_acid"), NOT the display name.
- Map E-number mentions to the correct ID (e.g., "E 334" → "tartaric_acid", "E 414" → "gum_arabic").
- Map non-English names to the correct ID (e.g., "acide tartrique" → "tartaric_acid", "gomme arabique" → "gum_arabic", "dioxyde de soufre" → "sulfur_dioxide", "solfiti" → "sulfites", "Schwefeldioxid" → "sulfur_dioxide", "ácido tartárico" → "tartaric_acid").
- "CONTIENT DES SULFITES" / "Contains Sulfites" / "Enthält Sulfite" → "sulfites"
- If an ingredient is clearly present but doesn't match any known ID, return it prefixed with "custom:" (e.g., "custom:oak chips").
- "Sulfites" is a generic term covering all sulfur compounds. If the label just says "sulfites"/"sulfites" use "sulfites". If it specifically says "sulfur dioxide" use "sulfur_dioxide". You can return both if both are mentioned.`;
}

// All fields that can be extracted
const EXTRACTION_TOOL = {
  type: "function" as const,
  function: {
    name: "extract_wine_label_data",
    description: "Extract structured data from a wine label, analysis document, or wine product page",
    parameters: {
      type: "object",
      properties: {
        product_name: { type: "string", description: "The full product/wine name as it appears on the label" },
        product_type: { type: "string", enum: ["wine", "aromatized", "fortified", "spirits"], description: "Type of wine product" },
        grape_variety: { type: "string", description: "The grape variety (e.g., Cabernet Sauvignon, Merlot)" },
        vintage: { type: "string", description: "The vintage year or NV for non-vintage" },
        volume: { type: "number", description: "Bottle volume as a number" },
        volume_unit: { type: "string", enum: ["ml", "cl", "L"], description: "Volume unit" },
        country: { type: "string", description: "Country of origin" },
        region: { type: "string", description: "Wine region (e.g., Bordeaux, Napa Valley)" },
        denomination: { type: "string", description: "Wine designation (AOC, AOP, IGP, DOC, DOCG, etc.)" },
        sugar_classification: { type: "string", description: "Sugar classification (Brut, Sec, Demi-Sec, Doux, Extra Brut, etc.)" },
        producer_name: { type: "string", description: "Producer/winery/château name" },
        bottler_info: { type: "string", description: "Bottler name and address if different from producer" },
        alcohol_percent: { type: "number", description: "Alcohol percentage (e.g., 13.5)" },
        residual_sugar: { type: "number", description: "Residual sugar in g/L" },
        total_acidity: { type: "number", description: "Total acidity in g/L (as tartaric acid)" },
        glycerine: { type: "number", description: "Glycerine/glycerol/polyols in g/L" },
        energy_kcal: { type: "number", description: "Energy in kcal per 100ml" },
        energy_kj: { type: "number", description: "Energy in kJ per 100ml" },
        carbohydrates: { type: "number", description: "Carbohydrates in g per 100ml" },
        sugar: { type: "number", description: "Sugar in g per 100ml" },
        fat: { type: "number", description: "Fat in g per 100ml (usually 0 for wine)" },
        saturated_fat: { type: "number", description: "Saturated fat in g per 100ml (usually 0)" },
        proteins: { type: "number", description: "Proteins in g per 100ml (usually 0)" },
        salt: { type: "number", description: "Salt in g per 100ml (usually 0)" },
        detected_ingredients: {
          type: "array",
          items: { type: "string" },
          description: "List of ingredient IDs from the KNOWN_INGREDIENTS list (e.g., 'tartaric_acid', 'sulfites', 'gum_arabic'). Use 'custom:name' for unknown ingredients."
        },
        packaging_components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", description: "Component type: bottle, capsule, cage, cork, cardboard, bag, tap, label" },
              material: { type: "string", description: "Material name (e.g., glass, plastic, aluminum, cork, paper)" },
              material_code: { type: "string", description: "Material recycling code if visible (e.g., GL 71, PET 1, ALU 41, FOR 51, PAP 22)" },
              disposal: { type: "string", description: "Disposal instruction if visible (e.g., glass collection, plastic collection)" },
            },
          },
          description: "List of packaging components with their material and recycling info"
        },
        lot_number: { type: "string", description: "Lot or batch number (e.g., L23456)" },
        barcode: { type: "string", description: "EAN/UPC barcode number" },
        description: { type: "string", description: "Marketing or tasting description text" },
        serving_temperature: { type: "string", description: "Recommended serving temperature" },
        product_image_url: { type: "string", description: "URL of a product image found on a scraped web page (NOT from the label photo itself). Only extract this from web page content." },
      },
      additionalProperties: false
    }
  }
};

const SYSTEM_PROMPT = `You are a wine label and document data extractor. Analyze wine label images, technical sheets, analysis documents, or wine product web pages and extract structured information.

CRITICAL READING INSTRUCTIONS:
- Read ALL text on the label carefully, including small print, back labels, and legal text.
- Read numbers very carefully. Double-check energy values (kcal, kJ) against what is actually printed. Do not round or approximate.
- product_name is the MARKETING NAME of the wine as consumers see it (e.g., "Pompon Rouge Rosé", "Château Margaux 2015"), NOT the producer/winery/company name.
- producer_name is the winery, company, or château that makes the wine. These are often different from the product name.
- Always include the wine COLOR/TYPE (Rouge, Rosé, Blanc, etc.) in the product_name if it appears on the label.
- The bottler address city (e.g., "La Chapelle Heulin") is NOT the wine region. The region is a recognized wine-growing area (e.g., "Loire", "Bordeaux", "Val de Loire").
- Look for allergen mentions like "CONTIENT DES SULFITES", "Contains Sulfites", "Enthält Sulfite" etc.

PRODUCT IDENTITY:
- product_name: The full marketing name including color/type (e.g., "Pompon Rouge Rosé")
- product_type: "wine", "aromatized" (e.g., mulled wine), "fortified" (e.g., port, sherry), or "spirits"
- grape_variety: The grape variety (e.g., "Cabernet Sauvignon", "Merlot", "Chardonnay")
- vintage: The year (e.g., "2020") or "NV" for non-vintage
- volume: The bottle volume as a number (e.g., 750 for 750ml)
- volume_unit: The unit (ml, cl, or L)
- country: The country of origin
- region: The wine region — a recognized wine-growing area, NOT a city from the bottler address
- denomination: Any designation (AOC, AOP, IGP, DOC, DOCG, etc.)
- sugar_classification: Sugar level if mentioned (Brut, Sec, Demi-Sec, Doux, Extra Brut, etc.)

PRODUCER INFORMATION:
- producer_name: The winery/producer/château name (the company, not the product)
- bottler_info: Bottler name and address if different from producer

NUTRITIONAL & ANALYSIS VALUES (per liter or percentage):
- alcohol_percent: The alcohol percentage as a number (e.g., 13.5)
- residual_sugar: Residual sugar in g/L (e.g., 2.5)
- total_acidity: Total acidity in g/L expressed as tartaric acid (e.g., 5.5)
- glycerine: Glycerine/glycerol/polyols content in g/L (e.g., 8.5)

CALCULATED NUTRITIONAL VALUES (per 100ml - only if explicitly stated):
- energy_kcal, energy_kj, carbohydrates, sugar, fat, saturated_fat, proteins, salt

${buildIngredientPromptSection()}

PACKAGING & RECYCLING:
- Look for recycling symbols: Triman (French sorting logo), Mobius loop (♻), Green Dot, Tidyman, glass recycling symbol
- Identify individual packaging components: bottle, capsule/cap, cork/stopper, cage (for sparkling), labels
- Read material codes printed near recycling symbols (e.g., "GL 71" for green glass, "ALU 41" for aluminum)
- Read French sorting instructions ("bac de tri", "poubelle", "à recycler", "à jeter")
- Map disposal instructions: "bac de tri" → appropriate collection type, "poubelle" → residual waste
- packaging_components: array of { type, material, material_code, disposal } for each identified component
- Common wine packaging: bottle (glass GL 70-73), capsule (aluminum ALU 41 or plastic), cork (FOR 51), label (paper PAP 22)

OTHER DETAILS:
- lot_number: Lot/batch number (often starts with "L" followed by numbers)
- barcode: EAN/UPC barcode digits if readable
- description: Any marketing text, tasting notes, or product description
- serving_temperature: Serving temperature recommendation (e.g., "8-10°C")

Be conservative - only extract data you can clearly read. Do not guess or make up values.
For analysis values, pay attention to units and convert to the expected format if needed.`;

// List of all extractable field keys for second-pass gap detection
const ALL_FIELD_KEYS = [
  "product_name", "product_type", "grape_variety", "vintage", "volume", "volume_unit",
  "country", "region", "denomination", "sugar_classification", "producer_name", "bottler_info",
  "alcohol_percent", "residual_sugar", "total_acidity", "glycerine",
  "energy_kcal", "energy_kj", "carbohydrates", "sugar",
  "fat", "saturated_fat", "proteins", "salt",
  "detected_ingredients", "packaging_components",
  "lot_number", "barcode", "description", "serving_temperature",
  "product_image_url",
];

// Field-specific hints for the second pass
const FIELD_HINTS: Record<string, string> = {
  product_name: "Look for the LARGEST or most prominent text on the front label. This is the marketing name of the wine, NOT the producer/winery name. Include the color/type (Rouge, Rosé, Blanc) if visible.",
  alcohol_percent: "Look for '% vol', '% alc', or '% alc/vol' text, usually in small print on the back or bottom of the label. It's a legal requirement so it MUST be there.",
  volume: "Look for 'ml', 'cl', or 'L' usually near the bottom of the label or near the barcode. Common values: 750ml, 75cl, 0.75L.",
  volume_unit: "Same location as volume — determine the unit (ml, cl, or L).",
  grape_variety: "Look for grape names like Merlot, Cabernet Sauvignon, Chardonnay, Syrah, etc. Often on the front label or back label.",
  vintage: "Look for a 4-digit year (e.g., 2020, 2021, 2022). Usually prominently displayed on the front label.",
  region: "Look for wine region names (e.g., Bordeaux, Loire, Languedoc, Côtes du Rhône). NOT the city from the bottler address.",
  producer_name: "Look for 'Mis en bouteille par', 'Produit par', 'Élaboré par', or 'Produced by' followed by a company name.",
  denomination: "Look for AOC, AOP, IGP, DOC, DOCG, VdF, Vin de France, or similar designations.",
  description: "Look for any tasting notes, marketing description, or food pairing suggestions on the back label.",
};

/**
 * Run a second focused extraction pass for missing fields.
 */
async function runSecondPass(
  imageBase64: string,
  firstPassData: Record<string, unknown>,
  apiKey: string,
  qrText?: string,
): Promise<Record<string, unknown>> {
  const missingFields = ALL_FIELD_KEYS.filter((key) => {
    const val = firstPassData[key];
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });

  if (missingFields.length <= 3) {
    console.log("Second pass skipped: only", missingFields.length, "fields missing");
    return {};
  }

  console.log("Running second pass for", missingFields.length, "missing fields:", missingFields);

  const alreadyFoundSummary = ALL_FIELD_KEYS
    .map((key) => {
      const val = firstPassData[key];
      if (val === null || val === undefined || val === "") return `- ${key}: (not found)`;
      if (Array.isArray(val) && val.length === 0) return `- ${key}: (not found)`;
      if (Array.isArray(val)) return `- ${key}: [${val.length} items]`;
      return `- ${key}: ${JSON.stringify(val)}`;
    })
    .join("\n");

  const fieldInstructions = missingFields
    .map((f) => {
      const hint = FIELD_HINTS[f];
      return hint ? `- ${f}: ${hint}` : `- ${f}`;
    })
    .join("\n");

  const qrContext = qrText
    ? `\n\nADDITIONAL CONTEXT from a QR code on this label:\n${qrText.slice(0, 15000)}\n\nCross-reference this text with the image to find missing fields.`
    : "";

  const focusedPrompt = `You are doing a SECOND PASS on this wine label. The first pass already extracted some data but MISSED several important fields.

HERE IS WHAT WAS ALREADY EXTRACTED (do NOT re-extract these, focus only on what's missing):
${alreadyFoundSummary}

THE FOLLOWING FIELDS ARE STILL MISSING. Look VERY CAREFULLY at the image for each one:
${fieldInstructions}

INSTRUCTIONS:
- Focus ONLY on the missing fields listed above.
- Look at EVERY part of the image: front label, back label, small print, legal text, recycling symbols, bottom of the bottle.
- Pay special attention to small text, fine print, and partially obscured text.
- If you find a value, return it. If you truly cannot find it, do not guess.${qrContext}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      signal: AbortSignal.timeout(60000),
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: focusedPrompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_wine_label_data" } },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log("Second pass AI call failed:", response.status);
      await response.text();
      return {};
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_wine_label_data") return {};

    const extracted = JSON.parse(toolCall.function.arguments);
    const result: Record<string, unknown> = {};
    for (const key of missingFields) {
      const val = extracted[key];
      if (val !== null && val !== undefined && val !== "") {
        if (Array.isArray(val) && val.length === 0) continue;
        result[key] = val;
      }
    }
    console.log("Second pass found", Object.keys(result).length, "additional fields:", Object.keys(result));
    return result;
  } catch (error) {
    console.error("Second pass error:", error);
    return {};
  }
}

/**
 * Third pass: targeted extraction for critical fields still missing after two passes.
 */
async function runCriticalFieldsPass(
  imageBase64: string,
  mergedData: Record<string, unknown>,
  apiKey: string,
  qrText?: string,
): Promise<Record<string, unknown>> {
  const criticalFields = ["product_name", "alcohol_percent", "volume"];
  const stillMissing = criticalFields.filter((key) => {
    const val = mergedData[key];
    return val === null || val === undefined || val === "";
  });

  if (stillMissing.length === 0) return {};

  console.log("Running critical fields pass for:", stillMissing);

  const instructions = stillMissing.map((f) => {
    if (f === "product_name") return "- product_name: Find the LARGEST, most prominent text on the front of the label. This is the wine's marketing name. Include color (Rouge/Rosé/Blanc) if shown.";
    if (f === "alcohol_percent") return "- alcohol_percent: Find the '% vol' or '% alc' number. This is legally required on every wine label. Check small print at the bottom, back label, or near the barcode.";
    if (f === "volume") return "- volume: Find the bottle size (e.g., 750, 75, 0.75). Look near the bottom of the label, near the barcode, or in small print. Also return volume_unit (ml, cl, or L).";
    return `- ${f}`;
  }).join("\n");

  const qrContext = qrText
    ? `\n\nAdditional context from QR code:\n${qrText.slice(0, 5000)}`
    : "";

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      signal: AbortSignal.timeout(60000),
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Look at this wine label image. I ONLY need you to find these specific fields:\n${instructions}\n\nThese are legally required on wine labels, so they MUST be visible somewhere. Look at every part of the image very carefully.${qrContext}`,
              },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_wine_label_data" } },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.log("Critical fields pass failed:", response.status);
      await response.text();
      return {};
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_wine_label_data") return {};

    const extracted = JSON.parse(toolCall.function.arguments);
    const result: Record<string, unknown> = {};
    for (const key of [...stillMissing, "volume_unit"]) {
      const val = extracted[key];
      if (val !== null && val !== undefined && val !== "") {
        result[key] = val;
      }
    }
    console.log("Critical fields pass found:", Object.keys(result));
    return result;
  } catch (error) {
    console.error("Critical fields pass error:", error);
    return {};
  }
}

/**
 * Decode QR code from image using zxing-wasm (ZXing C++ compiled to WASM).
 */
async function decodeQrFromBase64(imageBase64: string): Promise<string | null> {
  try {
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const blob = new Blob([bytes]);

    const readerOptions: ReaderOptions = {
      tryHarder: true,
      tryRotate: true,
      tryInvert: true,
      tryDownscale: true,
      formats: ["QRCode"],
      maxNumberOfSymbols: 1,
    };

    const results = await readBarcodes(blob, readerOptions);

    if (results.length > 0 && results[0].text) {
      const text = results[0].text.trim();
      if (text.startsWith("http")) {
        console.log("QR code decoded server-side (zxing-wasm):", text);
        return text;
      }
      console.log("QR code found but not a URL:", text);
    } else {
      console.log("No QR code detected by zxing-wasm");
    }

    return null;
  } catch (error) {
    console.warn("Server-side QR decode error:", error);
    return null;
  }
}

/**
 * Attempt to scrape a QR code URL with Firecrawl to get raw text content.
 * Returns the raw markdown text and URL — does NOT run a separate AI extraction.
 */
async function tryQrCodeScrape(
  imageBase64: string,
  firecrawlApiKey: string,
): Promise<{ markdown: string; qrUrl: string; imageLinks: string[] } | null> {
  try {
    const qrUrl = await decodeQrFromBase64(imageBase64);

    if (!qrUrl) {
      console.log("No QR code URL found by server-side decoder");
      return null;
    }

    console.log("Scraping QR code URL:", qrUrl);

    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      signal: AbortSignal.timeout(20000),
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: qrUrl,
        formats: ["markdown", "html", "links"],
        onlyMainContent: true,
        waitFor: 5000, // Wait longer for JS-rendered pages like u-label.io
      }),
    });

    if (!scrapeResponse.ok) {
      console.log("Firecrawl scrape failed:", scrapeResponse.status);
      await scrapeResponse.text();
      return null;
    }

    const scrapeData = await scrapeResponse.json();
    let markdown = scrapeData.data?.markdown || scrapeData.markdown || "";

    // If markdown is too short, fall back to HTML content (some JS-rendered pages
    // like u-label.io return richer content in HTML than in markdown)
    if (markdown.trim().length < 100) {
      const html = scrapeData.data?.html || scrapeData.html || "";
      if (html.trim().length > markdown.trim().length) {
        console.log("Markdown too short, using HTML fallback (length:", html.length, ")");
        markdown = html;
      }
    }

    if (!markdown || markdown.trim().length < 50) {
      console.log("Firecrawl returned insufficient content");
      return null;
    }

    console.log("Firecrawl scraped content length:", markdown.length);

    // Extract product image URLs from scraped links
    const links = scrapeData.data?.links || scrapeData.links || [];
    const imageLinks = links.filter((link: string) =>
      /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(link) &&
      !/logo|icon|favicon|banner|sprite|avatar/i.test(link)
    );

    return { markdown, qrUrl, imageLinks };

  } catch (error) {
    console.error("QR code scrape error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== AUTHENTICATION CHECK =====
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "INVALID_TOKEN" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // ===== RATE LIMITING CHECK =====
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: usageData, error: usageError } = await supabaseService.rpc(
      "increment_api_usage",
      {
        p_user_id: userId,
        p_function_name: "wine-label-ocr",
        p_limit: MONTHLY_LIMIT
      }
    );

    if (usageError) {
      console.error("Usage tracking error:", usageError);
    } else if (usageData && !usageData.allowed) {
      console.log("Rate limit exceeded for user:", userId, usageData);
      return new Response(
        JSON.stringify({ 
          error: usageData.message,
          code: "QUOTA_EXCEEDED",
          current_count: usageData.current_count,
          limit: usageData.limit
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== INPUT VALIDATION =====
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parseResult = WineOCRSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid input", 
          details: parseResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { image } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured. Please set it as a Supabase secret.");
    }

    // ===== PARALLEL: QR code scraping (returns raw text now, no AI call) =====
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    const qrScrapePromise = FIRECRAWL_API_KEY
      ? tryQrCodeScrape(image, FIRECRAWL_API_KEY)
      : Promise.resolve(null);

    // Start QR scrape first (it's I/O bound), then build the first AI call
    const qrResult = await qrScrapePromise;

    // Build the user prompt with optional QR context
    let userPromptText = "Please analyze this wine label or document and extract all visible information. Read ALL text carefully including small print, allergen warnings, ingredient lists, recycling symbols, material codes, lot numbers, and barcodes. Return all fields you can identify.";

    if (qrResult) {
      const imageLinksHint = qrResult.imageLinks.length > 0
        ? `\n\nProduct image URLs found on the page (pick the most likely product photo, NOT logos/icons):\n${qrResult.imageLinks.slice(0, 10).join("\n")}`
        : "";

      userPromptText += `\n\nADDITIONAL CONTEXT — Text scraped from a QR code found on this label (URL: ${qrResult.qrUrl}):\n${qrResult.markdown.slice(0, 15000)}${imageLinksHint}\n\nCross-reference the image and this scraped text to extract all fields. The label image is the primary source of truth; use the scraped text to fill in details that are hard to read on the image.`;
    }

    // ===== FIRST PASS: Image + QR context extraction =====
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      signal: AbortSignal.timeout(90000),
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userPromptText },
              { type: "image_url", image_url: { url: image } },
            ]
          }
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_wine_label_data" } },
        temperature: 0.1,
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("AI gateway error:", imageResponse.status, errorText);
      
      if (imageResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (imageResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI processing failed: ${imageResponse.status}`);
    }

    const aiResponse = await imageResponse.json();
    console.log("AI Response for user", userId);

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "extract_wine_label_data") {
      throw new Error("Unexpected AI response format");
    }

    const imageExtracted = JSON.parse(toolCall.function.arguments);

    // ===== SECOND PASS: Fill in missing fields (with QR context) =====
    const qrText = qrResult?.markdown;
    const secondPassData = await runSecondPass(image, imageExtracted, LOVABLE_API_KEY, qrText);

    // ===== MERGE: Image first pass + second pass =====
    const mergedData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(imageExtracted)) {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value) && value.length === 0) continue;
        mergedData[key] = value;
      }
    }

    for (const [key, value] of Object.entries(secondPassData)) {
      if (!(key in mergedData)) {
        mergedData[key] = value;
      }
    }

    // ===== THIRD PASS: Critical fields still missing (with QR context) =====
    const criticalPassData = await runCriticalFieldsPass(image, mergedData, LOVABLE_API_KEY, qrText);
    for (const [key, value] of Object.entries(criticalPassData)) {
      if (!(key in mergedData)) {
        mergedData[key] = value;
      }
    }

    console.log("Final merged data for user", userId, ":", Object.keys(mergedData));

    // ===== DOWNLOAD PRODUCT IMAGE IF FOUND =====
    let productImageBase64: string | null = null;
    const productImageUrl = mergedData.product_image_url as string | undefined;
    if (productImageUrl) {
      try {
        console.log("Downloading product image:", productImageUrl);
        const imgResponse = await fetch(productImageUrl, {
          headers: { "Accept": "image/*" },
          signal: AbortSignal.timeout(10000),
        });
        if (imgResponse.ok) {
          const contentLength = imgResponse.headers.get("content-length");
          if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
            console.log("Product image too large, skipping:", contentLength, "bytes");
          } else {
            const contentType = imgResponse.headers.get("content-type") || "image/jpeg";
            const arrayBuffer = await imgResponse.arrayBuffer();
            if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
              console.log("Product image too large after download, skipping:", arrayBuffer.byteLength, "bytes");
            } else {
              const uint8 = new Uint8Array(arrayBuffer);
              let binary = "";
              for (let i = 0; i < uint8.length; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              const b64 = btoa(binary);
              productImageBase64 = `data:${contentType};base64,${b64}`;
              console.log("Product image downloaded, size:", uint8.length);
            }
          }
        } else {
          console.log("Product image download failed:", imgResponse.status);
        }
      } catch (e) {
        console.error("Product image download error:", e);
      }
      delete mergedData.product_image_url;
    }

    const remaining = usageData ? usageData.remaining : null;

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData: mergedData,
        qrCodeUsed: qrResult !== null,
        secondPassUsed: Object.keys(secondPassData).length > 0,
        ...(productImageBase64 && { productImageBase64 }),
        ...(remaining !== null && { quota: { remaining, limit: MONTHLY_LIMIT } })
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("wine-label-ocr error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to process wine label" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
