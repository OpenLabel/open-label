import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-counterfeit-request`;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
};

Deno.test("CORS preflight returns correct headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS", headers });
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
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

Deno.test("rejects missing email", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      passportName: "Test Wine",
      passportUrl: "https://example.com/p/abc123",
    }),
  });
  assertEquals(res.status, 400);
  await res.text();
});

Deno.test("rejects invalid email format", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userEmail: "not-an-email",
      passportName: "Test Wine",
      passportUrl: "https://example.com/p/abc123",
    }),
  });
  assertEquals(res.status, 400);
  await res.text();
});

Deno.test("rejects empty passport name", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userEmail: "test@example.com",
      passportName: "",
      passportUrl: "https://example.com/p/abc123",
    }),
  });
  assertEquals(res.status, 400);
  await res.text();
});

Deno.test("rejects invalid URL format", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userEmail: "test@example.com",
      passportName: "Test Wine",
      passportUrl: "not-a-url",
    }),
  });
  assertEquals(res.status, 400);
  await res.text();
});
