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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all referrals
    const { data: referrals, error: refError } = await supabase
      .from("referrals")
      .select("referral_code, user_id");

    if (refError) {
      console.error("Database error:", refError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch referrals" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!referrals || referrals.length === 0) {
      return new Response(
        JSON.stringify({ leaderboard: [] }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all unique referred user IDs
    const userIds = [...new Set(referrals.map((r) => r.user_id))];

    // Get users who have at least 1 passport
    const { data: passports, error: passError } = await supabase
      .from("passports")
      .select("user_id")
      .in("user_id", userIds);

    if (passError) {
      console.error("Database error:", passError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch passport data" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const usersWithPassports = new Set((passports || []).map((p) => p.user_id));

    // Group by referral code
    const codeStats = new Map<string, { total: number; valid: number }>();
    for (const r of referrals) {
      const stats = codeStats.get(r.referral_code) || { total: 0, valid: 0 };
      stats.total++;
      if (usersWithPassports.has(r.user_id)) {
        stats.valid++;
      }
      codeStats.set(r.referral_code, stats);
    }

    // Sort by valid signups descending, then total descending
    const leaderboard = Array.from(codeStats.entries())
      .map(([code, stats]) => ({
        code,
        validSignups: stats.valid,
        totalSignups: stats.total,
      }))
      .sort((a, b) => b.validSignups - a.validSignups || b.totalSignups - a.totalSignups)
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    return new Response(
      JSON.stringify({ leaderboard }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
