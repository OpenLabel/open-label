# Apply the restrictive car cleaning save gateway policies

Scope: apply only the reviewed restrictive policy SQL once, then verify read-only. No application source, dependency, edge function, auth, secret, billing or customer record changes. No sample data.

## Verified current state

- The live `public.passports` table has exactly four policies, all PERMISSIVE: the owner create, delete, update and view policies. Neither restrictive policy exists.
- The canonical file `supabase/migrations/20260910120000_require_car_cleaning_save_gateway.sql` is absent from this snapshot, as intended for this staged release.
- The SQL text supplied in the request hashes to SHA256 `3bf875bca2a70a80ba88f34248e68bb40c6b33bb47adcada3579e126e93b5f75`, matching the stated hash byte for byte.
- The pre-enforcement gate state is as reported: both edge functions deployed, history migration recorded, zero blocked writes expected once this applies because the gateway binds service-role writes.

## Step 1: apply the migration once

Call the supported migration runner with the exact reviewed SQL, byte-identical to the verified text above:

- `CREATE POLICY "Car cleaning inserts require the validated save gateway" ON public.passports AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (category::text <> 'car_cleaning')`
- `CREATE POLICY "Car cleaning updates require the validated save gateway" ON public.passports AS RESTRICTIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (category::text <> 'car_cleaning')`

The migration name will be `require_car_cleaning_save_gateway`. The runner writes the SQL verbatim into a new Drizzle custom migration, checks it and applies it. Nothing else is included: no history or enum replay, no ledger edits by hand, no drops, no schema push, no passport row changes.

## Step 2: read-only verification

Query `pg_policy` for `public.passports` and confirm:

1. Both new policies exist, are RESTRICTIVE (`polpermissive = false`), with the expected commands (INSERT and UPDATE), role `authenticated`, and check expression `category::text <> 'car_cleaning'` (USING `true` for the update policy).
2. The four existing owner policies remain, unchanged and permissive.
3. `pg_proc` still shows `reorder_passports` unchanged.

## Step 3: report

Report the actual runner result, the recorded migration path and ledger provenance, and the verified policy catalog output. No credential or token is read or returned. Live gateway save and QA record cleanup remain with you.

## Rollback note

If the apply fails, the runner rolls back and the database stays as it is today: the gateway keeps working, and direct authenticated REST writes of car cleaning rows remain possible until this is reapplied.
