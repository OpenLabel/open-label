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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { resolvePublicPassportHistory } from "../_shared/publicPassportHistoryResolver.ts";
import { createEphemeralRateLimiter } from "../_shared/ephemeralRateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation - slug must be 8, 16, or 32 hex characters (BUG-11: allow legacy 8-char slugs)
const SlugSchema = z.object({
  slug: z.string()
    .regex(/^[a-f0-9]{8}$|^[a-f0-9]{16}$|^[a-f0-9]{32}$/, "Invalid passport identifier"),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
  history_before: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
});

// Security-only rate state expires automatically and contains no raw IP addresses.
const rateLimiter = createEphemeralRateLimiter();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", Allow: "GET, POST, OPTIONS", ...corsHeaders },
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || "unknown";
    
    if (!await rateLimiter.check(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      if (req.method === "GET") {
        const params = new URL(req.url).searchParams;
        const positiveInteger = (key: string) => {
          const value = params.get(key);
          return value === null ? undefined : /^[1-9][0-9]*$/.test(value) ? Number(value) : NaN;
        };
        body = { slug: params.get("slug"), version: positiveInteger("version"), history_before: positiveInteger("history_before") };
      } else {
        body = await req.json();
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const parseResult = SlugSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid passport identifier" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { slug } = parseResult.data;

    // Use service role to bypass RLS and fetch the specific passport
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch only the specific passport by exact slug match
    // Only return public fields (exclude user_id)
    const { data: livePassport, error } = await supabase
      .from("passports")
      .select("id, name, description, category, category_data, image_url, language, public_slug, created_at, updated_at")
      .eq("public_slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Public passport database lookup failed");
      return new Response(
        JSON.stringify({ error: "Failed to fetch passport" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const passport = await resolvePublicPassportHistory(livePassport, parseResult.data, {
      async getArchive(publicSlug) {
        const { data, error } = await supabase.from("car_cleaning_passport_archives")
          .select("passport_id, product_identifier, public_slug, latest_version, retained_until, withdrawn_at")
          .eq("public_slug", publicSlug).maybeSingle();
        if (error) throw new Error("Retained passport lookup failed");
        return data;
      },
      async getVersion(passportId, version) {
        const { data, error } = await supabase.from("car_cleaning_passport_versions")
          .select("snapshot").eq("passport_id", passportId).eq("version", version).maybeSingle();
        if (error) throw new Error("Retained passport version lookup failed");
        return data;
      },
      async getIndex(passportId, before, limit) {
        let query = supabase.from("car_cleaning_passport_versions")
          .select("version, recorded_at").eq("passport_id", passportId)
          .order("version", { ascending: false }).limit(limit);
        if (before !== undefined) query = query.lt("version", before);
        const { data, error } = await query;
        if (error) throw new Error("Retained passport index lookup failed");
        return data ?? [];
      },
    });
    if (!passport) {
      return new Response(
        JSON.stringify({ error: "Passport or requested version not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ passport }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", ...corsHeaders } }
    );
  } catch {
    console.error("Public passport request failed");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
