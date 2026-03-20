

## Referral Leaderboard Page

### What
A new public page at `/referral-leaderboard` showing all referral codes ranked by number of "valid" signups (users who created at least 1 DPP).

### Changes

**1. New edge function: `get-referral-leaderboard/index.ts`**
- Query all referral codes from `referrals` table
- For each referred user, check if they have at least 1 passport
- Group by `referral_code`, count valid signups per code
- Return sorted array: `[{ rank, code, validSignups, totalSignups }]`
- Include rate limiting and CORS (same pattern as `get-referral-stats`)
- Set `verify_jwt = false` in config.toml

**2. New page: `src/pages/ReferralLeaderboard.tsx`**
- Table with columns: Rank, Referral Code, Valid Signups, Total Signups
- Each code links to `/referral/:code` for details
- Calls the edge function via `supabase.functions.invoke("get-referral-leaderboard")`
- Loading/error states

**3. Route in `src/App.tsx`**
- Add `/referral-leaderboard` route in both setup and normal route sets

