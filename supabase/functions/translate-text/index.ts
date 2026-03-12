// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// EU language names for context
const languageNames: Record<string, string> = {
  bg: "Bulgarian",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fi: "Finnish",
  fr: "French",
  ga: "Irish",
  hr: "Croatian",
  hu: "Hungarian",
  it: "Italian",
  lt: "Lithuanian",
  lv: "Latvian",
  mt: "Maltese",
  nl: "Dutch",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  sk: "Slovak",
  sl: "Slovenian",
  sv: "Swedish",
};

interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguages: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguages }: TranslateRequest = await req.json();

    if (!text?.trim()) {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetLanguages?.length) {
      return new Response(
        JSON.stringify({ error: "No target languages provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const targetLangList = targetLanguages
      .map((code) => `${code}: ${languageNames[code] || code}`)
      .join(", ");

    const prompt = `You are a professional translator specializing in wine and food product terminology for EU Digital Product Passports. Translate the following text accurately and professionally.

Source language: ${sourceLangName}
Source text: "${text}"

Translate to these languages: ${targetLangList}

Important guidelines:
- This is for official EU regulatory compliance (Digital Product Passport)
- Use official terminology for wine/food products in each language
- For wine terms like appellations (AOC, AOP, DOC, etc.), keep them as-is or use the local equivalent
- For sugar classifications (Brut, Sec, Demi-Sec), use the standard term in each language if one exists
- Preserve any technical terms, E-numbers, or regulatory codes exactly
- If a term is a proper noun or brand, keep it unchanged
- Be concise - these are product label terms, not sentences

Respond ONLY with a valid JSON object where keys are language codes and values are translations.
Example format: {"de": "German translation", "fr": "French translation"}

Do not include the source language in the response.`;

    // Use Lovable AI endpoint
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let translations: Record<string, string>;
    try {
      // Handle potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let jsonStr = jsonMatch ? jsonMatch[1] : content;
      jsonStr = jsonStr.trim();
      
      // If JSON is truncated (no closing brace), try to recover
      if (!jsonStr.endsWith("}")) {
        // Find the last complete key-value pair and close the object
        const lastCompleteQuote = jsonStr.lastIndexOf('",');
        if (lastCompleteQuote > 0) {
          jsonStr = jsonStr.substring(0, lastCompleteQuote + 1) + "}";
        } else {
          // Try finding the last complete value without trailing comma
          const lastQuote = jsonStr.lastIndexOf('"');
          const bracePos = jsonStr.lastIndexOf('{');
          if (lastQuote > bracePos) {
            jsonStr = jsonStr.substring(0, lastQuote + 1) + "}";
          }
        }
      }
      
      translations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse translation response");
    }

    // Validate that we got translations for the requested languages
    const validTranslations: Record<string, string> = {};
    for (const lang of targetLanguages) {
      if (translations[lang] && typeof translations[lang] === "string") {
        validTranslations[lang] = translations[lang];
      }
    }

    return new Response(
      JSON.stringify({ translations: validTranslations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Translation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Translation failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
