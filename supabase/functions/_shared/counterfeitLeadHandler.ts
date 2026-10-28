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

// Counterfeit-protection lead delivery: Slack only, through one dedicated
// incoming webhook (SLACK_OPENLABEL_LEADS_WEBHOOK_URL). A service-role-only
// ledger holds one Slack delivery state per passport so repeated or concurrent
// saves never post a second lead.

export type DeliveryState = "sent" | "failed";

export type LeadPassport = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  public_slug: string | null;
  category_data: unknown;
};

export type ClaimResult =
  | { outcome: "claimed"; token: string }
  | { outcome: "sent" }
  | { outcome: "busy" }
  | { outcome: "forbidden" };

export type CounterfeitLeadDeps = {
  authenticate(token: string): Promise<{ id: string; email: string } | null>;
  findPassportBySlug(slug: string): Promise<LeadPassport | null>;
  companyName(userId: string): Promise<string | null>;
  siteUrl(): Promise<string | null>;
  ledger: {
    claim(passportId: string, userId: string): Promise<ClaimResult>;
    finish(passportId: string, token: string, ok: boolean): Promise<boolean>;
  };
  env(name: string): string | undefined;
  fetch: typeof fetch;
  now(): Date;
  log(message: string): void;
};

export const WEBHOOK_SECRET_NAME = "SLACK_OPENLABEL_LEADS_WEBHOOK_URL";
const DEFAULT_SITE = "https://open-label.eu";
const PROVIDER_TIMEOUT_MS = 10_000;
const SLUG_RE = /\/p\/([a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})(?:[/?#]|$)/i;
const STORED_SLUG_RE = /^(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/;
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...cors },
  });

