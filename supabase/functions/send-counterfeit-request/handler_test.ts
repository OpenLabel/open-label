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

import { assert, assertEquals, assertFalse, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildDppLine,
  buildSlackLeadText,
  handleCounterfeitLead,
  sanitizeSlackValue,
  validateWebhookUrl,
  type CounterfeitLeadDeps,
  type LeadPassport,
} from "../_shared/counterfeitLeadHandler.ts";

// Fake webhook value. It exists only to prove nothing echoes it back.
const WEBHOOK = "https://hooks.slack.com/services/TFAKE/BFAKE/fakeSecretPart123";
const SLUG = "0123456789abcdef";
const NOW = "2026-10-28T10:03:00.000Z";
const PID = "11111111-2222-3333-4444-555555555555";

type Row = { userId: string; status: "none" | "pending" | "sent" | "failed"; token?: string; claimedAt: number };

function makeLedger() {
  const rows = new Map<string, Row>();
  let clock = Date.parse(NOW);
  let n = 0;
  return {
    rows,
    advance(ms: number) { clock += ms; },
    async claim(passportId: string, userId: string) {
      await Promise.resolve();
      if (!rows.has(passportId)) rows.set(passportId, { userId, status: "none", claimedAt: 0 });
      const r = rows.get(passportId)!;
      if (r.userId !== userId) return { outcome: "forbidden" as const };
      if (r.status === "sent") return { outcome: "sent" as const };
      if (r.status === "pending" && clock - r.claimedAt < 120_000) return { outcome: "busy" as const };
      const token = `tok-${++n}`;
      Object.assign(r, { status: "pending", token, claimedAt: clock });
      return { outcome: "claimed" as const, token };
    },
    async finish(passportId: string, token: string, ok: boolean) {
      await Promise.resolve();
      const r = rows.get(passportId);
      if (!r || r.status !== "pending" || r.token !== token) return false;
      r.status = ok ? "sent" : "failed";
      return true;
    },
  };
}

const passport = (over: Partial<LeadPassport> = {}): LeadPassport => ({
  id: PID, user_id: "user-1", name: "Chateau Example 2022", category: "wine",
  public_slug: SLUG, category_data: { counterfeit_protection_enabled: true }, ...over,
});

type Call = { url: string; init: RequestInit; body: Record<string, unknown> };

function setup(opts: {
  passport?: LeadPassport | null;
  email?: string;
  env?: Record<string, string | undefined>;
  slack?: (call: Call) => Response | Promise<Response>;
  ledger?: ReturnType<typeof makeLedger>;
  company?: string | null;
  siteUrl?: string | null;
} = {}) {
  const calls: Call[] = [];
  const logs: string[] = [];
  const envReads: string[] = [];
  const ledger = opts.ledger ?? makeLedger();
  const env: Record<string, string | undefined> = { SLACK_OPENLABEL_LEADS_WEBHOOK_URL: WEBHOOK, ...(opts.env ?? {}) };
  const p = opts.passport === undefined ? passport() : opts.passport;
  const deps: CounterfeitLeadDeps = {
    authenticate: async (t) => t === "good" ? { id: "user-1", email: opts.email ?? "buyer@example.com" } : null,
    findPassportBySlug: async (slug) => p?.public_slug === slug ? p : null,
    companyName: async () => opts.company === undefined ? "Acme Wines" : opts.company,
    siteUrl: async () => opts.siteUrl === undefined ? "https://open-label.eu" : opts.siteUrl,
    ledger,
    env: (k) => { envReads.push(k); return env[k]; },
    now: () => new Date(NOW),
    log: (m) => logs.push(m),
    fetch: async (input, init = {}) => {
      const url = String(input);
      const call = { url, init, body: JSON.parse(String((init as { body?: unknown }).body ?? "{}")) };
      calls.push(call);
      if (url === WEBHOOK) return opts.slack ? await opts.slack(call) : new Response("ok", { status: 200 });
      throw new Error("unexpected url");
    },
  };
  return { deps, calls, logs, ledger, envReads };
}

