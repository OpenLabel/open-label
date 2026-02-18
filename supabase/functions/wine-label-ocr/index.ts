import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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
      (val) => /^data:image\/(png|jpeg|jpg|webp|gif);base64,/.test(val),
      "Invalid image format - must be a valid base64 data URL"
    ),
});

const MONTHLY_LIMIT = 100;

// All fields that can be extracted - matches WineFields.tsx form fields
const EXTRACTION_TOOL = {
  type: "function" as const,
  function: {
    name: "extract_wine_label_data",
    description: "Extract structured data from a wine label, analysis document, or wine product page",
    parameters: {
      type: "object",
      properties: {
        // Product Identity
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
        // Producer
        producer_name: { type: "string", description: "Producer/winery/château name" },
        bottler_info: { type: "string", description: "Bottler name and address if different from producer" },
        // Analysis values (per liter)
        alcohol_percent: { type: "number", description: "Alcohol percentage (e.g., 13.5)" },
        residual_sugar: { type: "number", description: "Residual sugar in g/L" },
        total_acidity: { type: "number", description: "Total acidity in g/L (as tartaric acid)" },
        glycerine: { type: "number", description: "Glycerine/glycerol/polyols in g/L" },
        // Nutritional values (per 100ml)
        energy_kcal: { type: "number", description: "Energy in kcal per 100ml" },
        energy_kj: { type: "number", description: "Energy in kJ per 100ml" },
        carbohydrates: { type: "number", description: "Carbohydrates in g per 100ml" },
        sugar: { type: "number", description: "Sugar in g per 100ml" },
        fat: { type: "number", description: "Fat in g per 100ml (usually 0 for wine)" },
        saturated_fat: { type: "number", description: "Saturated fat in g per 100ml (usually 0)" },
        proteins: { type: "number", description: "Proteins in g per 100ml (usually 0)" },
        salt: { type: "number", description: "Salt in g per 100ml (usually 0)" },
        // Ingredients (as list of known ingredient IDs from the system)
        detected_ingredients: {
          type: "array",
          items: { type: "string" },
          description: "List of detected ingredient names (e.g., 'Sulfites', 'Tartaric acid', 'Gum arabic')"
        },
      },
      additionalProperties: false
    }
  }
};

const SYSTEM_PROMPT = `You are a wine label and document data extractor. Analyze wine label images, technical sheets, analysis documents, or wine product web pages and extract structured information.

PRODUCT IDENTITY:
- product_name: The full product/wine name as it appears (e.g., "Château Margaux 2015")
- product_type: "wine", "aromatized" (e.g., mulled wine), "fortified" (e.g., port, sherry), or "spirits"
- grape_variety: The grape variety (e.g., "Cabernet Sauvignon", "Merlot", "Chardonnay")
- vintage: The year (e.g., "2020") or "NV" for non-vintage
- volume: The bottle volume as a number (e.g., 750 for 750ml)
- volume_unit: The unit (ml, cl, or L)
- country: The country of origin
- region: The wine region (e.g., "Bordeaux", "Napa Valley", "Burgundy")
- denomination: Any designation (AOC, AOP, IGP, DOC, DOCG, etc.)
- sugar_classification: Sugar level if mentioned (Brut, Sec, Demi-Sec, Doux, Extra Brut, etc.)

PRODUCER INFORMATION:
- producer_name: The winery/producer/château name
- bottler_info: Bottler name and address if different from producer

NUTRITIONAL & ANALYSIS VALUES (per liter or percentage):
- alcohol_percent: The alcohol percentage as a number (e.g., 13.5)
- residual_sugar: Residual sugar in g/L (e.g., 2.5)
- total_acidity: Total acidity in g/L expressed as tartaric acid (e.g., 5.5)
- glycerine: Glycerine/glycerol/polyols content in g/L (e.g., 8.5)

CALCULATED NUTRITIONAL VALUES (per 100ml - only if explicitly stated):
- energy_kcal, energy_kj, carbohydrates, sugar, fat, saturated_fat, proteins, salt

INGREDIENTS:
- detected_ingredients: List ingredient names found on the label or page (e.g., "Sulfites", "Tartaric acid", "Gum arabic", "Egg", "Milk")

Be conservative - only extract data you can clearly read. Do not guess or make up values.
For analysis values, pay attention to units and convert to the expected format if needed.`;