/** One line, bounded, with Slack markup, links and mentions neutralized. */
export function sanitizeSlackValue(value: unknown, max: number): string {
  let v = String(value ?? "")
    // deno-lint-ignore no-control-regex
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    .replace(/[*_`~|]/g, " ")
    .replace(/@(channel|here|everyone)\b/gi, "@\u2060$1")
    .replace(/\s+/g, " ")
    .trim();
  if (v.length > max) v = v.slice(0, Math.max(0, max - 1)).trimEnd() + "\u2026";
  // Escape last so < and > can never form <!channel>, <@U...> or links.
  v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return v || "-";
}

/** Returns the webhook URL only if it is an https://hooks.slack.com/services/ URL. */
export function validateWebhookUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:" || u.hostname !== "hooks.slack.com" || u.port || u.username || u.password) return null;
    if (!u.pathname.startsWith("/services/")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function safeSiteOrigin(raw: string | null): string {
  try {
    if (!raw) return DEFAULT_SITE;
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password) return DEFAULT_SITE;
    return u.origin;
  } catch {
    return DEFAULT_SITE;
  }
}

export type LeadFields = {
  company: string;
  email: string;
  productName: string;
  category: string;
  origin: string;
  slug: string;
  passportId: string;
  requestedAt: string;
};

/** The DPP line is built from a trusted origin and a validated hex slug, never sanitized. */
export function buildDppLine(origin: string, slug: string): string {
  if (!STORED_SLUG_RE.test(slug)) throw new Error("invalid slug");
  return `DPP: <${safeSiteOrigin(origin)}/p/${slug}|Open Digital Product Passport>`;
}

export function buildSlackLeadText(f: LeadFields): string {
  const s = sanitizeSlackValue;
  return [
    "##SOURCE_OPENLABEL##",
    `Company: ${s(f.company, 200)}`,
    `Email: ${s(f.email, 255)}`,
    `Product Name: ${s(f.productName, 300)}`,
    `Product Category: ${s(f.category, 60)}`,
    buildDppLine(f.origin, f.slug),
    `Passport ID: ${s(f.passportId, 64)}`,
    "Message: Counterfeit protection requested for this Digital Product Passport",
    `Requested At: ${s(f.requestedAt, 40)}`,
  ].join("\n\n");
}

async function sendSlack(deps: CounterfeitLeadDeps, webhook: string, f: LeadFields): Promise<boolean> {
  try {
    const res = await deps.fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ text: buildSlackLeadText(f), mrkdwn: true, unfurl_links: false, unfurl_media: false }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      redirect: "error",
    });
    const text = await res.text().catch(() => "");
    if (!res.ok || text.trim() !== "ok") {
      deps.log(`counterfeit-lead: slack webhook rejected (status ${res.status})`);
      return false;
    }
    return true;
  } catch (e) {
    deps.log(`counterfeit-lead: slack webhook ${e instanceof DOMException && e.name === "TimeoutError" ? "timeout" : "network error"}`);
    return false;
  }
}

export async function handleCounterfeitLead(req: Request, deps: CounterfeitLeadDeps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { success: false, error: "Method not allowed" });

  const token = req.headers.get("Authorization")?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return json(401, { success: false, error: "Unauthorized" });

  try {
    const user = await deps.authenticate(token);
    if (!user?.id || !user.email) return json(401, { success: false, error: "Unauthorized" });

    let body: unknown;
    try { body = await req.json(); } catch { return json(400, { success: false, error: "Invalid JSON body" }); }
    const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
    // Payload kept for compatibility; only the email (identity check) and slug are read.
    if (typeof b.userEmail !== "string" || !EMAIL_RE.test(b.userEmail) || b.userEmail.length > 255) {
      return json(400, { success: false, error: "Invalid input" });
    }
    if (typeof b.passportUrl !== "string" || b.passportUrl.length > 2000) {
      return json(400, { success: false, error: "Invalid input" });
    }
    if (b.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      return json(403, { success: false, error: "Email does not match authenticated user" });
    }
    const slug = b.passportUrl.match(SLUG_RE)?.[1]?.toLowerCase();
    if (!slug) return json(400, { success: false, error: "Invalid passport URL" });

    const passport = await deps.findPassportBySlug(slug);
    if (!passport || passport.user_id !== user.id || !passport.public_slug || !STORED_SLUG_RE.test(passport.public_slug)) {
      return json(403, { success: false, error: "Passport not found for this user" });
    }
    const cd = passport.category_data as Record<string, unknown> | null;
    if (!cd || typeof cd !== "object" || cd.counterfeit_protection_enabled !== true) {
      return json(409, { success: false, error: "Counterfeit protection is not enabled on this passport" });
    }

    const webhook = validateWebhookUrl(deps.env(WEBHOOK_SECRET_NAME));
    if (!webhook) {
      deps.log("counterfeit-lead: lead channel not configured");
      return json(503, { success: false, error: "Lead delivery unavailable, please retry later" });
    }

    const claim = await deps.ledger.claim(passport.id, user.id);
    if (claim.outcome === "forbidden") return json(403, { success: false, error: "Passport not found for this user" });
    if (claim.outcome === "sent") return json(200, { success: true, delivery: "sent" });
    if (claim.outcome === "busy") return json(409, { success: false, error: "Request already in progress" });

    const [company, siteUrl] = await Promise.all([deps.companyName(user.id), deps.siteUrl()]);
    const fields: LeadFields = {
      company: company?.trim() || "Not provided",
      email: user.email,
      productName: passport.name,
      category: passport.category,
      origin: safeSiteOrigin(siteUrl),
      slug: passport.public_slug,
      passportId: passport.id,
      requestedAt: deps.now().toISOString(),
    };
    const ok = await sendSlack(deps, webhook, fields);
    const recorded = await deps.ledger.finish(passport.id, claim.token, ok);
    if (ok && recorded) return json(200, { success: true, delivery: "sent" });
    return json(502, { success: false, error: "Lead delivery incomplete, please retry", delivery: "failed" });
  } catch {
    deps.log("counterfeit-lead: internal error");
    return json(500, { success: false, error: "Internal error" });
  }
}
