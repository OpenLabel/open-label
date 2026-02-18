import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/wine-label-ocr`;

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
};

Deno.test("CORS preflight returns correct headers", async () => {
  const res = await fetch(FUNCTION_URL, { method: "OPTIONS", headers });
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("access-control-allow-origin"), "*");
  await res.text();
});

Deno.test("rejects request without auth header (401)", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ image: "data:image/png;base64,iVBOR" }),
  });
  assertEquals(res.status, 401);
  const data = await res.json();
  assertEquals(data.code, "AUTH_REQUIRED");
});

Deno.test("rejects invalid image format with anon auth", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      ...headers,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ image: "not-a-data-url" }),
  });
  // Should be 400 (invalid input) or 401 (anon key isn't a valid user token)
  assert(res.status === 400 || res.status === 401);
  await res.text();
});
