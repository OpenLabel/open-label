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

// Counterfeit-protection lead delivery: one email (SDR replies via Reply-To)
// and one Slack lead, each tracked in a service-role-only ledger so retries
// only resend the channel that has not been recorded as sent.

export type Channel = "email" | "slack";
export type DeliveryState = "sent" | "failed" | "skipped";

export type LeadPassport = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  public_slug: string | null;
  category_data: unknown;
};

export type ClaimResult =
  | { outcome: "claimed"; token: string; requestedAt: string }
  | { outcome: "sent"; requestedAt: string }
  | { outcome: "busy" }
  | { outcome: "forbidden" };

export type CounterfeitLeadDeps = {
  authenticate(token: string): Promise<{ id: string; email: string } | null>;
  findPassportBySlug(slug: string): Promise<LeadPassport | null>;
  companyName(userId: string): Promise<string | null>;
  siteConfig(): Promise<{ senderEmail: string | null; senderName: string | null; siteUrl: string | null }>;
  ledger: {
    claim(passportId: string, userId: string, channel: Channel): Promise<ClaimResult>;
    finish(passportId: string, channel: Channel, token: string, ok: boolean): Promise<boolean>;
  };
  env(name: string): string | undefined;
  fetch: typeof fetch;
  now(): Date;
  log(message: string): void;
};

