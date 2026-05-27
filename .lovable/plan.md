# Admin dashboard + auto-generated leaderboard token

## Goals

- Add an **Admin** area accessible from the main dashboard, visible only to the admin user.
- Let the admin edit every field currently set in Setup (company info, URLs, sender email, site URL, AI toggle).
- Show the **human** and **API** leaderboard URLs with copy buttons — no manual secret handling.
- The admin token is **generated automatically during Setup** and stored in the database. Nothing hardcoded anywhere; no extra step for on-prem operators.

## Who is "admin"?

Simplest model that works for on-prem and SaaS:

- The first user to complete the Setup wizard becomes the admin.
- We store their `auth.uid()` in `site_config` under key `admin_user_id`.
- A user is admin iff `auth.user.id === site_config.admin_user_id`.

No new roles table, no enums. Multi-admin can come later.

## Auto-generated admin token (no hardcoded secret)

Today the edge function reads `ADMIN_LEADERBOARD_PASSWORD` from env. That requires every on-prem operator to manually add a secret. We replace it with a **DB-stored token**:

- On Setup submit, the browser generates a 32-byte URL-safe random token using `crypto.getRandomValues` and stores it in `site_config` under key `admin_leaderboard_token` (same upsert batch as the rest).
- The `get-admin-leaderboard` edge function reads the token from `site_config` (via service role), not from env. Env fallback is kept only for backwards compatibility.
- The token is never exposed to the frontend except to the logged-in admin (see RLS below). Public/anon users cannot read it.

This means a fresh on-prem deployment "just works" after Setup — no secret to set.

## RLS changes to `site_config`

The current policies only allow:
- anon: read `setup_complete`
- authenticated: read a fixed allowlist of public-ish keys
- update: only before setup_complete

We add:
- A `SELECT` policy for `authenticated` that allows reading **any key** when `auth.uid()` equals the row stored at `admin_user_id`.
- An `UPDATE` policy for `authenticated` with the same admin condition (so the admin can edit config after setup).
- An `INSERT` policy for `authenticated` with the same admin condition (for new admin-only keys).

We do **not** add `admin_leaderboard_token` to the authenticated allowlist — only the admin can read it.

## UI changes

### `src/pages/Dashboard.tsx`
- Read `admin_user_id` from `useSiteConfig`. If it matches `user.id`, show a small **Admin** button in the header (next to LogOut) linking to `/admin`.

### New `src/pages/Admin.tsx` (route `/admin`)
- Guarded: redirects to `/dashboard` if the user is not the admin.
- Two cards:
  1. **Instance configuration** — same fields as Setup (company name, address, privacy URL, terms URL, sender email, site URL, AI enabled), prefilled, with Save.
  2. **Referral leaderboard links** — shows:
     - Human URL: `${site_url || origin}/admin-leaderboard#${token}` with Copy + Open buttons.
     - API URL: `${FUNCTIONS_URL}/get-admin-leaderboard?token=${token}` with Copy button.
     - A "Rotate token" button that regenerates the token (invalidates old links).

### `src/App.tsx`
- Register `/admin` route (both setup-required and normal blocks behave the same: only normal block needs it since setup must be complete; setup-required block redirects to `/setup`).

### `src/hooks/useSiteConfig.tsx`
- Add `admin_user_id` and `admin_leaderboard_token` to the `SiteConfig` interface and the fetch mapper. The token will simply be `''` for non-admin users (RLS hides it).

### `src/pages/Setup.tsx`
- On submit, generate the token client-side and include `admin_user_id: user.id` + `admin_leaderboard_token: <generated>` in `saveConfig`.
- Setup currently runs while the user may not be authenticated. We need the admin's `user.id`, so Setup must require a logged-in user before completion. Check existing flow — if Setup is reachable only after Auth this is already fine; otherwise we add a "you must be signed in to complete setup" gate.

## Edge function changes

### `supabase/functions/get-admin-leaderboard/index.ts`
- Replace `Deno.env.get("ADMIN_LEADERBOARD_PASSWORD")` with a lookup of `admin_leaderboard_token` from `site_config` via service role.
- Keep `timingSafeEqual`, rate limiting, and token-via-query/header behavior unchanged.
- If no token row exists, return 503 "Admin token not configured (complete Setup)".

## Database migration

Single migration:

1. New RLS policies on `site_config` for admin SELECT / UPDATE / INSERT keyed on `admin_user_id`.
2. No schema changes — the two new keys are just rows in the existing key/value table.

## Out of scope

- Multi-admin / role table.
- Transferring admin to another user from the UI (can be done by editing the DB directly for now; we can add it later).
- Translating the Admin page (internal tool, English-only — consistent with Setup and AdminLeaderboard).
- Removing the `ADMIN_LEADERBOARD_PASSWORD` secret from Lovable Cloud — left in place as a harmless fallback; we can delete it after verifying the DB token works.

## Files

- New: `src/pages/Admin.tsx`
- Edit: `src/App.tsx`, `src/pages/Dashboard.tsx`, `src/hooks/useSiteConfig.tsx`, `src/pages/Setup.tsx`, `supabase/functions/get-admin-leaderboard/index.ts`
- Migration: new policies on `public.site_config`
- Tests: add a small render test for `Admin.tsx` (non-admin redirect, admin sees links); update `useSiteConfig.test.tsx` for the new fields.
