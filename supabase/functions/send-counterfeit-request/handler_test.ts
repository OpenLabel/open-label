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
  buildPassportSnapshot,
  PRODUCT_SNAPSHOT_KEYS,
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
const RESEND = "https://api.resend.com/emails";
const NOW = "2026-10-28T10:03:00.000Z";
const PID = "11111111-2222-3333-4444-555555555555";

type St = "none" | "pending" | "sent" | "failed";
type Slot = { status: St; token?: string; claimedAt: number };
type Row = { userId: string; email: Slot; slack: Slot };

function makeLedger() {
  const rows = new Map<string, Row>();
  let clock = Date.parse(NOW);
  let n = 0;
  return {
    rows,
    advance(ms: number) { clock += ms; },
    set(passportId: string, email: Partial<Slot>, slack: Partial<Slot>) {
      rows.set(passportId, { userId: "user-1", email: { status: "none", claimedAt: 0, ...email }, slack: { status: "none", claimedAt: 0, ...slack } });
    },
    async claim(passportId: string, userId: string, channel: "email" | "slack") {
      await Promise.resolve();
      if (!rows.has(passportId)) rows.set(passportId, { userId, email: { status: "none", claimedAt: 0 }, slack: { status: "none", claimedAt: 0 } });
      const r = rows.get(passportId)!;
      if (r.userId !== userId) return { outcome: "forbidden" as const };
      const c = r[channel];
      if (c.status === "sent") return { outcome: "sent" as const };
      if (c.status === "pending" && clock - c.claimedAt < 120_000) return { outcome: "busy" as const };
      const token = `tok-${++n}`;
      Object.assign(c, { status: "pending", token, claimedAt: clock });
      return { outcome: "claimed" as const, token };
    },
    async finish(passportId: string, channel: "email" | "slack", token: string, ok: boolean) {
      await Promise.resolve();
      const c = rows.get(passportId)?.[channel];
      if (!c || c.status !== "pending" || c.token !== token) return false;
      c.status = ok ? "sent" : "failed";
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
  resend?: (call: Call) => Response | Promise<Response>;
  senderEmail?: string | null;
  ledger?: ReturnType<typeof makeLedger>;
  company?: string | null;
  siteUrl?: string | null;
  account?: { passportCount: number | null; createdAt: string | null };
} = {}) {
  const calls: Call[] = [];
  const logs: string[] = [];
  const envReads: string[] = [];
  const accountReads: string[] = [];
  const ledger = opts.ledger ?? makeLedger();
  const env: Record<string, string | undefined> = { SLACK_OPENLABEL_LEADS_WEBHOOK_URL: WEBHOOK, RESEND_API_KEY: "re_fake_key", ...(opts.env ?? {}) };
  const p = opts.passport === undefined ? passport() : opts.passport;
  const deps: CounterfeitLeadDeps = {
    authenticate: async (t) => t === "good" ? { id: "user-1", email: opts.email ?? "buyer@example.com" } : null,
    findPassportBySlug: async (slug) => p?.public_slug === slug ? p : null,
    companyName: async () => opts.company === undefined ? "Acme Wines" : opts.company,
    accountSnapshot: async (userId) => {
      accountReads.push(userId);
      return opts.account ?? { passportCount: 3, createdAt: "2026-09-01T08:00:00.000Z" };
    },
    siteConfig: async () => ({
      senderEmail: opts.senderEmail === undefined ? "noreply@cypheme.org" : opts.senderEmail,
      senderName: "Open Label .eu",
      siteUrl: opts.siteUrl === undefined ? "https://open-label.eu" : opts.siteUrl,
    }),
    ledger,
    env: (k) => { envReads.push(k); return env[k]; },
    now: () => new Date(NOW),
    log: (m) => logs.push(m),
    fetch: async (input, init = {}) => {
      const url = String(input);
      const call = { url, init, body: JSON.parse(String((init as { body?: unknown }).body ?? "{}")) };
      calls.push(call);
      if (url === RESEND) return opts.resend ? await opts.resend(call) : new Response('{"id":"e1"}', { status: 200 });
      if (url === WEBHOOK) return opts.slack ? await opts.slack(call) : new Response("ok", { status: 200 });
      throw new Error("unexpected url");
    },
  };
  return { deps, calls, logs, ledger, envReads, accountReads };
}

const req = (body: unknown = { userEmail: "buyer@example.com", passportName: "browser name", passportUrl: `https://evil.example/p/${SLUG}` }, token: string | null = "good") =>
  new Request("http://x/send-counterfeit-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });


const EXPECTED_DPP = `DPP: <https://open-label.eu/p/${SLUG}|Open Digital Product Passport>`;
const FOLLOW_UP = "Email Follow-up: An email was sent to contact@cypheme.eu with Reply-To set to the requester. Reply to that email to contact the lead directly.";
const slackCalls = (t: { calls: Call[] }) => t.calls.filter((c) => c.url === WEBHOOK);
const emailCalls = (t: { calls: Call[] }) => t.calls.filter((c) => c.url === RESEND);

Deno.test("sends one email then one Slack lead with exact text including Email Follow-up", async () => {
  const t = setup();
  const res = await handleCounterfeitLead(req(), t.deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { success: true, delivery: "sent" });
  assertEquals(t.calls.map((c) => c.url), [RESEND, WEBHOOK]);
  const c = t.calls[1];
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
    FOLLOW_UP,
    `Requested At: ${NOW}`,
    "Fields filled: 0",
    "Passports in account: 3",
    "Account created at: 2026-09-01T08:00:00.000Z",
  ].join("\n\n"));
  assertFalse(String(c.body.text).includes("evil.example"));
  assertFalse(String(c.body.text).includes("browser name"));
});

