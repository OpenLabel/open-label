Add an admin-only "deep" referral leaderboard that reveals signup emails per referral code, gated by a single shared password embedded in the URL.

## How the password flows

The password is stored server-side as a Lovable Cloud secret called `ADMIN_LEADERBOARD_PASSWORD`. I will generate a long random value (e.g. 40 chars, URL-safe) and request it via the secrets tool — you'll paste it into the secure form. After that, you keep the URL bookmarked; no one else ever sees the value.

URL shapes:
- Human view: `https://open-label.eu/admin-leaderboard#<password>` — the page reads `location.hash`, sends it to the edge function, and renders a table. Hash fragments are not sent to the server logs, which is a nice bonus.
- API view: `GET https://<project>.functions.supabase.co/get-admin-leaderboard?token=<password>` returns JSON directly. Add header `Accept: application/json` if you want — JSON is the default.

The edge function compares the token to the secret with constant-time equality and rate-limits per IP. On mismatch, it returns 401 and never reveals data. The token never lands in the React Router path, so it won't appear in browser history beyond the hash.

## New edge function: `get-admin-leaderboard`

- `verify_jwt = false`, public function (auth is the password itself)
- Reads `token` from `?token=` query OR `Authorization: Bearer <token>` header (so API users can use either)
- Constant-time compares against `ADMIN_LEADERBOARD_PASSWORD`. Missing/empty secret → 503.
- Per-IP rate limit: 10 requests / minute (tighter than the public leaderboard).
- With service role, fetches `referrals` + `passports`, and pages through `auth.admin.listUsers()` to map `user_id → email` and `created_at`.
- Returns:
  ```json
  {
    "generatedAt": "2026-05-27T…Z",
    "totals": { "codes": 12, "totalSignups": 134, "validSignups": 47 },
    "leaderboard": [
      {
        "rank": 1,
        "code": "ABC123",
        "validSignups": 9,
        "totalSignups": 14,
        "signups": [
          { "email": "alice@example.com", "signedUpAt": "…", "hasPassport": true }
        ]
      }
    ]
  }
  ```

## New page: `/admin-leaderboard`

- Public route (added above the catch-all in `src/App.tsx`, and into the setup-required route list so it works even pre-setup).
- On mount, reads `window.location.hash.slice(1)`. If empty → shows a minimal "Forbidden" card with no hint about the existence of data.
- Otherwise calls the edge function via `fetch` (so we can pass the token as a query param; `supabase.functions.invoke` doesn't expose query params cleanly).
- Renders, for each code: rank, code, valid/total counts, and an expandable list of signup emails with signup date and a green/grey dot for "has at least one passport".
- Adds a "Copy API URL" button that copies the JSON endpoint with the token prefilled.
- Adds `<meta name="robots" content="noindex,nofollow">` and omits the page from the sitemap so it's not crawlable.

## Files

- New: `supabase/functions/get-admin-leaderboard/index.ts`
- New: `src/pages/AdminLeaderboard.tsx`
- Edit: `src/App.tsx` — register `/admin-leaderboard` in both the setup-required and normal route blocks
- Secret: request `ADMIN_LEADERBOARD_PASSWORD` via the secrets tool after you approve this plan

## What I will tell you at the end

- The full `/admin-leaderboard#…` URL
- The direct JSON endpoint URL with `?token=…`
- A reminder that anyone with the URL has full access, so treat it like a password and rotate via Cloud → Secrets if it ever leaks.

## Out of scope

- No UI to rotate the password (do it via Cloud → Secrets settings).
- No multi-admin support; one shared password is the whole auth model, per your request.
- No translations: the page is an internal admin tool (matches the existing "Setup/legal pages are intentionally static" memory).