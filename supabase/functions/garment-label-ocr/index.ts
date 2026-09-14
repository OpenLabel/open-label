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

const GarmentOCRSchema = z.object({
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
 * Mirrors src/data/knownFiberIds.ts and the `primary_fiber` select options in
 * src/templates/textiles.ts — sync enforced by src/data/knownFiberIds.test.ts.
 */
const KNOWN_FIBERS: string[] = [
  "cotton", "organic_cotton", "polyester", "recycled_polyester", "wool",
  "linen", "silk", "viscose", "lyocell", "nylon", "elastane", "hemp",
  "leather", "other",
];

const SYNTHETIC_FIBERS = new Set(["polyester", "recycled_polyester", "nylon", "elastane"]);

const WASHING_TEMP_VALUES = ["hand", "30", "40", "60", "95", "dry_clean"];

const IRON_TEMP_VALUES = ["low", "medium", "high"];

const CARE_SYMBOL_VALUES = [
  "wash_30", "wash_40", "wash_60", "hand_wash", "do_not_wash",
  "bleach_allowed", "non_chlorine_bleach", "do_not_bleach",
  "tumble_dry_low", "tumble_dry_normal", "do_not_tumble_dry",
  "iron_low", "iron_medium", "iron_high", "do_not_iron",
  "dry_clean_any", "dry_clean_petroleum", "wet_clean", "do_not_dry_clean",
];

const AUTHENTICATION_METHOD_VALUES = [
  "nfc_tag", "secure_qr", "security_seal", "ai_fingerprint", "rfid", "other",
];

const CERTIFICATION_VALUES = [
  "gots", "oeko_tex", "grs", "bluesign", "fair_trade", "other",
];



function buildFiberPromptSection(): string {
  return `KNOWN FIBRE IDS (return these exact ids, never free text):
${KNOWN_FIBERS.join(", ")}

Map every language and trade name to the right id:
- coton / algodón / Baumwolle / cotone / katoen / bomull → cotton
- coton biologique / organic cotton / Bio-Baumwolle / GOTS cotton → organic_cotton
- polyester / poliéster / PES / PET → polyester
- recycled polyester / rPET / polyester recyclé → recycled_polyester
- laine / lana / Wolle / merino / cashmere / mohair / alpaca → wool
- lin / lino / Leinen / flax → linen
- soie / seda / Seide / silk → silk
- viscose / rayon / viscosa / Viskose / modal / bamboo viscose → viscose
- lyocell / Tencel / TENCEL™ → lyocell
- polyamide / nylon / poliammide / Polyamid → nylon
- elasthanne / elastane / spandex / Lycra / Elasthan → elastane
- chanvre / cáñamo / Hanf / hemp → hemp
- cuir / cuero / Leder / leather / suede / nubuck → leather
Anything genuinely unmatched must be returned prefixed with "custom:" (e.g. "custom:ramie").`;
}

const EXTRACTION_TOOL = {
  type: "function" as const,
  function: {
    name: "extract_garment_label_data",
    description: "Extract structured Digital Product Passport data from an apparel, footwear or accessory care label, hangtag, swing ticket, tech pack or certificate.",
    parameters: {
      type: "object",
      properties: {
        // Identity
        product_name: { type: "string", description: "Marketing / product name of the garment." },
        brand_name: { type: "string", description: "Brand name printed on the label or hangtag." },
        product_type: { type: "string", description: "What the item is, e.g. T-shirt, trainers, tote bag." },
        gtin: { type: "string", description: "GTIN / EAN / UPC barcode digits." },
        style_reference: { type: "string", description: "Style, model or article reference code." },
        colourway: { type: "string", description: "Colour or colourway name/code." },
        size: { type: "string", description: "Size marking, e.g. M, 40, EU 42." },
        batch_lot: { type: "string", description: "Batch or production lot number." },
        eu_operator_name: { type: "string", description: "EU responsible person / economic operator legal name." },
        eu_operator_address: { type: "string", description: "EU responsible person / economic operator postal address." },

        // Materials and composition
        primary_fiber: { type: "string", enum: KNOWN_FIBERS, description: "Fibre with the highest percentage. Must be a KNOWN FIBRE ID." },
        primary_fiber_percentage: { type: "number", description: "Percentage of the primary fibre (0-100)." },
        secondary_fiber: { type: "string", description: "Second fibre — a KNOWN FIBRE ID where it matches, otherwise 'custom:<name>'." },
        secondary_fiber_percentage: { type: "number", description: "Percentage of the secondary fibre (0-100)." },
        full_composition: { type: "string", description: "Verbatim full fibre composition as printed, e.g. '80% Cotton, 20% Polyester'. Percentages must sum to 100." },
        component_composition: { type: "string", description: "Component-level composition when the label separates outer shell / lining / trims." },
        recycled_content_percentage: { type: "number", description: "Total recycled content percentage if stated." },
        microplastic_shedding: { type: "boolean", description: "True when the detected fibres are synthetic (polyester, recycled polyester, nylon/polyamide, elastane) and therefore shed microplastics on washing." },

        // Supply chain
        country_of_origin: { type: "string", description: "Country in the 'Made in' statement — the making-up / assembly country." },

        // Certifications
        certifications_held: {
          type: "array",
          items: { type: "string", enum: CERTIFICATION_VALUES },
          description: "Certification logos or wording detected on the label or hangtag.",
        },
        certificate_references: { type: "string", description: "Any certificate/licence numbers printed near a certification logo, one per line if multiple, e.g. 'GOTS — CU 123456 GOTS'." },


        // Care
        washing_temp: { type: "string", enum: WASHING_TEMP_VALUES, description: "Maximum wash temperature from the wash tub pictogram, or 'hand' / 'dry_clean'." },
        can_tumble_dry: { type: "boolean", description: "True unless the tumble-dry pictogram is crossed out." },
        can_iron: { type: "boolean", description: "True unless the iron pictogram is crossed out." },
        iron_temp: { type: "string", enum: IRON_TEMP_VALUES, description: "One dot → low, two dots → medium, three dots → high." },
        care_symbols: {
          type: "array",
          items: { type: "string", enum: CARE_SYMBOL_VALUES },
          description: "Care pictograms present on the label, mapped to these option values. Never describe symbols in words here.",
        },
        care_instructions_text: { type: "string", description: "Free-text care wording printed on the label (e.g. 'Wash with similar colours')." },

        // Authentication
        authentication_feature_present: { type: "boolean", description: "True if an NFC tag, serialised QR, security seal or similar is indicated." },
        authentication_method: { type: "string", enum: AUTHENTICATION_METHOD_VALUES },
        authentication_verification_url: { type: "string", description: "Brand verification / authentication URL printed or encoded in a QR code." },
      },
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `You are a garment data extractor for a Digital Product Passport covering apparel, footwear and accessories under Regulation (EU) 1007/2011 (textile fibre names and labelling), the ESPR framework, and Directive (EU) 2024/825 (Empowering Consumers).

SOURCES you will be given: sewn-in care labels, hangtags and swing tickets, product tech packs and spec sheets supplied as PDF, and certification certificates.

CRITICAL RULES:
- Extract ONLY what is clearly visible. Never guess, never infer a plausible value. A wrong DPP value is a legal risk.
- Read EVERY side of a care label, including the reverse and the folded-under portion — composition and origin are usually printed there.
- Fibre composition is legally mandatory under EU 1007/2011, so it MUST be present somewhere on the label or tech pack. Keep looking before giving up.
- Composition percentages must sum to 100. If your reading does not sum to 100, re-read the label rather than inventing a remainder.
- Care symbols are pictograms. Map them to the care_symbols option values; never describe them in words in that field.
- Certifications: list every certification logo or wording you can see in certifications_held using only the allowed values (gots, oeko_tex, grs, bluesign, fair_trade, other). Put any certificate or licence numbers printed near those logos into certificate_references as free text, one per line. Never assert a certification that is not printed, and never invent a certificate number.
- Use the controlled enum values exactly as specified.
- Labels are multilingual (composition is often repeated in many EU languages) — use any language version that is legible.

${buildFiberPromptSection()}

DO NOT extract or return:
- Internal evidence documents (audit certificates, LCA reports, test reports, substantiation evidence).
- Disposition record fields, green-claims substantiation fields, durability test results, or carbon/water footprint figures.
None of those appear on a garment label and guessing them would be actively harmful.`;

const ALL_FIELD_KEYS = [
  "product_name", "brand_name", "product_type", "gtin", "style_reference",
  "colourway", "size", "batch_lot", "eu_operator_name", "eu_operator_address",
  "primary_fiber", "primary_fiber_percentage", "secondary_fiber",
  "secondary_fiber_percentage", "full_composition", "component_composition",
  "recycled_content_percentage", "country_of_origin",
  "certifications_held", "certificate_references",

  "washing_temp", "can_tumble_dry", "can_iron", "iron_temp", "care_symbols",
  "care_instructions_text",
  "authentication_feature_present", "authentication_method", "authentication_verification_url",
];

// Field-specific hints for the second pass
const FIELD_HINTS: Record<string, string> = {
  full_composition: "Fibre composition is legally mandatory under EU 1007/2011. Look on the sewn-in care label — often on the reverse or on a second, longer label listing the same text in several languages. Format as printed, e.g. '95% Cotton, 5% Elastane'.",
  primary_fiber: "The fibre with the highest percentage in the composition statement. Return the KNOWN FIBRE ID, not the printed word.",
  primary_fiber_percentage: "The number next to the highest-percentage fibre in the composition statement.",
  country_of_origin: "Look for 'Made in', 'Fabriqué en', 'Hecho en', 'Hergestellt in' followed by a country. Usually at the bottom of the care label.",
  brand_name: "The brand logo or wordmark on the hangtag or the woven neck/brand label — NOT the retailer, not the manufacturer address.",
  style_reference: "An alphanumeric article / style / model code, often near the barcode on the hangtag.",
  gtin: "An 8-14 digit number printed under a barcode on the hangtag or price ticket.",
  size: "Size marking on the size label or hangtag, e.g. S/M/L, 38, EU 42, UK 8.",
  care_symbols: "The pictogram row on the care label: wash tub, triangle (bleach), square with circle (tumble dry), iron, and circle (professional care). Map each to an option value.",
  washing_temp: "The number inside the wash tub pictogram, a hand in the tub (hand wash), or a plain circle with no tub (dry clean only).",
  eu_operator_name: "An EU company name and address block, often prefixed 'Imported by', 'Distributed by', or naming the EU responsible person.",
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

  const focusedPrompt = `You are doing a SECOND PASS on this garment label. The first pass already extracted some data but MISSED several important fields.

HERE IS WHAT WAS ALREADY EXTRACTED (do NOT re-extract these, focus only on what's missing):
${alreadyFoundSummary}

THE FOLLOWING FIELDS ARE STILL MISSING. Look VERY CAREFULLY at the image for each one:
${fieldInstructions}

INSTRUCTIONS:
- Focus ONLY on the missing fields listed above.
- Look at EVERY part of the image: the hangtag front and back, the sewn-in care label including its reverse, the multilingual composition block, and the barcode area.
- Pay special attention to small text, faded print, and text printed on woven ribbon.
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
        tool_choice: { type: "function", function: { name: "extract_garment_label_data" } },
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
    if (!toolCall || toolCall.function.name !== "extract_garment_label_data") return {};

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
 * Third pass: targeted extraction for legally critical fields still missing.
 */
async function runCriticalFieldsPass(
  imageBase64: string,
  mergedData: Record<string, unknown>,
  apiKey: string,
  qrText?: string,
): Promise<Record<string, unknown>> {
  const criticalFields = ["full_composition", "country_of_origin", "brand_name"];
  const stillMissing = criticalFields.filter((key) => {
    const val = mergedData[key];
    return val === null || val === undefined || val === "";
  });

  if (stillMissing.length === 0) return {};

  console.log("Running critical fields pass for:", stillMissing);

  const instructions = stillMissing.map((f) => {
    if (f === "full_composition") return "- full_composition: The fibre composition statement. It is legally mandatory under EU 1007/2011, so it IS on the label — check the reverse of the care label and the multilingual block. Percentages must sum to 100. Also return primary_fiber and primary_fiber_percentage.";
    if (f === "country_of_origin") return "- country_of_origin: The 'Made in' / 'Fabriqué en' / 'Hergestellt in' country, usually at the bottom of the care label.";
    if (f === "brand_name") return "- brand_name: The brand wordmark or logo on the hangtag or woven neck label.";
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
                text: `Look at this garment care label / hangtag / tech pack image. I ONLY need you to find these specific fields:\n${instructions}\n\nThese are legally required on textile products, so they MUST be visible somewhere. Look at every part of the image very carefully.${qrContext}`,
              },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_garment_label_data" } },
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
    if (!toolCall || toolCall.function.name !== "extract_garment_label_data") return {};

    const extracted = JSON.parse(toolCall.function.arguments);
    const result: Record<string, unknown> = {};
    for (const key of [...stillMissing, "primary_fiber", "primary_fiber_percentage"]) {
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

const QR_PRIVATE_IP_PATTERNS: RegExp[] = [
  /^10\./, /^127\./, /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./, /^0\./,
  /^::1$/, /^fc00:/i, /^fd00:/i, /^fe80:/i,
];

function isSafeQrUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return false;
    if (QR_PRIVATE_IP_PATTERNS.some((re) => re.test(host))) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempt to scrape a QR code URL with Firecrawl to get raw text content.
 */
async function tryQrCodeScrape(
  imageBase64: string,
  firecrawlApiKey: string,
): Promise<{ markdown: string; qrUrl: string } | null> {
  try {
    const qrUrl = await decodeQrFromBase64(imageBase64);

    if (!qrUrl) {
      console.log("No QR code URL found by server-side decoder");
      return null;
    }

    if (!isSafeQrUrl(qrUrl)) {
      console.log("QR URL blocked by SSRF guard:", qrUrl);
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
        formats: ["markdown", "html"],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    if (!scrapeResponse.ok) {
      console.log("Firecrawl scrape failed:", scrapeResponse.status);
      await scrapeResponse.text();
      return null;
    }

    const scrapeData = await scrapeResponse.json();
    let markdown = scrapeData.data?.markdown || scrapeData.markdown || "";

    // Content relevance filter: discard scraped content with no garment-related keywords
    const GARMENT_KEYWORDS = /\b(cotton|polyester|wool|linen|viscose|elastane|nylon|composition|fibre|fiber|care|wash|made in|garment|apparel|footwear|coton|laine|algod[oó]n|baumwolle)\b/i;
    if (markdown && !GARMENT_KEYWORDS.test(markdown)) {
      console.warn("Scraped content appears irrelevant (no garment keywords found). Discarding", markdown.length, "chars");
      markdown = "";
    }

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

    return { markdown, qrUrl };
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
      { p_user_id: userId, p_function_name: "garment-label-ocr", p_limit: MONTHLY_LIMIT }
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
    const parseResult = GarmentOCRSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({
        error: "Invalid input",
        details: parseResult.error.errors.map((e) => e.message),
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { image } = parseResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured. Please set it as a Supabase secret.");
    }

    // ===== OPTIONAL: QR decode + Firecrawl enrichment =====
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const qrResult = FIRECRAWL_API_KEY
      ? await tryQrCodeScrape(image, FIRECRAWL_API_KEY)
      : null;

    let userPromptText = "Analyze this garment care label, hangtag, swing ticket, tech pack or certificate and extract every visible DPP field. Read all sides of the care label including the reverse, the multilingual fibre composition block, the 'Made in' statement, the care pictogram row, the brand and style references, and the barcode area.";

    if (qrResult) {
      userPromptText += `\n\nADDITIONAL CONTEXT — Text scraped from a QR code found on this label (URL: ${qrResult.qrUrl}):\n${qrResult.markdown.slice(0, 15000)}\n\nThe label image is the primary source of truth; use the scraped text to fill in details that are hard to read on the image.`;
    }

    // ===== FIRST PASS =====
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
            ],
          },
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_garment_label_data" } },
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
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "extract_garment_label_data") {
      throw new Error("Unexpected AI response format");
    }

    const imageExtracted = JSON.parse(toolCall.function.arguments);

    // ===== SECOND PASS: gap detection =====
    const qrText = qrResult?.markdown;
    const secondPassData = await runSecondPass(image, imageExtracted, LOVABLE_API_KEY, qrText);

    // ===== MERGE: first non-empty value wins =====
    const mergedData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(imageExtracted)) {
      if (value === null || value === undefined || value === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      mergedData[key] = value;
    }

    for (const [key, value] of Object.entries(secondPassData)) {
      if (!(key in mergedData)) {
        mergedData[key] = value;
      }
    }

    // ===== THIRD PASS: legally critical fields =====
    const criticalPassData = await runCriticalFieldsPass(image, mergedData, LOVABLE_API_KEY, qrText);
    for (const [key, value] of Object.entries(criticalPassData)) {
      if (!(key in mergedData)) {
        mergedData[key] = value;
      }
    }

    // ===== SANITIZE =====
    const allowedFibers = new Set(KNOWN_FIBERS);
    if (typeof mergedData.primary_fiber === "string" && !allowedFibers.has(mergedData.primary_fiber)) {
      delete mergedData.primary_fiber;
    }
    if (Array.isArray(mergedData.care_symbols)) {
      const allowedSymbols = new Set(CARE_SYMBOL_VALUES);
      mergedData.care_symbols = (mergedData.care_symbols as string[])
        .filter((s) => typeof s === "string" && allowedSymbols.has(s));
      if ((mergedData.care_symbols as string[]).length === 0) {
        delete mergedData.care_symbols;
      }
    }
    if (Array.isArray(mergedData.certifications_held)) {
      const allowedCerts = new Set(CERTIFICATION_VALUES);
      mergedData.certifications_held = (mergedData.certifications_held as string[])
        .filter((c) => typeof c === "string" && allowedCerts.has(c));
      if ((mergedData.certifications_held as string[]).length === 0) {
        delete mergedData.certifications_held;
      }
    }


    // Infer the microplastic-shedding flag from the detected fibres
    if (mergedData.microplastic_shedding === undefined) {
      const fibers = [mergedData.primary_fiber, mergedData.secondary_fiber]
        .filter((v): v is string => typeof v === "string");
      if (fibers.some((f) => SYNTHETIC_FIBERS.has(f))) {
        mergedData.microplastic_shedding = true;
      }
    }

    // Derive a friendly product_name for PassportForm meta
    if (!mergedData.product_name) {
      const dppName = [mergedData.brand_name, mergedData.product_type]
        .filter((v) => typeof v === "string" && (v as string).trim().length > 0)
        .join(" ")
        .trim();
      if (dppName) {
        mergedData.product_name = dppName;
      }
    }

    console.log("Final merged data for user", userId, ":", Object.keys(mergedData));

    const remaining = usageData ? usageData.remaining : null;

    return new Response(
      JSON.stringify({
        success: true,
        extractedData: mergedData,
        qrCodeUsed: qrResult !== null,
        secondPassUsed: Object.keys(secondPassData).length > 0,
        ...(remaining !== null && { quota: { remaining, limit: MONTHLY_LIMIT } }),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("garment-label-ocr error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to process garment label",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