Deno.test("exactly one Resend call with To contact@cypheme.eu, Reply-To requester, server-side fields", async () => {
  const t = setup();
  await (await handleCounterfeitLead(req(), t.deps)).text();
  const e = emailCalls(t);
  assertEquals(e.length, 1);
  assertEquals(e[0].body.to, ["contact@cypheme.eu"]);
  assertEquals(e[0].body.reply_to, "buyer@example.com");
  assertEquals(e[0].body.from, "Open Label .eu <noreply@cypheme.org>");
  assertEquals((e[0].init.headers as Record<string, string>).Authorization, "Bearer re_fake_key");
  const html = String(e[0].body.html);
  for (const v of ["Acme Wines", "buyer@example.com", "Chateau Example 2022", "wine", `https://open-label.eu/p/${SLUG}`, PID, NOW]) assert(html.includes(v), v);
  assertFalse(html.includes("evil.example") || html.includes("browser name"));
});

Deno.test("never uses the Slack bot token or channel ID", async () => {
  const t = setup({ env: { SLACK_BOT_TOKEN: "xoxb-x", SLACK_LEADS_CHANNEL_ID: "C1" } });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  assertEquals(t.calls.filter((c) => c.url.includes("slack.com/api")).length, 0);
  assertEquals([...new Set(t.envReads)].sort(), ["RESEND_API_KEY", "SLACK_OPENLABEL_LEADS_WEBHOOK_URL"]);
});

Deno.test("DPP line uses trusted origin only and is not escaped", () => {
  assertEquals(buildDppLine("https://open-label.eu/some/path?x=1", SLUG), EXPECTED_DPP);
  assertEquals(buildDppLine("http://attacker.example", SLUG), EXPECTED_DPP);
  assertThrows(() => buildDppLine("https://open-label.eu", "abc|<!channel>"));
  const text = buildSlackLeadText({ company: "a", email: "b@c.de", productName: "<x>", category: "wine", origin: "https://open-label.eu", slug: SLUG, passportId: PID, requestedAt: NOW });
  assert(text.includes(EXPECTED_DPP));
  assertFalse(text.includes("&lt;https"));
});