/**
 * Attempt to detect a QR code URL in the image using the AI model,
 * then scrape that URL with Firecrawl to get additional product data.
 */
async function tryQrCodeScrape(
  imageBase64: string,
  lovableApiKey: string,
  firecrawlApiKey: string,
): Promise<Record<string, unknown> | null> {
  try {
    // Step 1: Ask AI to detect QR code URL in the image
    const qrResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Look at this image. Is there a QR code visible? If yes, what URL does it encode? Reply with ONLY the URL if found, or "NONE" if no QR code is visible or the URL cannot be read. Do not add any other text.'
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0,
      }),
    });

    if (!qrResponse.ok) {
      console.log("QR detection AI call failed:", qrResponse.status);
      await qrResponse.text();
      return null;
    }

    const qrData = await qrResponse.json();
    const qrContent = qrData.choices?.[0]?.message?.content?.trim();
    
    if (!qrContent || qrContent === "NONE" || !qrContent.startsWith("http")) {
      console.log("No QR code URL detected in image");
      return null;
    }

    console.log("QR code URL detected:", qrContent);

    // Step 2: Use Firecrawl to scrape the QR code URL
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: qrContent,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!scrapeResponse.ok) {
      console.log("Firecrawl scrape failed:", scrapeResponse.status);
      await scrapeResponse.text();
      return null;
    }

    const scrapeData = await scrapeResponse.json();
    const markdown = scrapeData.data?.markdown || scrapeData.markdown;

    if (!markdown || markdown.trim().length < 50) {
      console.log("Firecrawl returned insufficient content");
      return null;
    }

    console.log("Firecrawl scraped content length:", markdown.length);

    // Step 3: Extract wine data from the scraped page content
    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `This is the content of a wine product web page (scraped from a QR code on a wine label). Extract all wine product information you can find.\n\nPage content:\n${markdown.slice(0, 15000)}`
          }
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_wine_label_data" } },
        temperature: 0.1,
      }),
    });

    if (!extractResponse.ok) {
      console.log("QR content extraction failed:", extractResponse.status);
      await extractResponse.text();
      return null;
    }

    const extractData = await extractResponse.json();
    const toolCall = extractData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "extract_wine_label_data") {
      return null;
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log("Extracted data from QR code page:", Object.keys(extracted));
    return extracted;

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

    // ===== PARALLEL: Image extraction + QR code detection =====
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    // Start both tasks in parallel
    const imageExtractionPromise = fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this wine label or document and extract all visible information. Return all fields you can identify."
              },
              {
                type: "image_url",
                image_url: { url: image }
              }
            ]
          }
        ],
        tools: [EXTRACTION_TOOL],
        tool_choice: { type: "function", function: { name: "extract_wine_label_data" } },
        temperature: 0.1,
      }),
    });

    const qrScrapePromise = FIRECRAWL_API_KEY
      ? tryQrCodeScrape(image, LOVABLE_API_KEY, FIRECRAWL_API_KEY)
      : Promise.resolve(null);

    const [imageResponse, qrData] = await Promise.all([imageExtractionPromise, qrScrapePromise]);

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

    // ===== MERGE: QR data (base) + Image data (override) =====
    // Image data takes priority since it's the primary source,
    // but QR-scraped data fills in gaps
    const mergedData: Record<string, unknown> = {};

    // Start with QR data as base (if available)
    if (qrData) {
      for (const [key, value] of Object.entries(qrData)) {
        if (value !== null && value !== undefined && value !== "") {
          mergedData[key] = value;
        }
      }
      console.log("QR data provided", Object.keys(qrData).length, "fields as base");
    }

    // Override with image-extracted data (primary source)
    for (const [key, value] of Object.entries(imageExtracted)) {
      if (value !== null && value !== undefined && value !== "") {
        mergedData[key] = value;
      }
    }

    console.log("Final merged data for user", userId, ":", Object.keys(mergedData));

    const remaining = usageData ? usageData.remaining : null;

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedData: mergedData,
        qrCodeUsed: qrData !== null,
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
