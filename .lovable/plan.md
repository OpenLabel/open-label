

## Referral System Plan

### How it works

1. **URL format**: `https://digital-product-passports-com.lovable.app/?ref=ABC123`
2. **Persistence**: The `ref` code is captured on any page load and stored in `localStorage` so it survives navigation
3. **Association**: On signup, the referral code is saved to a new `referrals` table linking the code to the new user
4. **Dashboard**: A simple view (or database query) to see signups per referral code

### Database Changes

**New table: `referrals`**
```sql
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Only service role / triggers need to insert; authenticated users can read their own
CREATE POLICY "Users can view their own referral"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

### Code Changes

1. **Referral capture hook** (`src/hooks/useReferral.ts`)
   - On mount, check URL for `ref` query param
   - If found, store in `localStorage` under key `referral_code`
   - Export a `getReferralCode()` helper that reads from localStorage

2. **App.tsx** — Use the referral hook at the top level so it captures the code on any landing page

3. **useAuth.tsx — `signUp` function**
   - After successful signup, read `getReferralCode()` from localStorage
   - If a code exists, insert a row into `referrals` table with the user ID and code
   - Clear the localStorage entry after saving

4. **Auth.tsx** — No changes needed (signup already calls `signUp` from the hook)

5. **Dashboard or admin query** — The referral data can be queried via the database to see signup counts per code:
   ```sql
   SELECT referral_code, COUNT(*) FROM referrals GROUP BY referral_code;
   ```

### Summary of files to create/edit
- **Create**: `src/hooks/useReferral.ts`
- **Edit**: `src/App.tsx` (add referral capture), `src/hooks/useAuth.tsx` (save referral on signup)
- **Migration**: Create `referrals` table with RLS