Deno.test("sanitizes each user field in Slack and escapes HTML in the email", async () => {
  const t = setup({
    company: "<!channel> *Bold* _it_ ~s~ `c` | x\nline2 @here",
    passport: passport({ name: "<https://phish.example|Click> & more\r\n" + "z".repeat(500), category: "wine<@U123>" }),
  });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  const lines = String(slackCalls(t)[0].body.text).split("\n\n");
  assertEquals(lines.length, 13);
  assertEquals(lines[1], "Company: &lt;!channel&gt; Bold it s c x line2 @\u2060here");
  assert(lines[3].startsWith("Product Name: &lt;https://phish.example Click&gt; &amp; more"));
  assert(lines[3].length <= "Product Name: ".length + 300 + 20);
  assertEquals(lines[4], "Product Category: wine&lt;@U123&gt;");
  assertEquals(lines[5], EXPECTED_DPP);
  assertEquals(lines[8], FOLLOW_UP);
  assertEquals(sanitizeSlackValue("", 10), "-");
  assertFalse(String(emailCalls(t)[0].body.html).includes("<!channel>"));
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

Deno.test("repeated and concurrent saves send only one email and one Slack post", async () => {
  const t = setup();
  const results = await Promise.all([1, 2, 3].map(() => handleCounterfeitLead(req(), t.deps)));
  for (const r of results) await r.text();
  assertEquals(emailCalls(t).length, 1);
  assertEquals(slackCalls(t).length, 1);
  const again = await handleCounterfeitLead(req(), t.deps);
  assertEquals(again.status, 200);
  await again.text();
  assertEquals(t.calls.length, 2);
});

Deno.test("email failure: no Slack, retryable error; retry sends email then Slack", async () => {
  let fail = true;
  const t = setup({ resend: () => fail ? new Response("err", { status: 500 }) : new Response("{}") });
  const r1 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r1.status, 502);
  await r1.text();
  assertEquals(slackCalls(t).length, 0);
  assertEquals(t.ledger.rows.get(PID)!.email.status, "failed");
  assertEquals(t.ledger.rows.get(PID)!.slack.status, "none");
  fail = false;
  const r2 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r2.status, 200);
  await r2.text();
  assertEquals(t.calls.map((c) => c.url), [RESEND, RESEND, WEBHOOK]);
});

Deno.test("email network error, missing key or sender: no Slack", async () => {
  for (const t of [
    setup({ resend: () => { throw new TypeError("net"); } }),
    setup({ env: { RESEND_API_KEY: undefined } }),
    setup({ senderEmail: null }),
  ]) {
    assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 502);
    assertEquals(slackCalls(t).length, 0);
  }
});

Deno.test("busy email claim returns without Slack", async () => {
  const ledger = makeLedger();
  ledger.set(PID, { status: "pending", token: "old", claimedAt: Date.parse(NOW) }, {});
  const t = setup({ ledger });
  const busy = await handleCounterfeitLead(req(), t.deps);
  assertEquals(busy.status, 409);
  await busy.text();
  assertEquals(t.calls.length, 0);
});

Deno.test("email sent and Slack failed: retry posts Slack only", async () => {
  let fail = true;
  const t = setup({ slack: () => fail ? new Response("invalid_payload", { status: 400 }) : new Response("ok") });
  const r1 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r1.status, 502);
  await r1.text();
  assertEquals(t.ledger.rows.get(PID)!.email.status, "sent");
  assertEquals(t.ledger.rows.get(PID)!.slack.status, "failed");
  fail = false;
  const r2 = await handleCounterfeitLead(req(), t.deps);
  assertEquals(r2.status, 200);
  await r2.text();
  assertEquals(emailCalls(t).length, 1);
  assertEquals(slackCalls(t).length, 2);
});

Deno.test("non-ok Slack 200 body does not mark Slack sent", async () => {
  const t = setup({ slack: () => new Response("no_service", { status: 200 }) });
  assertEquals((await handleCounterfeitLead(req(), t.deps)).status, 502);
  assertEquals(t.ledger.rows.get(PID)!.slack.status, "failed");
});

Deno.test("Slack already sent under the Slack-only version: send only the email", async () => {
  const ledger = makeLedger();
  ledger.set(PID, {}, { status: "sent" });
  const t = setup({ ledger });
  const res = await handleCounterfeitLead(req(), t.deps);
  assertEquals(res.status, 200);
  await res.text();
  assertEquals(t.calls.map((c) => c.url), [RESEND]);
  const again = await handleCounterfeitLead(req(), t.deps);
  await again.text();
  assertEquals(t.calls.length, 1);
});