const req = (body: unknown = { userEmail: "buyer@example.com", passportName: "browser name", passportUrl: `https://evil.example/p/${SLUG}` }, token: string | null = "good") =>
  new Request("http://x/send-counterfeit-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const EXPECTED_DPP = `DPP: <https://open-label.eu/p/${SLUG}|Open Digital Product Passport>`;

Deno.test("posts one Slack lead with exact field order, clickable DPP line and mrkdwn on", async () => {
  const t = setup();
  const res = await handleCounterfeitLead(req(), t.deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { success: true, delivery: "sent" });
  assertEquals(t.calls.length, 1);
  const c = t.calls[0];
  assertEquals(c.url, WEBHOOK);
  assertEquals(c.body.mrkdwn, true);
  assertEquals(c.body.unfurl_links, false);
  assertEquals(c.body.unfurl_media, false);
  assertEquals(Object.keys(c.body).sort(), ["mrkdwn", "text", "unfurl_links", "unfurl_media"]);
  assertEquals(c.body.text, [
    "##SOURCE_OPENLABEL##",
    "Company: Acme Wines",
    "Email: buyer@example.com",
    "Product Name: Chateau Example 2022",
    "Product Category: wine",
    EXPECTED_DPP,
    `Passport ID: ${PID}`,
    "Message: Counterfeit protection requested for this Digital Product Passport",
    `Requested At: ${NOW}`,
  ].join("\n\n"));
  assertFalse(String(c.body.text).includes("Email Follow-up"));
  assertFalse(String(c.body.text).includes("evil.example"));
  assertFalse(String(c.body.text).includes("browser name"));
});

Deno.test("never calls Resend and never reads email or bot-token secrets", async () => {
  const t = setup({ env: { RESEND_API_KEY: "re_x", SLACK_BOT_TOKEN: "xoxb-x", SLACK_LEADS_CHANNEL_ID: "C1" } });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  assertEquals(t.calls.filter((c) => c.url.includes("resend")).length, 0);
  assertEquals(t.calls.filter((c) => c.url.includes("slack.com/api")).length, 0);
  assertEquals([...new Set(t.envReads)], ["SLACK_OPENLABEL_LEADS_WEBHOOK_URL"]);
});

Deno.test("DPP line uses trusted origin only and is not escaped", () => {
  assertEquals(buildDppLine("https://open-label.eu/some/path?x=1", SLUG), EXPECTED_DPP);
  assertEquals(buildDppLine("http://attacker.example", SLUG), EXPECTED_DPP);
  assertThrows(() => buildDppLine("https://open-label.eu", "abc|<!channel>"));
  const text = buildSlackLeadText({ company: "a", email: "b@c.de", productName: "<x>", category: "wine", origin: "https://open-label.eu", slug: SLUG, passportId: PID, requestedAt: NOW });
  assert(text.includes(EXPECTED_DPP));
  assertFalse(text.includes("&lt;https"));
});

Deno.test("sanitizes each user field: one line, bounded, mentions and formatting neutralized", async () => {
  const t = setup({
    company: "<!channel> *Bold* _it_ ~s~ `c` | x\nline2 @here",
    passport: passport({ name: "<https://phish.example|Click> & more\r\n" + "z".repeat(500), category: "wine<@U123>" }),
  });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  const lines = String(t.calls[0].body.text).split("\n\n");
  assertEquals(lines.length, 9);
  assertEquals(lines[1], "Company: &lt;!channel&gt; Bold it s c x line2 @\u2060here");
  assert(lines[3].startsWith("Product Name: &lt;https://phish.example Click&gt; &amp; more"));
  assert(lines[3].length <= "Product Name: ".length + 300 + 20);
  assertEquals(lines[4], "Product Category: wine&lt;@U123&gt;");
  assertEquals(lines[5], EXPECTED_DPP);
  assertEquals(sanitizeSlackValue("", 10), "-");
});

Deno.test("webhook secret validation fails closed with generic error", async () => {
  const bad = [undefined, "", "not a url", "http://hooks.slack.com/services/T/B/x", "https://hooks.slack.com.evil.example/services/T",
    "https://evil.example/services/T/B/x", "https://hooks.slack.com/api/x", "https://user:pw@hooks.slack.com/services/T", "https://hooks.slack.com:8443/services/T"];
  for (const v of bad) {
    assertEquals(validateWebhookUrl(v), null, String(v));
    const t = setup({ env: { SLACK_OPENLABEL_LEADS_WEBHOOK_URL: v } });
    const res = await handleCounterfeitLead(req(), t.deps);
    assertEquals(res.status, 503);
    const body = await res.text();
    assertFalse(body.includes("hooks.slack") || body.includes("SLACK_"));
    assertEquals(t.calls.length, 0);
    assertEquals(t.ledger.rows.size, 0);
  }
  assertEquals(validateWebhookUrl(WEBHOOK), WEBHOOK);
});

Deno.test("authorization: missing/invalid token, email mismatch, other owner, protection off", async () => {
  let t = setup();
  assertEquals((await handleCounterfeitLead(req(undefined, null), t.deps)).status, 401);
  assertEquals((await handleCounterfeitLead(req(undefined, "bad"), t.deps)).status, 401);
  t = setup({ email: "other@example.com" });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 403);
  t = setup({ passport: passport({ user_id: "user-2" }) });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 403);
  t = setup({ passport: passport({ category_data: { counterfeit_protection_enabled: false } }) });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 409);
  t = setup({ passport: null });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 403);
  assertEquals(t.calls.length, 0);
});

