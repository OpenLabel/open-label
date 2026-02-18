import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/get-public-passport`;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

Deno.test("CORS preflight returns correct headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS", headers });
  assertEquals(res.status, 200);
  const h = res.headers.get("access-control-allow-origin");
  assertEquals(h, "*");
  await res.text();
});

Deno.test("rejects invalid JSON body", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: "not json",
  });
  assertEquals(res.status, 400);
  const data = await res.json();
  assert(data.error);
});

Deno.test("rejects malformed slug - SQL injection", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: "'; DROP TABLE passports;--" }),
  });
  // Should reject — either 400 (our validation) or 403 (gateway)
  assert(res.status === 400 || res.status === 403, `expected 400 or 403, got ${res.status}`);
  await res.text();
});

Deno.test("rejects slug with XSS payload", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: '<script>alert("xss")</script>' }),
  });
  assertEquals(res.status, 400);
  await res.text();
});

Deno.test("rejects slug with wrong length", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: "abc123" }),
  });
  assertEquals(res.status, 400);
  await res.text();
});

Deno.test("returns 404 for nonexistent valid slug (not 500)", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: "aaaaaaaaaaaaaaaa" }),
  });
  assertEquals(res.status, 404);
  const data = await res.json();
  assert(data.error);
});