export const LEAD_EMAIL_TO = "contact@cypheme.com";
const DEFAULT_SITE = "https://open-label.eu";
const PROVIDER_TIMEOUT_MS = 10_000;
const SLACK_CHANNEL_RE = /^[CG][A-Z0-9]{8,12}$/;
const SLACK_TOKEN_RE = /^xoxb-[A-Za-z0-9-]{10,}$/;
const SLUG_RE = /\/p\/([a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})(?:[/?#]|$)/i;
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
    .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
    .replace(/[*_`~]/g, " ")
    .replace(/@(channel|here|everyone)\b/gi, "@\u2060$1")
    .replace(/\s+/g, " ")
    .trim();
  if (v.length > max) v = v.slice(0, Math.max(0, max - 1)).trimEnd() + "\u2026";
  // Escape last so < and > can never form <!channel>, <@U...> or links.
  v = v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return v || "-";
}

export type LeadFields = {
  company: string;
  email: string;
  productName: string;
  category: string;
  passportUrl: string;
  passportId: string;
  requestedAt: string;
};

export function buildSlackLeadText(f: LeadFields): string {
  const s = sanitizeSlackValue;
  return [
    "##SOURCE_OPENLABEL##",
    `Company: ${s(f.company, 200)}`,
    `Email: ${s(f.email, 255)}`,
    `Product Name: ${s(f.productName, 300)}`,
    `Product Category: ${s(f.category, 60)}`,
    `Passport URL: ${s(f.passportUrl, 300)}`,
    `Passport ID: ${s(f.passportId, 64)}`,
    "Message: Counterfeit protection requested for this Digital Product Passport",
    `Email Follow-up: An email was sent to ${LEAD_EMAIL_TO} with Reply-To set to the requester. Reply to that email to contact the lead directly.`,
    `Requested At: ${s(f.requestedAt, 40)}`,
  ].join("\n\n");
}

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const oneLine = (v: string, max: number) => {
  // deno-lint-ignore no-control-regex
  const t = v.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1) + "\u2026" : t;
};

function safeSiteOrigin(raw: string | null): string {
  try {
    if (!raw) return DEFAULT_SITE;
    const u = new URL(raw);
    if (u.protocol !== "https:" || u.username || u.password) return DEFAULT_SITE;
    return u.origin;
  } catch {
    return DEFAULT_SITE;
  }
}

async function sendEmail(deps: CounterfeitLeadDeps, f: LeadFields, sender: { email: string | null; name: string | null }): Promise<boolean> {
  const key = deps.env("RESEND_API_KEY");
  if (!key) { deps.log("counterfeit-lead: email not configured"); return false; }
  if (!sender.email || !EMAIL_RE.test(sender.email)) { deps.log("counterfeit-lead: sender not configured"); return false; }
  const senderName = oneLine(sender.name || "Open Label .eu", 100).replace(/[<>"]/g, "");
  const row = (label: string, value: string, link = false) =>
    `<tr><td style="color:#666;padding:6px 0;font-size:14px;width:140px;">${label}</td><td style="color:#1a1a1a;padding:6px 0;font-size:14px;">${
      link ? `<a href="${escapeHtml(value)}">${escapeHtml(value)}</a>` : escapeHtml(value)
    }</td></tr>`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h2>Counterfeit Protection Request</h2>
<p>A user requested counterfeit protection with a security seal for this Digital Product Passport. Reply to this email to contact the requester directly.</p>
<table style="width:100%;border-collapse:collapse;">
${row("Company", f.company)}
${row("Requester email", f.email)}
${row("Product name", f.productName)}
${row("Category", f.category)}
${row("Passport URL", f.passportUrl, true)}
${row("Passport ID", f.passportId)}
${row("Requested at (UTC)", f.requestedAt)}
</table>
<p style="color:#999;font-size:12px;">Sent from Open Label .eu</p>
</div>`;
  try {
    const res = await deps.fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${senderName} <${sender.email}>`,
        to: [LEAD_EMAIL_TO],
        reply_to: f.email,
        subject: `Counterfeit Protection Request - ${oneLine(f.productName, 150)}`,
        html,
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
    await res.body?.cancel().catch(() => {});
    if (!res.ok) { deps.log(`counterfeit-lead: email provider status ${res.status}`); return false; }
    return true;
  } catch (e) {
    deps.log(`counterfeit-lead: email provider ${e instanceof DOMException && e.name === "TimeoutError" ? "timeout" : "network error"}`);
    return false;
  }
}

async function sendSlack(deps: CounterfeitLeadDeps, f: LeadFields): Promise<boolean> {
  const token = deps.env("SLACK_BOT_TOKEN");
  const channel = deps.env("SLACK_LEADS_CHANNEL_ID");
  if (!token || !SLACK_TOKEN_RE.test(token)) { deps.log("counterfeit-lead: slack token missing or invalid"); return false; }
  if (!channel || !SLACK_CHANNEL_RE.test(channel)) { deps.log("counterfeit-lead: slack channel missing or invalid"); return false; }
  try {
    const res = await deps.fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        channel,
        text: buildSlackLeadText(f),
        mrkdwn: false,
        parse: "none",
        link_names: false,
        unfurl_links: false,
        unfurl_media: false,
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
    if (!res.ok) {
      await res.body?.cancel().catch(() => {});
      deps.log(`counterfeit-lead: slack status ${res.status}`);
      return false;
    }
    const data = await res.json().catch(() => null) as { ok?: boolean; error?: unknown } | null;
    if (!data?.ok) {
      const code = typeof data?.error === "string" && /^[a-z_]{1,40}$/.test(data.error) ? data.error : "unknown";
      deps.log(`counterfeit-lead: slack rejected (${code})`);
      return false;
    }
    return true;
  } catch (e) {
    deps.log(`counterfeit-lead: slack ${e instanceof DOMException && e.name === "TimeoutError" ? "timeout" : "network error"}`);
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
    if (!passport || passport.user_id !== user.id || !passport.public_slug) {
      return json(403, { success: false, error: "Passport not found for this user" });
    }
    const cd = passport.category_data as Record<string, unknown> | null;
    if (!cd || typeof cd !== "object" || cd.counterfeit_protection_enabled !== true) {
      return json(409, { success: false, error: "Counterfeit protection is not enabled on this passport" });
    }

    const [company, site] = await Promise.all([deps.companyName(user.id), deps.siteConfig()]);
    const base: Omit<LeadFields, "requestedAt"> = {
      company: company?.trim() || "Not provided",
      email: user.email,
      productName: passport.name,
      category: passport.category,
      passportUrl: `${safeSiteOrigin(site.siteUrl)}/p/${passport.public_slug}`,
      passportId: passport.id,
    };

    const deliveries: Record<Channel, DeliveryState> = { email: "skipped", slack: "skipped" };
    for (const channel of ["email", "slack"] as const) {
      const claim = await deps.ledger.claim(passport.id, user.id, channel);
      if (claim.outcome === "forbidden") return json(403, { success: false, error: "Passport not found for this user" });
      if (claim.outcome === "busy") return json(409, { success: false, error: "Request already in progress", deliveries });
      if (claim.outcome === "sent") { deliveries[channel] = "sent"; continue; }
      const fields: LeadFields = { ...base, requestedAt: claim.requestedAt || deps.now().toISOString() };
      const ok = channel === "email"
        ? await sendEmail(deps, fields, { email: site.senderEmail, name: site.senderName })
        : await sendSlack(deps, fields);
      const recorded = await deps.ledger.finish(passport.id, channel, claim.token, ok);
      deliveries[channel] = ok && recorded ? "sent" : "failed";
    }

    if (deliveries.email === "sent" && deliveries.slack === "sent") return json(200, { success: true, deliveries });
    return json(502, { success: false, error: "Lead delivery incomplete, please retry", deliveries });
  } catch {
    deps.log("counterfeit-lead: internal error");
    return json(500, { success: false, error: "Internal error" });
  }
}