Deno.test("repeated and concurrent saves post only one lead", async () => {
  const t = setup();
  const results = await Promise.all([1, 2, 3].map(() => handleCounterfeitLead(req(), t.deps)));
  for (const r of results) await r.text();
  assertEquals(t.calls.length, 1);
  const again = await handleCounterfeitLead(req(), t.deps);
  assertEquals(again.status, 200);
  await again.text();
  assertEquals(t.calls.length, 1);
});

Deno.test("failed delivery is not marked sent and retries", async () => {
  let fail = true;
  const t = setup({ slack: () => fail ? new Response("invalid_payload", { status: 400 }) : new Response("ok") });
  const r1 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r1.status, 502);
  await r1.text();
  assertEquals(t.ledger.rows.get(PID)!.status, "failed");
  fail = false;
  const r2 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r2.status, 200);
  await r2.text();
  assertEquals(t.calls.length, 2);
  assertEquals(t.ledger.rows.get(PID)!.status, "sent");
});

Deno.test("network error and non-ok 200 body do not mark sent", async () => {
  const t = setup({ slack: () => { throw new TypeError("net"); } });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 502);
  const t2 = setup({ slack: () => new Response("no_service", { status: 200 }) });
  assertEquals((await handleCounterfeitLead(req(), t2.deps)).status, 502);
  assertEquals(t2.ledger.rows.get(PID)!.status, "failed");
});

Deno.test("stale pending claim recovers, fresh one stays busy", async () => {
  const ledger = makeLedger();
  ledger.rows.set(PID, { userId: "user-1", status: "pending", token: "old", claimedAt: Date.parse(NOW) });
  const t = setup({ ledger });
  const busy = await handleCounterfeitLead(req(), t.deps);
  assertEquals(busy.status, 409);
  await busy.text();
  assertEquals(t.calls.length, 0);
  ledger.advance(121_000);
  const ok = await handleCounterfeitLead(req(), t.deps);
  assertEquals(ok.status, 200);
  await ok.text();
  assertEquals(t.calls.length, 1);
  assertFalse(await ledger.finish(PID, "old", false));
});

Deno.test("webhook URL never appears in responses or logs", async () => {
  const t = setup({ slack: () => new Response("x", { status: 500 }) });
  const body = await (await handleCounterfeitLead(req(), t.deps)).text();
  assertFalse(body.includes(WEBHOOK) || body.includes("fakeSecretPart"));
  assertFalse(t.logs.join("\n").includes("fakeSecretPart"));
});
