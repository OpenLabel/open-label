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

import { assert, assertEquals, assertFalse } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildSlackLeadText,
  handleCounterfeitLead,
  sanitizeSlackValue,
  type Channel,
  type CounterfeitLeadDeps,
  type LeadPassport,
} from "../_shared/counterfeitLeadHandler.ts";

// Fake secret values. They exist only to prove nothing echoes them back.
const RESEND = "re_FAKE_resend_secret_value_123";
const SLACK = "xoxb-FAKE-slack-secret-value-456";
const CHANNEL = "C015DN0V1TL";
const SLUG = "0123456789abcdef";
const NOW = "2026-10-26T17:57:00.000Z";

type Row = { status: "none" | "pending" | "sent" | "failed"; token?: string; claimedAt: number };

function makeLedger() {
  const rows = new Map<string, { userId: string; requestedAt: string; email: Row; slack: Row }>();
  let clock = Date.parse(NOW);
  let n = 0;
  return {
    rows,
    advance(ms: number) { clock += ms; },
    async claim(passportId: string, userId: string, channel: Channel) {
      await Promise.resolve();
      if (!rows.has(passportId)) {
        rows.set(passportId, { userId, requestedAt: NOW, email: { status: "none", claimedAt: 0 }, slack: { status: "none", claimedAt: 0 } });
      }
      const r = rows.get(passportId)!;
      if (r.userId !== userId) return { outcome: "forbidden" as const };
      const c = r[channel];
      if (c.status === "sent") return { outcome: "sent" as const, requestedAt: r.requestedAt };
      if (c.status === "pending" && clock - c.claimedAt < 120_000) return { outcome: "busy" as const };
      const token = `tok-${++n}`;
      r[channel] = { status: "pending", token, claimedAt: clock };
      return { outcome: "claimed" as const, token, requestedAt: r.requestedAt };
    },
    async finish(passportId: string, channel: Channel, token: string, ok: boolean) {
      await Promise.resolve();
      const c = rows.get(passportId)?.[channel];
      if (!c || c.status !== "pending" || c.token !== token) return false;
      c.status = ok ? "sent" : "failed";
      return true;
    },
  };
}

const passport = (over: Partial<LeadPassport> = {}): LeadPassport => ({
  id: "11111111-2222-3333-4444-555555555555",
  user_id: "user-1",
  name: "Chateau Example 2022",
  category: "wine",
  public_slug: SLUG,
  category_data: { counterfeit_protection_enabled: true },
  ...over,
});

type Call = { url: string; init: RequestInit; body: Record<string, unknown> };

function setup(opts: {
  passport?: LeadPassport | null;
  email?: string;
  env?: Record<string, string | undefined>;
  resend?: (call: Call) => Response | Promise<Response>;
  slack?: (call: Call) => Response | Promise<Response>;
  ledger?: ReturnType<typeof makeLedger>;
  company?: string | null;
} = {}) {
  const calls: Call[] = [];
  const logs: string[] = [];
  const ledger = opts.ledger ?? makeLedger();
  const env: Record<string, string | undefined> = {
    RESEND_API_KEY: RESEND, SLACK_BOT_TOKEN: SLACK, SLACK_LEADS_CHANNEL_ID: CHANNEL, ...(opts.env ?? {}),
  };
  const deps: CounterfeitLeadDeps = {
    authenticate: async (token) => token === "good" ? { id: "user-1", email: opts.email ?? "buyer@example.com" } : null,
    findPassportBySlug: async (slug) => (opts.passport === undefined ? passport() : opts.passport)?.public_slug === slug
      ? (opts.passport === undefined ? passport() : opts.passport) : null,
    companyName: async () => opts.company === undefined ? "Acme Wines" : opts.company,
    siteConfig: async () => ({ senderEmail: "noreply@cypheme.org", senderName: "Open Label .eu", siteUrl: "https://open-label.eu" }),
    ledger,
    env: (k) => env[k],
    now: () => new Date(NOW),
    log: (m) => logs.push(m),
    fetch: async (input, init = {}) => {
      const url = String(input);
      const call = { url, init, body: JSON.parse(String((init as { body?: unknown }).body ?? "{}")) };
      calls.push(call);
      if (url.startsWith("https://api.resend.com")) return opts.resend ? await opts.resend(call) : new Response('{"id":"e1"}', { status: 200 });
      if (url.startsWith("https://slack.com")) return opts.slack ? await opts.slack(call) : new Response('{"ok":true}', { status: 200 });
      throw new Error("unexpected url");
    },
  };
  return { deps, calls, logs, ledger };
}

