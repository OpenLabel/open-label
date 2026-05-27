/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 10 req / min per IP (tighter than public leaderboard)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
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

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // Still do a fake compare to keep timing roughly stable
    let diff = 1;
    const len = Math.max(ab.length, bb.length);
    for (let i = 0; i < len; i++) {
      diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
    }
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  if (!checkRateLimit(clientIP)) {
    return jsonResponse({ error: "Too many requests" }, 429);
  }

  // Resolve expected token: prefer DB (site_config.admin_leaderboard_token),
  // fall back to env for legacy deployments. Never hardcoded.
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let expected = "";
  try {
    const { data: tokenRow } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "admin_leaderboard_token")
      .maybeSingle();
    expected = (tokenRow?.value as string | undefined) ?? "";
  } catch (e) {
    console.error("site_config token lookup error:", e);
  }
  if (!expected) {
    expected = Deno.env.get("ADMIN_LEADERBOARD_PASSWORD") ?? "";
  }
  if (!expected) {
    return jsonResponse(
      { error: "Admin token is not configured. Complete Setup to generate one." },
      503,
    );
  }

  // Accept token via ?token=... or Authorization: Bearer ...
  const url = new URL(req.url);
  let token = url.searchParams.get("token") ?? "";
  if (!token) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth.toLowerCase().startsWith("bearer ")) {
      token = auth.slice(7).trim();
    }
  }

  if (!token || !timingSafeEqual(token, expected)) {
    return jsonResponse({ error: "Forbidden" }, 401);
  }

  try {
    const { data: referrals, error: refError } = await supabase
      .from("referrals")
      .select("referral_code, user_id, created_at");

    if (refError) {
      console.error("referrals error:", refError);
      return jsonResponse({ error: "Failed to fetch referrals" }, 500);
    }

    const refs = referrals ?? [];
    const userIds = [...new Set(refs.map((r) => r.user_id))];

    // Passports → which users count as "valid"
    const { data: passports, error: passError } = userIds.length
      ? await supabase.from("passports").select("user_id").in("user_id", userIds)
      : { data: [], error: null };
    if (passError) {
      console.error("passports error:", passError);
      return jsonResponse({ error: "Failed to fetch passports" }, 500);
    }
    const usersWithPassports = new Set((passports ?? []).map((p) => p.user_id));

    // Page through auth users to map id → email
    const userMap = new Map<
      string,
      { email: string | null; createdAt: string | null }
    >();
    const perPage = 1000;
    for (let page = 1; page < 100; page++) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        console.error("listUsers error:", error);
        break;
      }
      const list = data?.users ?? [];
      for (const u of list) {
        userMap.set(u.id, {
          email: u.email ?? null,
          createdAt: u.created_at ?? null,
        });
      }
      if (list.length < perPage) break;
    }

    // Group by code
    type Signup = {
      email: string | null;
      userId: string;
      signedUpAt: string | null;
      referredAt: string;
      hasPassport: boolean;
    };
    const byCode = new Map<string, Signup[]>();
    for (const r of refs) {
      const u = userMap.get(r.user_id);
      const entry: Signup = {
        email: u?.email ?? null,
        userId: r.user_id,
        signedUpAt: u?.createdAt ?? null,
        referredAt: r.created_at,
        hasPassport: usersWithPassports.has(r.user_id),
      };
      const arr = byCode.get(r.referral_code) ?? [];
      arr.push(entry);
      byCode.set(r.referral_code, arr);
    }

    const leaderboard = Array.from(byCode.entries())
      .map(([code, signups]) => {
        const valid = signups.filter((s) => s.hasPassport).length;
        return {
          code,
          validSignups: valid,
          totalSignups: signups.length,
          signups: signups.sort((a, b) =>
            (b.referredAt ?? "").localeCompare(a.referredAt ?? ""),
          ),
        };
      })
      .sort(
        (a, b) =>
          b.validSignups - a.validSignups ||
          b.totalSignups - a.totalSignups,
      )
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    const totals = {
      codes: leaderboard.length,
      totalSignups: refs.length,
      validSignups: leaderboard.reduce((s, l) => s + l.validSignups, 0),
    };

    return jsonResponse({
      generatedAt: new Date().toISOString(),
      totals,
      leaderboard,
    });
  } catch (err) {
    console.error("admin-leaderboard error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
