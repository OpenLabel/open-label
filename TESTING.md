# Manual Testing Guide

Complete step-by-step QA checklist for the Open-Label DPP app. Each item lists the URL, prerequisites, and expected result.

Legend:
- **[public]** — no account needed
- **[auth]** — requires a signed-in account
- **[admin]** — requires the admin account / admin token
- **[fresh]** — only testable on a fresh (not yet set up) instance

---

## 1. Public pages

### 1.1 Landing page — `/` [public]
1. Open `/`.
2. Verify: hero section, category timeline (Wine = active now, Batteries 2027, full rollout 2027-30), AI autofill ("Remplissage automatique par IA") section, footer links.
3. Open the language switcher and cycle through several of the 25 languages (24 EU + Simplified Chinese). Verify UI text switches and no English leaks.
4. Scroll to the footer and confirm legal links point to `/legal`, `/privacy-policy`, `/terms` (not `/legal-mentions`).

### 1.2 Legal pages [public]
- `/legal` — Legal Mentions renders.
- `/privacy-policy` — Privacy Policy renders.
- `/terms` — Terms render.
- `/legal-mentions` — must render the 404 / NotFound page (route removed).

### 1.3 Public passport — `/p/:slug` [public]
1. Open a published wine passport of your own: `/p/<slug>`.
2. Verify: product name, wine fields, ingredients (allergens in bold), nutrition table, recycling materials, and the mandatory **"Powered by Open-Label.eu"** attribution.
3. Language override: `/p/<slug>?lang=it` — entire page (including safety/chemical sections and allergen declarations) must be Italian, no English leaks. Repeat with `?lang=zh-CN` and one other EU language.
4. Invalid slug (e.g. `/p/0000000000000000`): friendly not-found state, no stack trace.
5. Rate limiting: refresh rapidly ~30+ times; the public-data endpoint should eventually return a rate-limit error rather than data.
6. **No tracking, no cookie banner (hard regulatory requirement)** — with a fresh browser profile, from an EEA/UK/CH location (or with the country trace forced to `FR`), load `/p/<slug>` and verify ALL of the following:
   - No cookie/consent banner and no "Cookie settings" button appear, at any moment.
   - Network tab: no request to `googletagmanager.com`, no `gtag/js`, no `google-analytics`, no `/cdn-cgi/trace` country lookup.
   - Console: `window.gtag` and `window.dataLayer` are `undefined` on a direct load of the passport page.
   - Application tab: no advertising/analytics cookie or storage entry is created (`openlabel_ads_consent` must not be written).
   - Client-side navigation: from `/p/:slug`, no `page_view` or conversion is sent; navigating to `/` afterwards may load tracking normally, and returning to `/p/:slug` must send nothing further for that route.
   - This applies to every published passport URL, in every language and on mobile.

### 1.4 Cypheme landing page — `/cypheme/passport` [public]
1. Verify the isolated Cypheme design system (Roboto/Inter, brand orange/blue, 16px radius buttons) and that global app styles don't bleed in.
2. View page source / devtools `<head>`: a `<meta name="robots" content="noindex,nofollow">` tag must be present.
3. All main CTAs (orange buttons) must link to `https://open-label.eu/auth`.
4. Check mobile viewport (375px): carousel-style showcase, centered timeline cards.

### 1.5 Referral pages [public]
- `/referral-leaderboard` — public leaderboard renders (may be empty).
- `/referral/:code` — referral stats page for a valid code (grab one from the leaderboard). Invalid code: graceful error/empty state.

### 1.6 404 [public]
- Any unknown route (e.g. `/does-not-exist`) shows the NotFound page.

---

## 2. Auth flow

### 2.1 Sign up — `/auth` [public]
1. Open `/auth`, switch to the Sign Up tab.
2. Fill email, password, and **Company Name** (not "Full Name").
3. Submit → expect the email-confirmation message (email confirmation is required; no auto-confirm).
4. Confirm via the email link, then sign in.

### 2.2 Referral capture [public]
1. In a fresh browser/incognito, open `/?ref=<CODE>` (any code shown on `/referral-leaderboard`).
2. Sign up normally. After the account is created, the referral should appear under that code on `/referral/:code` and the leaderboard.

### 2.3 Sign in / sign out [public]
1. `/auth` → Sign In tab → valid credentials → redirected to `/dashboard`.
2. Sign out from the dashboard header (log-out icon) → back to signed-out state.

### 2.4 Password reset [public]
1. `/auth` → "Forgot password" → submit email → reset email received.
2. Follow the link → lands on `/reset-password` → set a new password → sign in with it.

---

## 3. Authenticated pages

