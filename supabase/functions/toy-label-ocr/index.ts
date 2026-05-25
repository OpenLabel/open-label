/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { readBarcodes, type ReaderOptions } from "npm:zxing-wasm@2/reader";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ToyOCRSchema = z.object({
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
 * Mirrors src/data/knownToyFragranceIds.ts — sync enforced by
 * src/data/toyFragrances.integrity.test.ts.
 */
const KNOWN_TOY_FRAGRANCE_IDS: string[] = [
  "acetylcedrene","amyl_salicylate","anisyl_alcohol","benzaldehyde","benzyl_benzoate",
  "benzyl_cinnamate","beta_caryophyllene","camphor","cananga_ylang_ylang","carvone",
  "cedrus_atlantica_bark_oil","cinnamomum_cassia_leaf_oil","cinnamomum_zeylanicum_bark_oil",
  "citrus_aurantium_amara_flower_oil","citrus_aurantium_amara_peel_oil",
  "citrus_bergamia_peel_oil","citrus_limonum_peel_oil","citrus_sinensis_peel_oil",
  "citronellol","cymbopogon_oils","d_limonene","dmbca","eucalyptus_leaf_oil",
  "eugenia_caryophyllus_oil","farnesol","hexadecanolactone","hexamethylindanopyran",
  "hexyl_cinnamal","jasminum_extract","juniperus_virginiana_oil",
  "laurus_nobilis_fruit_oil","laurus_nobilis_leaf_oil","laurus_nobilis_seed_oil",
  "lavandula_hybrida_oil","lavandula_officinalis_oil","lilial","linalool",
  "linalyl_acetate","mentha_piperita_oil","mentha_spicata_oil","menthol",
  "methyl_salicylate","narcissus_extract","pelargonium_graveolens_oil","pinus_mugo_oil",
  "pinus_pumila_oil","pogostemon_cablin_oil","propylidene_phthalide","rose_oil",
  "damascenone","alpha_damascone","cis_beta_damascone","delta_damascone","salicylaldehyde",
  "santalum_album_oil","alpha_santalol","beta_santalol","sclareol","alpha_pinene",
  "beta_pinene","alpha_terpineol","terpineol_mixture","terpinolene",
  "tetramethyl_acetyloctahydro_naphthalenes","trans_anethole","majantol","turpentine_oil",
  "vanillin","alpha_isomethyl_ionone","trimethyl_cyclopenten_pentenol","dl_limonene",
];

const TOY_CATEGORY_VALUES = [
  "baby","plush","doll","action_figure","construction","puzzle","board_game",
  "arts_crafts","slime","chemical_set","cosmetic","olfactory","gustative",
  "outdoor","activity","ride_on","wheeled","aquatic","electronic","radio",
  "internet","ai","battery","magnets","drone","toy_in_food","other",
];

const AGE_GROUP_VALUES = [
  "0_6m","6_12m","12_18m","18_36m","3plus","4plus","5plus","6plus","7plus",
  "8plus","10plus","12plus","14","other",
];

const IDENTIFIER_TYPE_VALUES = [
  "GTIN","GS1_DL","EPC","SGTIN","SKU","MODEL","ISO_15459","other",
];

const LEGISLATION_VALUES = [
  "TSR","GPSR","MSR","AI_ACT","CRA","RED","LVD","EMC","RoHS","BATTERIES",
  "DRONES","COSMETICS","REACH","CLP","other",
];

const STANDARD_VALUES = [
  "EN71_1","EN71_2","EN71_3","EN71_4","EN71_5","EN71_7","EN71_8","EN71_12",
  "EN71_13","EN71_14","EN_IEC_62115","other","common_spec",
];

const CN_CHAPTER_VALUES = [
  "32","33","34","39","40","42","44","48","49","61","62","63","69","70","73",
  "76","85","87","90","95","other",
];

const SAFETY_CHANNEL_VALUES = ["phone","email","website","form"];

const OPERATOR_ID_TYPE_VALUES = [
  "EORI","GLN","LEI","VAT","NATIONAL","DUNS","ESPR","other",
];

const EU_OPERATOR_ROLE_VALUES = [
  "importer","auth_rep","fulfilment","distributor","other",
];

const YES_NO = ["yes","no"];
const YES_NO_UNKNOWN = ["yes","no","unknown"];

const EXTRACTION_TOOL = {
  type: "function" as const,
  function: {
    name: "extract_toy_data",
    description: "Extract structured Digital Product Passport data from a toy package or product image, conforming to Regulation (EU) 2025/2509.",
    parameters: {
      type: "object",
      properties: {
        brand_name: { type: "string", description: "Brand name shown on the packaging." },
        model_name: { type: "string", description: "Model name or model number." },
        sku: { type: "string", description: "SKU or variant ID." },
        toy_category: { type: "string", enum: TOY_CATEGORY_VALUES, description: "Closest toy category." },
        toy_category_other: { type: "string", description: "Free-text category if 'other'." },
        age_group: { type: "string", enum: AGE_GROUP_VALUES, description: "Recommended age group from packaging (e.g., '3+' → '3plus'). Use '0_6m'..'18_36m' for explicit baby ranges. Use '14' for 14 years exactly." },
        age_group_other: { type: "string" },
        mouth_contact: { type: "string", enum: YES_NO, description: "yes if intended to be placed in the mouth (teethers, mouth-blown instruments, etc.)." },
        unique_product_identifier: { type: "string", description: "EAN/UPC/GTIN barcode digits or other persistent identifier visible on packaging." },
        identifier_type: { type: "string", enum: IDENTIFIER_TYPE_VALUES },
        identifier_type_other: { type: "string" },

        manufacturer_legal_name: { type: "string" },
        manufacturer_street: { type: "string" },
        manufacturer_city: { type: "string" },
        manufacturer_postal_code: { type: "string" },
        manufacturer_country: { type: "string" },
        manufacturer_email: { type: "string" },
        manufacturer_website: { type: "string" },
        manufacturer_operator_id: { type: "string" },
        manufacturer_operator_id_type: { type: "string", enum: OPERATOR_ID_TYPE_VALUES },

        has_auth_rep: { type: "string", enum: YES_NO },
        auth_rep_legal_name: { type: "string" },
        auth_rep_street: { type: "string" },
        auth_rep_city: { type: "string" },
        auth_rep_postal_code: { type: "string" },
        auth_rep_country: { type: "string" },
        auth_rep_email: { type: "string" },

        manufacturer_non_eu: { type: "string", enum: YES_NO, description: "Yes if the manufacturer is established outside the EU." },
        eu_op_legal_name: { type: "string", description: "Importer / EU responsible operator legal name." },
        eu_op_role: { type: "string", enum: EU_OPERATOR_ROLE_VALUES },
        eu_op_street: { type: "string" },
        eu_op_city: { type: "string" },
        eu_op_postal_code: { type: "string" },
        eu_op_country: { type: "string" },
        eu_op_email: { type: "string" },

        ce_marked: { type: "boolean", description: "True if CE marking is visible on the packaging or toy." },
        applicable_legislation: {
          type: "array",
          items: { type: "string", enum: LEGISLATION_VALUES },
          description: "Tick TSR for any toy; add others only if explicitly mentioned (e.g., battery symbol → BATTERIES, radio/Bluetooth → RED, electronics → LVD/EMC/RoHS).",
        },
        harmonised_standards: {
          type: "array",
          items: { type: "string", enum: STANDARD_VALUES },
          description: "EN 71 / EN IEC 62115 standards visible on the packaging or declaration.",
        },

        notified_body_involved: { type: "string", enum: YES_NO, description: "yes if a 4-digit notified body number is shown next to the CE mark. If CE is visible but no 4-digit number is present, set 'no' (do not omit)." },
        notified_body_number: { type: "string", description: "4-digit notified body number (e.g., 0123)." },
        notified_body_name: { type: "string" },
        certificate_reference: { type: "string", description: "Notified-body certificate reference (e.g., EC type-examination certificate number). Distinct from the EU Declaration of Conformity reference." },
        certificate_issue_date: { type: "string", description: "YYYY-MM-DD format." },

        has_instructions_warnings: { type: "string", enum: YES_NO, description: "yes if any safety warning or instruction is visible on the packaging (e.g., 'WARNING:…', 'Not suitable for children under 36 months', 'Choking hazard', 'Adult supervision required')." },
        public_instructions_warnings: { type: "string", description: "Verbatim warning / instruction text shown on the packaging, to be displayed to consumers on the DPP. Only fill when has_instructions_warnings='yes'." },
        eu_doc_available: { type: "string", enum: YES_NO, description: "yes if the packaging or document explicitly states an EU Declaration of Conformity exists (e.g., 'EU DECLARATION OF CONFORMITY: yes', 'DoC available')." },
        eu_doc_reference: { type: "string", description: "EU Declaration of Conformity reference / identifier (e.g., 'DoC-2025-001'). Distinct from notified-body certificate_reference." },
        safety_assessment_completed: { type: "string", enum: YES_NO, description: "yes if the document/packaging explicitly states a safety assessment has been completed (e.g., 'SAFETY ASSESSMENT: yes')." },
        technical_documentation_available: { type: "string", enum: YES_NO, description: "yes if the document/packaging explicitly states technical documentation is available (e.g., 'TECHNICAL DOCUMENTATION: yes')." },

        cn_chapter: { type: "string", enum: CN_CHAPTER_VALUES, description: "Combined Nomenclature chapter. Default '95' for toys; '85' for electronic toys; '87' for ride-ons/scooters; '95' otherwise." },

        has_allergenic_fragrances: { type: "string", enum: YES_NO_UNKNOWN, description: "yes only if the packaging explicitly lists allergenic fragrances at ≥10 mg/kg. 'unknown' if not stated." },
        allergenic_fragrance_ids: {
          type: "array",
          items: { type: "string" },
          description: `Allergenic fragrance IDs detected on the packaging. MUST be IDs from this list: ${KNOWN_TOY_FRAGRANCE_IDS.join(", ")}. Match by chemical name OR CAS number. Skip unknown fragrances.`,
        },

        safety_channels: {
          type: "array",
          items: { type: "string", enum: SAFETY_CHANNEL_VALUES },
        },
        safety_phone: { type: "string" },
        safety_email: { type: "string" },
        safety_website: { type: "string" },

        description: { type: "string", description: "Short marketing description / what the toy is, derived from the packaging." },
      },
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are a toy-packaging data extractor for a Digital Product Passport under Regulation (EU) 2025/2509 (Toy Safety Regulation) and Regulation (EU) 2023/988 (GPSR).

CRITICAL RULES:
- Extract ONLY what is clearly visible on the image. Do NOT invent or guess.
- Prefer omitting a field over guessing a wrong value. A wrong DPP value is a legal and safety risk.
- Use the controlled enum values exactly as specified. Do not return free text where an enum is required (except '*_other' fields).
- Map age recommendations like "3+", "3-5 ans", "ab 3 Jahren" → age_group "3plus". Baby ranges in months → "0_6m", "6_12m", "12_18m", "18_36m".
- CE mark is the stylised "CE" logo. If present, set ce_marked=true. A 4-digit number next to CE means a notified body was involved.
- Allergenic fragrances: only return IDs from the provided KNOWN list, matching by chemical name or CAS number. Never invent IDs.
- 'manufacturer_non_eu' = yes only when the manufacturer address is clearly outside the EU/EEA.
- For unique_product_identifier, prefer the EAN/UPC/GTIN barcode digits when visible; set identifier_type to "GTIN" in that case.
- Languages: packaging may be in any EU language — translate field meanings appropriately.

WARNINGS visible on the toy that imply controls:
- "Not suitable for children under 3 years" / age 0-3 small-parts warning → mouth_contact may still be no, but age_group should reflect it.
- Battery icon / "Contains batteries" → add BATTERIES to applicable_legislation.
- Bluetooth/Wi-Fi / antenna icon → add RED.
- Magnets / strong magnets warning → toy_category may be 'magnets'.
- Any visible safety warning / instruction text ("WARNING:…", "Not suitable for children under 36 months", "Choking hazard", "Adult supervision required", etc.) → set has_instructions_warnings="yes" AND copy the verbatim text into public_instructions_warnings.

COMPLIANCE STATEMENTS (explicit yes/no patterns on technical sheets or DPP printouts):
- "EU DECLARATION OF CONFORMITY: yes/no" or "DoC available: yes/no" → eu_doc_available.
- "SAFETY ASSESSMENT: yes/no" → safety_assessment_completed.
- "TECHNICAL DOCUMENTATION: yes/no" → technical_documentation_available.
- A reference/number printed next to "EU Declaration of Conformity" goes into eu_doc_reference (not certificate_reference).
- When CE marking is detected but no 4-digit notified body number is visible, set notified_body_involved="no" explicitly (do not omit).
`;

async function decodeBarcodeFromBase64(imageBase64: string): Promise<{ text: string; format: string } | null> {
  try {
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    const blob = new Blob([bytes]);
    const readerOptions: ReaderOptions = {
      tryHarder: true,
      tryRotate: true,
      tryInvert: true,
      tryDownscale: true,
      formats: ["EAN-13", "EAN-8", "UPC-A", "UPC-E", "QRCode", "Code128", "Code39"],
      maxNumberOfSymbols: 1,
    };
    const results = await readBarcodes(blob, readerOptions);
    if (results.length > 0 && results[0].text) {
      return { text: results[0].text.trim(), format: results[0].format ?? "" };
    }
    return null;
  } catch (error) {
    console.warn("Toy barcode decode error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ===== AUTH =====
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
      global: { headers: { Authorization: authHeader } },
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

    // ===== RATE LIMIT =====
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const { data: usageData, error: usageError } = await supabaseService.rpc(
      "increment_api_usage",
      { p_user_id: userId, p_function_name: "toy-label-ocr", p_limit: MONTHLY_LIMIT }
    );
    if (usageError) {
      console.error("Usage tracking error:", usageError);
    } else if (usageData && !usageData.allowed) {
      return new Response(
        JSON.stringify({
          error: usageData.message,
          code: "QUOTA_EXCEEDED",
          current_count: usageData.current_count,
          limit: usageData.limit,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== INPUT =====
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parseResult = ToyOCRSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({
        error: "Invalid input",
        details: parseResult.error.errors.map((e) => e.message),
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { image } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured.");
    }

    // ===== Decode barcode server-side =====
    const barcode = await decodeBarcodeFromBase64(image);
    let barcodeHint = "";
    if (barcode) {
      console.log("Toy barcode detected:", barcode.format, barcode.text);
      barcodeHint = `\n\nBARCODE DETECTED on this image (format ${barcode.format}): ${barcode.text}\nUse this as 'unique_product_identifier' and set identifier_type accordingly (GTIN for EAN-13/UPC-A/EAN-8).`;
    }

    const userPromptText =
      "Analyze this toy packaging / product image and extract every visible DPP field. Read all sides of the box, including small legal print, the manufacturer block, CE mark area, age recommendation, warnings, and barcode."
      + barcodeHint;

    // ===== AI call =====
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            ],
          },
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_toy_data" } },
        temperature: 0.1,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI processing failed: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_toy_data") {
      throw new Error("Unexpected AI response format");
    }

    let extracted: Record<string, unknown>;
    try {
      extracted = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("AI returned invalid JSON");
    }

    // ===== Sanitize: strip empty, filter fragrance IDs against allowlist =====
    const mergedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(extracted)) {
      if (value === null || value === undefined || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      mergedData[key] = value;
    }

    if (Array.isArray(mergedData.allergenic_fragrance_ids)) {
      const allow = new Set(KNOWN_TOY_FRAGRANCE_IDS);
      mergedData.allergenic_fragrance_ids = (mergedData.allergenic_fragrance_ids as string[])
        .filter((id) => typeof id === "string" && allow.has(id));
      if ((mergedData.allergenic_fragrance_ids as string[]).length === 0) {
        delete mergedData.allergenic_fragrance_ids;
      }
    }

    // Backfill from barcode if AI missed it
    if (barcode && !mergedData.unique_product_identifier) {
      mergedData.unique_product_identifier = barcode.text;
      if (!mergedData.identifier_type && /^\d{8,14}$/.test(barcode.text)) {
        mergedData.identifier_type = "GTIN";
      }
    }

    // Derive a friendly product_name for PassportForm meta
    const dppName = [mergedData.brand_name, mergedData.model_name]
      .filter((v) => typeof v === "string" && (v as string).trim().length > 0)
      .join(" ")
      .trim();
    if (dppName) {
      mergedData.product_name = dppName;
    }

    const remaining = usageData ? usageData.remaining : null;

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: mergedData,
        qrCodeUsed: barcode !== null,
        ...(remaining !== null && { quota: { remaining, limit: MONTHLY_LIMIT } }),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("toy-label-ocr error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process toy image",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