const req = (body: unknown = { userEmail: "buyer@example.com", passportName: "browser name", passportUrl: `https://evil.example/p/${SLUG}`, requestedAt: "2000-01-01T00:00:00Z" }, token: string | null = "good") =>
  new Request("http://x/send-counterfeit-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const resendCalls = (c: Call[]) => c.filter((x) => x.url.startsWith("https://api.resend.com"));
const slackCalls = (c: Call[]) => c.filter((x) => x.url.startsWith("https://slack.com"));

function assertNoSecrets(text: string) {
  for (const s of [RESEND, SLACK, "xoxb-", "re_FAKE"]) assertFalse(text.includes(s), `leaked ${s}`);
}

Deno.test("rejects missing and invalid auth", async () => {
  const a = setup();
  assertEquals((await handleCounterfeitLead(req(undefined, null), a.deps)).status, 401);
  assertEquals((await handleCounterfeitLead(req(undefined, "bad"), a.deps)).status, 401);
  assertEquals(a.calls.length, 0);
});

Deno.test("rejects payload email that does not match the JWT email", async () => {
  const a = setup();
  const res = await handleCounterfeitLead(req({ userEmail: "victim@example.com", passportName: "x", passportUrl: `https://x/p/${SLUG}` }), a.deps);
  assertEquals(res.status, 403);
  assertEquals(a.calls.length, 0);
});

Deno.test("rejects passports owned by someone else or unknown", async () => {
  const other = setup({ passport: passport({ user_id: "user-2" }) });
  assertEquals((await handleCounterfeitLead(req(), other.deps)).status, 403);
  assertEquals(other.calls.length, 0);
  const missing = setup({ passport: null });
  assertEquals((await handleCounterfeitLead(req(), missing.deps)).status, 403);
});

Deno.test("rejects when protection is not enabled on the saved passport", async () => {
  const a = setup({ passport: passport({ category_data: { counterfeit_protection_enabled: "true" } }) });
  assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 409);
  assertEquals(a.calls.length, 0);
});

Deno.test("rejects malformed passport URL", async () => {
  const a = setup();
  const res = await handleCounterfeitLead(req({ userEmail: "buyer@example.com", passportName: "x", passportUrl: "https://x/p/nothex" }), a.deps);
  assertEquals(res.status, 400);
});

Deno.test("email goes to contact@cypheme.com with Reply-To requester and server data", async () => {
  const a = setup();
  const res = await handleCounterfeitLead(req(), a.deps);
  assertEquals(res.status, 200);
  const [mail] = resendCalls(a.calls);
  assertEquals(mail.body.to, ["contact@cypheme.com"]);
  assertEquals(mail.body.reply_to, "buyer@example.com");
  assertEquals(mail.body.cc, undefined);
  const html = String(mail.body.html);
  for (const v of ["Acme Wines", "buyer@example.com", "Chateau Example 2022", "wine", `https://open-label.eu/p/${SLUG}`, passport().id, NOW]) {
    assert(html.includes(v), `email missing ${v}`);
  }
  assertFalse(html.includes("browser name"));
  assertFalse(html.includes("evil.example"));
  assertFalse(html.includes("2000-01-01"));
});

