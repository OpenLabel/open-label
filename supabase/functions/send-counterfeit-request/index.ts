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

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  handleCounterfeitLead,
  type ClaimResult,
  type CounterfeitLeadDeps,
  type LeadPassport,
} from "../_shared/counterfeitLeadHandler.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const authClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const deps: CounterfeitLeadDeps = {
  async authenticate(token) {
    const { data, error } = await authClient.auth.getClaims(token);
    const claims = data?.claims;
    if (error || !claims?.sub || typeof claims.email !== "string") return null;
    return { id: String(claims.sub), email: claims.email };
  },
  async findPassportBySlug(slug) {
    const { data, error } = await admin
      .from("passports")
      .select("id, user_id, name, category, public_slug, category_data")
      .eq("public_slug", slug)
      .maybeSingle();
    if (error) throw new Error("lookup failed");
    return (data as LeadPassport | null) ?? null;
  },
  async companyName(userId) {
    const { data } = await admin.from("profiles").select("company_name").eq("user_id", userId).maybeSingle();
    return (data?.company_name as string | null) ?? null;
  },
  async siteUrl() {
    const { data } = await admin.from("site_config").select("value").eq("key", "site_url").maybeSingle();
    return (data?.value as string | null) ?? null;
  },
  ledger: {
    async claim(passportId, userId) {
      const { data, error } = await admin.rpc("claim_counterfeit_slack_lead", { p_passport_id: passportId, p_user_id: userId });
      if (error || !data) throw new Error("ledger claim failed");
      const d = data as { outcome: string; token?: string };
      if (d.outcome === "claimed" && d.token) return { outcome: "claimed", token: d.token };
      if (d.outcome === "sent") return { outcome: "sent" };
      return { outcome: d.outcome === "forbidden" ? "forbidden" : "busy" } as ClaimResult;
    },
    async finish(passportId, token, ok) {
      const { data, error } = await admin.rpc("finish_counterfeit_slack_lead", { p_passport_id: passportId, p_token: token, p_ok: ok });
      if (error) return false;
      return data === true;
    },
  },
  env: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
  now: () => new Date(),
  log: (m) => console.error(m),
};

Deno.serve((req) => handleCounterfeitLead(req, deps));
