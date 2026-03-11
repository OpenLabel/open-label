

## Referral Stats Page

### Approach
Create a public page at `/referral/:code` that shows anonymized signup stats for a given referral code. The data will be fetched via an edge function (no auth required) that queries the `referrals` table joined with `passports` to get DPP counts.

### Edge Function: `get-referral-stats`
- **Input**: referral code (validated as alphanumeric)
- **No auth required** (public endpoint)
- **Rate limited** (same pattern as `get-public-passport`)
- **Query**: Join `referrals` with `passports` grouped by user, returning only anonymized data (e.g., "User 1", "User 2" with signup date and DPP count — no emails, no IDs)
- Uses service role key to bypass RLS

### New Page: `src/pages/ReferralStats.tsx`
- Simple table showing:
  - Anonymous label (e.g., "Signup #1", "Signup #2")
  - Signup date
  - Number of DPPs created
  - Total signups count at top
- No login required

### Route
- Add `/referral/:code` to `AppRoutes` (in both setup-required and normal route sets)

### Config
- Add `verify_jwt = false` for the new edge function in `supabase/config.toml`

### Files
- **Create**: `supabase/functions/get-referral-stats/index.ts`
- **Create**: `src/pages/ReferralStats.tsx`
- **Edit**: `src/App.tsx` (add route)