Deno.test("stale pending claims recover after 2 minutes, fresh ones stay busy", async () => {
  const ledger = makeLedger();
  ledger.set(PID, { status: "sent" }, { status: "pending", token: "old", claimedAt: Date.parse(NOW) });
  const t = setup({ ledger });
  const busy = await handleCounterfeitLead(req(), t.deps);
  assertEquals(busy.status, 409);
  await busy.text();
  assertEquals(t.calls.length, 0);
  ledger.advance(121_000);
  const ok = await handleCounterfeitLead(req(), t.deps);
  assertEquals(ok.status, 200);
  await ok.text();
  assertEquals(t.calls.map((c) => c.url), [WEBHOOK]);
  assertFalse(await ledger.finish(PID, "slack", "old", false));
});

Deno.test("secrets never appear in responses or logs", async () => {
  const t = setup({ slack: () => new Response("x", { status: 500 }) });
  const body = await (await handleCounterfeitLead(req(), t.deps)).text();
  assertFalse(body.includes("fakeSecretPart") || body.includes("re_fake_key"));
  assertFalse(t.logs.join("\n").includes("fakeSecretPart") || t.logs.join("\n").includes("re_fake_key"));
});

for (const [category, data, expected] of [
  ["wine", { brand: "Estate", producer_name: "Winemaker", country: "France", description: "Dry wine", ean: "0012345678905" }, ["Estate", "Winemaker", "France", "Dry wine", "0012345678905"]],
  ["battery", { manufacturer_trade_name: "Power", manufacturer_name: "Cell maker", country_of_origin: "Germany", product_description: "Rechargeable cell", gtin: "0012345678905" }, ["Power", "Cell maker", "Germany", "Rechargeable cell", "0012345678905"]],
  ["car_cleaning", { brand_name: "Clean", manufacturer_name: "Cleaner maker", country_of_origin: "Belgium", short_description: "Car shampoo", gtin: "0012345678905" }, ["Clean", "Cleaner maker", "Belgium", "Car shampoo", "0012345678905"]],
  ["unknown_category", { brand: "Generic", producer_name: "Maker", country_of_origin: "Portugal", description: "Product", ean: "0012345678905" }, ["Generic", "Maker", "Portugal", "Product", "0012345678905"]],
] as const) {
  Deno.test(`product snapshot maps ${category} identity fields`, () => {
    const rows = buildPassportSnapshot(category, { ...data, counterfeit_protection_enabled: true });
    assertEquals(rows.map((r) => r.label), ["Brand", "Manufacturer / producer", "Country of origin", "Product description", "GTIN/EAN", "Fields filled"]);
    assertEquals(rows.map((r) => r.value), [...expected, "5"]);
  });
}

Deno.test("mapping covers every registered category without substituting operator countries or model IDs", () => {
  assertEquals(Object.keys(PRODUCT_SNAPSHOT_KEYS).sort(), ["wine", "toys", "textiles", "detergents", "battery", "car_cleaning", "construction", "electronics", "iron_steel", "aluminum", "cosmetics", "furniture", "tires", "other"].sort());
  for (const category of ["toys", "textiles", "detergents"]) {
    const rows = buildPassportSnapshot(category, { brand_name: "Brand", manufacturer_legal_name: "Legal maker", manufacturer_country: "Operator country", unique_product_identifier: "MODEL-1" });
    assertEquals(rows.map((r) => r.value), ["Brand", "Legal maker", "4"]);
    assertFalse(rows.some((r) => r.label === "Country of origin" || r.label === "GTIN/EAN"));
  }
});

Deno.test("empty values are omitted and filled count treats zero and false as filled top-level values", () => {
  const rows = buildPassportSnapshot("other", {
    counterfeit_protection_enabled: true, brand: "   ", brand_name: "Fallback brand",
    manufacturer_name: null, producer_name: "", country_of_origin: undefined,
    description: [], gtin: {}, emptyList: [null, " "], emptyObject: { empty: "" },
    zero: 0, no: false, list: ["filled", "more"], object: { nested: "filled" }, invalid: NaN,
  });
  assertEquals(rows.map((r) => [r.label, r.value]), [["Brand", "Fallback brand"], ["Fields filled", "5"]]);
  for (const data of [null, undefined, [], "invalid"]) {
    assertEquals(buildPassportSnapshot("toString", data).map((r) => r.value), ["0"]);
  }
});