Prerequisite: signed-in account.

### 3.1 Dashboard — `/dashboard` [auth]
1. Empty state on a new account ("no passports" message + create button).
2. Create a passport, then verify the horizontal action list: QR, duplicate, delete, edit.
3. Duplicate a passport → copy appears. Delete → confirmation → removed.
4. Drag-and-drop reorder → order persists after reload, and a toast confirms the reorder.
5. QR dialog: download PNG and SVG, and use "Open Passport" to jump to the public view.
6. Mobile viewport (375px): stacked vertical layout with buttons on the bottom row.

### 3.2 Passport form — `/passport/new` and `/passport/:id/edit` [auth]
1. Create a Wine passport: fill Product Name, internal DPP Name, vintage, sweetness level, etc. Field hints/tooltips should explain regulatory terms.
2. Ingredients: use the picker dialog (known ingredients with E-numbers); allergens render bold; add a custom ingredient via the custom dialog.
3. Recycling: add packaging materials with EU material composition codes (e.g. PET 1, PAP 20, ALU 41 — codes stay untranslated).
4. Image upload: upload a product photo, click **Save**, reload the editor — the image must still be there (regression: previously removed on save).
5. AI autofill: drag-and-drop a wine label image / PDF into the dashed drop zone (or use camera/file picker) and verify fields are pre-filled.
6. Translations tab: "Generate with AI" (animated rainbow gradient button) produces translations; overflow list scrolls.
7. Live preview: updates in real time as you type; preview language picker is decoupled from the app UI language — set preview to e.g. Italian and verify no English leaks (including the allergen declaration text).
8. Keyboard shortcut: ⌘+S / Ctrl+S saves and redirects to the edit route.
9. Text editing stability: edit a field repeatedly; content must not jump back to a previous version.
10. Publish the passport → note the public URL with a 16-char hex slug → open it in an incognito window → renders without login.

### 3.3 Route guards [auth]
- While signed out, `/dashboard`, `/passport/new`, `/passport/<id>/edit` must redirect to `/auth` (not render).

---

## 4. Admin / restricted pages

### 4.1 Admin leaderboard — `/admin-leaderboard` [admin]
The deep leaderboard is gated by a token passed in the URL **hash** (never sent to the server as a query param):

```
/admin-leaderboard#<admin_leaderboard_token>
```

- The token is a 32-byte random value stored in `site_config.admin_leaderboard_token` (set via the Admin page or directly in the database).
- Correct token → full leaderboard with per-code signup details (emails, passport status).
- Missing or wrong hash → access denied / no data.
- Page injects `noindex,nofollow` (check `<head>`).

### 4.2 Admin page — `/admin` [admin]
- Only accessible to the configured site admin account (e.g. the admin email configured during setup). Non-admin users are rejected.
- Verify the admin controls render (site config, leaderboard token management, etc.).

---

## 5. Setup flow [fresh]

Only testable on a fresh instance where `setup_complete` is false:

1. Any route redirects to `/setup`, **except**: `/auth`, `/reset-password`, `/p/:slug`, `/referral/:code`, `/referral-leaderboard`, `/admin-leaderboard`, `/legal`, `/privacy-policy`, `/terms`, `/cypheme/passport` — these stay reachable.
2. Complete the setup wizard (company name, admin account, site URL).
3. After completion, `/setup` redirects to `/` and the full app is available.

---

## 6. Cross-cutting checks

- **i18n completeness**: pick 2–3 non-English locales (e.g. Italian, German, zh-CN) and walk landing → auth → dashboard → form → public DPP. No English UI strings anywhere; technical codes (`PET 1`, `PAP 20`, `ALU 41`) intentionally stay as-is.
- **Attribution**: every public DPP shows "Powered by Open-Label.eu".
- **Mobile pass** (375px): landing, auth, dashboard, form, public passport, Cypheme page.
- **Rate limiting**: public-data edge functions reject bursts (see 1.3.5).
- **Security spot checks**: public view never exposes owner email/user id; SVG file uploads are rejected; external URLs in passport fields are validated.
- **Tracking-free public passport (regulatory)**: re-run check 1.3.6 after any change to tracking, consent or routing code. Automated guards: `src/lib/trackingExemptions.test.ts`, `src/__tests__/publicPassportNoTracking.test.tsx`, and the ConsentBanner exemption test. A failure here is a compliance defect, not a cosmetic one.

---

## Automated checks (for reference)

- Frontend: `bunx vitest run` (all unit/component tests; coverage threshold 30% — do not lower).
- Edge functions: Deno tests via the edge-function test runner.
- Build: `npm run build` (tests are intentionally separate from the build).