Deno.test("Slack lead has the exact field order and safe options", async () => {
  const a = setup();
  await handleCounterfeitLead(req(), a.deps);
  const [s] = slackCalls(a.calls);
  assertEquals(s.url, "https://slack.com/api/chat.postMessage");
  assertEquals((s.init.headers as Record<string, string>).Authorization, `Bearer ${SLACK}`);
  assertEquals(s.body.channel, CHANNEL);
  assertEquals(s.body.unfurl_links, false);
  assertEquals(s.body.unfurl_media, false);
  assertEquals(s.body.mrkdwn, false);
  assertEquals(s.body.text, [
    "##SOURCE_OPENLABEL##",
    "Company: Acme Wines",
    "Email: buyer@example.com",
    "Product Name: Chateau Example 2022",
    "Product Category: wine",
    `Passport URL: https://open-label.eu/p/${SLUG}`,
    `Passport ID: ${passport().id}`,
    "Message: Counterfeit protection requested for this Digital Product Passport",
    "Email Follow-up: An email was sent to contact@cypheme.com with Reply-To set to the requester. Reply to that email to contact the lead directly.",
    `Requested At: ${NOW}`,
  ].join("\n\n"));
});

Deno.test("sanitizes Slack values: one line, length, markup and mentions", () => {
  const v = sanitizeSlackValue("A\nB\r\nC\tD <!channel> <!here> <@U123> @channel @here @everyone *b* _i_ `c` &", 2000);
  assertFalse(/[\r\n\t]/.test(v));
  assertFalse(v.includes("<"));
  assertFalse(v.includes(">"));
  assertFalse(/@(channel|here|everyone)\b/i.test(v));
  assertFalse(/[*_`~]/.test(v));
  assert(v.includes("&amp;"));
  assertEquals(sanitizeSlackValue("x".repeat(500), 200).length <= 200, true);
  assertEquals(sanitizeSlackValue("", 50), "-");
  const text = buildSlackLeadText({
    company: "Evil\n\nEmail: fake@x.com <!channel>", email: "buyer@example.com", productName: "@here", category: "wine",
    passportUrl: "https://open-label.eu/p/x", passportId: "id", requestedAt: NOW,
  });
  assertEquals(text.split("\n\n").length, 10);
  assertFalse(text.includes("<!channel>"));
  assertFalse(/@here\b/.test(text));
});

Deno.test("invalid Slack channel or token fails without calling Slack or leaking", async () => {
  for (const env of [{ SLACK_LEADS_CHANNEL_ID: "#general" }, { SLACK_LEADS_CHANNEL_ID: undefined }, { SLACK_BOT_TOKEN: "nope" }, { SLACK_BOT_TOKEN: undefined }]) {
    const a = setup({ env });
    const res = await handleCounterfeitLead(req(), a.deps);
    assertEquals(res.status, 502);
    const text = await res.text();
    assertNoSecrets(text + a.logs.join("\n"));
    assertEquals(slackCalls(a.calls).length, 0);
    assertEquals(resendCalls(a.calls).length, 1);
  }
});

Deno.test("missing Resend key fails email without leaking", async () => {
  const a = setup({ env: { RESEND_API_KEY: undefined } });
  const res = await handleCounterfeitLead(req(), a.deps);
  assertEquals(res.status, 502);
  assertNoSecrets(await res.text() + a.logs.join("\n"));
  assertEquals(resendCalls(a.calls).length, 0);
});

Deno.test("provider non-2xx, Slack ok:false and timeouts are failures with no raw errors", async () => {
  const cases: Array<Parameters<typeof setup>[0]> = [
    { resend: () => new Response(`{"message":"bad key ${RESEND}"}`, { status: 401 }) },
    { slack: () => new Response(`{"ok":false,"error":"invalid_auth ${SLACK}"}`, { status: 200 }) },
    { slack: () => new Response("boom", { status: 500 }) },
    { resend: () => { throw new DOMException("timed out", "TimeoutError"); } },
    { slack: () => { throw new DOMException(`aborted ${SLACK}`, "TimeoutError"); } },
  ];
  for (const c of cases) {
    const a = setup(c);
    const res = await handleCounterfeitLead(req(), a.deps);
    assertEquals(res.status, 502);
    const text = await res.text();
    assertNoSecrets(text + a.logs.join("\n"));
    assertFalse(text.includes("invalid_auth"));
    assertFalse(text.includes("bad key"));
  }
});

Deno.test("retry after email success and Slack failure retries Slack only", async () => {
  const ledger = makeLedger();
  let slackOk = false;
  const a = setup({ ledger, slack: () => slackOk ? new Response('{"ok":true}') : new Response("x", { status: 500 }) });
  assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 502);
  slackOk = true;
  const res = await handleCounterfeitLead(req(), a.deps);
  assertEquals(res.status, 200);
  assertEquals(resendCalls(a.calls).length, 1);
  assertEquals(slackCalls(a.calls).length, 2);
});

Deno.test("retry after Slack success and email failure retries email only", async () => {
  const ledger = makeLedger();
  let mailOk = false;
  const a = setup({ ledger, resend: () => mailOk ? new Response("{}") : new Response("x", { status: 503 }) });
  const first = await handleCounterfeitLead(req(), a.deps);
  assertEquals(first.status, 502);
  assertEquals((await first.json()).deliveries, { email: "failed", slack: "sent" });
  mailOk = true;
  assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 200);
  assertEquals(resendCalls(a.calls).length, 2);
  assertEquals(slackCalls(a.calls).length, 1);
});

Deno.test("repeated save after full success sends nothing again", async () => {
  const ledger = makeLedger();
  const a = setup({ ledger });
  for (let i = 0; i < 3; i++) assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 200);
  assertEquals(resendCalls(a.calls).length, 1);
  assertEquals(slackCalls(a.calls).length, 1);
});

Deno.test("concurrent saves deliver each channel once", async () => {
  const ledger = makeLedger();
  let release!: () => void;
  const gate = new Promise<void>((r) => release = r);
  const a = setup({ ledger, resend: async () => { await gate; return new Response("{}"); } });
  const p = [handleCounterfeitLead(req(), a.deps), handleCounterfeitLead(req(), a.deps), handleCounterfeitLead(req(), a.deps)];
  await new Promise((r) => setTimeout(r, 10));
  release();
  const statuses = (await Promise.all(p)).map((r) => r.status).sort();
  assertEquals(statuses.filter((s) => s === 200).length, 1);
  assert(statuses.every((s) => s === 200 || s === 409));
  assertEquals(resendCalls(a.calls).length, 1);
  assertEquals(slackCalls(a.calls).length, 1);
});

Deno.test("stale pending claim is retried", async () => {
  const ledger = makeLedger();
  ledger.rows.set(passport().id, {
    userId: "user-1", requestedAt: NOW,
    email: { status: "pending", token: "old", claimedAt: Date.parse(NOW) },
    slack: { status: "sent", claimedAt: 0 },
  });
  const a = setup({ ledger });
  assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 409);
  ledger.advance(121_000);
  assertEquals((await handleCounterfeitLead(req(), a.deps)).status, 200);
  assertEquals(resendCalls(a.calls).length, 1);
  assertEquals(slackCalls(a.calls).length, 0);
});

Deno.test("ledger outage returns generic error and sends nothing", async () => {
  const a = setup();
  a.deps.ledger.claim = () => Promise.reject(new Error(`db down ${SLACK}`));
  const res = await handleCounterfeitLead(req(), a.deps);
  assertEquals(res.status, 500);
  assertNoSecrets(await res.text() + a.logs.join("\n"));
  assertEquals(a.calls.length, 0);
});