Deno.test("email and Slack preserve server-side snapshots even after the passport is removed during delivery", async () => {
  const data: Record<string, unknown> = {
    counterfeit_protection_enabled: true, brand: "Estate", producer_name: "Winemaker",
    country: "France", description: "Dry wine", ean: "0012345678905",
  };
  const t = setup({
    passport: passport({ category_data: data }),
    resend: () => {
      // Simulate deletion after the server has taken the snapshot.
      for (const key of Object.keys(data)) delete data[key];
      return new Response("{}");
    },
  });
  const res = await handleCounterfeitLead(req({
    userEmail: "buyer@example.com", passportUrl: `https://open-label.eu/p/${SLUG}`,
    category_data: { brand: "Forged brand" }, passportCount: 999, createdAt: "Forged date",
  }), t.deps);
  assertEquals(res.status, 200);
  await res.text();
  assertEquals(t.accountReads, ["user-1"]);
  const lines = String(slackCalls(t)[0].body.text).split("\n\n");
  assertEquals(lines.slice(0, 10), [
    "##SOURCE_OPENLABEL##", "Company: Acme Wines", "Email: buyer@example.com",
    "Product Name: Chateau Example 2022", "Product Category: wine", EXPECTED_DPP,
    `Passport ID: ${PID}`, "Message: Counterfeit protection requested for this Digital Product Passport",
    FOLLOW_UP, `Requested At: ${NOW}`,
  ]);
  assertEquals(lines.slice(10), [
    "Brand: Estate", "Manufacturer / producer: Winemaker", "Country of origin: France",
    "Product description: Dry wine", "GTIN/EAN: 0012345678905", "Fields filled: 5",
    "Passports in account: 3", "Account created at: 2026-09-01T08:00:00.000Z",
  ]);
  const html = String(emailCalls(t)[0].body.html);
  assert(html.indexOf("<h3>Passport snapshot</h3>") > html.indexOf("Requested at (UTC)"));
  assert(html.indexOf("<h3>Account</h3>") > html.indexOf("<h3>Passport snapshot</h3>"));
  for (const value of ["Estate", "Winemaker", "France", "Dry wine", "0012345678905", "Passports in account", "2026-09-01T08:00:00.000Z"]) assert(html.includes(value), value);
  assertFalse(html.includes("Forged") || lines.join(" ").includes("Forged"));
});

Deno.test("new snapshot values are escaped, sanitized, capped, and missing account values are omitted", async () => {
  const t = setup({
    passport: passport({ category_data: { counterfeit_protection_enabled: true, brand: '<!channel> "Brand" & <x>', description: "@here\n" + "z".repeat(1000) } }),
    account: { passportCount: null, createdAt: null },
  });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  const text = String(slackCalls(t)[0].body.text);
  assert(text.includes('Brand: &lt;!channel&gt; "Brand" &amp; &lt;x&gt;'));
  const description = text.split("\n\n").find((line) => line.startsWith("Product description:"));
  assert(description);
  assertEquals(description, `Product description: ${sanitizeSlackValue("@here\n" + "z".repeat(1000), 300)}`);
  const html = String(emailCalls(t)[0].body.html);
  assert(html.includes("&lt;!channel&gt; &quot;Brand&quot; &amp; &lt;x&gt;"));
  assertFalse(html.includes("<!channel>") || html.includes("z".repeat(301)));
  for (const label of ["Manufacturer / producer", "Country of origin", "GTIN/EAN", "Passports in account", "Account created at", "Published", "Draft"]) {
    assertFalse(text.includes(`${label}:`) || html.includes(`>${label}</td>`));
  }
  assertFalse(html.includes("<h3>Account</h3>"));
});

Deno.test("account passport count includes zero and a snapshot lookup failure sends nothing", async () => {
  const t = setup({ account: { passportCount: 0, createdAt: "" } });
  await (await handleCounterfeitLead(req(), t.deps)).text();
  assert(String(slackCalls(t)[0].body.text).includes("Passports in account: 0"));
  const failed = setup();
  failed.deps.accountSnapshot = async () => { throw new Error("lookup failed"); };
  const response = await handleCounterfeitLead(req(), failed.deps);
  assertEquals(response.status, 500);
  await response.text();
  assertEquals(failed.calls.length, 0);
  assertEquals(failed.ledger.rows.size, 0);
});
