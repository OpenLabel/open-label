# Car cleaning backend rollout (deployment only)

Scope: apply one reviewed migration and deploy two backend functions. No application source, dependency, auth, secret or data change.

## Verified current state

- Database tables present: api_usage, passports, profiles, referrals, site_config. Neither car_cleaning_passport_archives nor car_cleaning_passport_versions exists.
- The product_category enum already contains car_cleaning, so the enum step is already live.
- There are zero car_cleaning rows, so the migration seed blocks will insert nothing.
- Repository holds supabase/migrations/20260910110000_car_cleaning_passport_history.sql (222 lines), the save-car-cleaning-passport function, the updated get-public-passport function, and the nine _shared modules.
- supabase/config.toml already sets verify_jwt = false for get-public-passport only.

## Step 1: history migration

Apply supabase/migrations/20260910110000_car_cleaning_passport_history.sql once, verbatim, through the supported migration runner. Contents applied as reviewed:

- Two new tables with their checks, unique constraints, generated product identifier and two indexes.
- Row level security enabled on both, the inherited non-owner grant revoke block, then SELECT to authenticated and service_role, plus the two owner read policies.
- Five functions: car_cleaning_history_immutable, car_cleaning_retention_floor, car_cleaning_model_definition, guard_car_cleaning_passport_identity, capture_car_cleaning_passport_version.
- Three triggers: immutability on versions, identity guard on passports, version capture on passports.
- The two seed selects over existing car_cleaning rows (no rows today).
- The trailing function grant revoke block.

The enum migration 20260910095000 is a single idempotent ADD VALUE IF NOT EXISTS. It is included ahead of the history statements only if the runner requires a recorded predecessor, otherwise it is skipped. Either way it changes nothing, since the value already exists.

Not applied: 20260910120000_require_car_cleaning_save_gateway.sql. It is absent from this snapshot and stays withheld.

No other migration is replayed, no object is dropped, and no ledger entry is written by hand.

## Step 2: function deployment

Deploy through the supported deployment tool, in this order:

1. get-public-passport, together with _shared/publicPassportHistoryResolver.ts, _shared/carCleaningPassportHistory.ts and _shared/ephemeralRateLimiter.ts, keeping verify_jwt = false from the scoped config.
2. save-car-cleaning-passport, together with _shared/carCleaningSaveHandler.ts, _shared/carCleaning.ts, _shared/carCleaningAnnexVI.ts and _shared/carCleaningLanguages.ts. It authenticates the bearer caller through the auth service and binds ownership plus category on every write.

Deno resolves the _shared imports at deploy time, so both are uploaded with their dependency graph.

## Step 3: verification

- Re-query the schema for both tables, both policies, the five functions and the three triggers, and confirm the archives and versions tables are empty.
- Confirm the applied migration is the only newly recorded one.
- Call get-public-passport unauthenticated with a known non car slug and confirm the existing public response still renders, then with an unknown slug for the 404 path.
- Call save-car-cleaning-passport with no credential and confirm it rejects rather than writing.
- Report the actual migration result and the actual deployment result for each function. No credential or token is read or returned.

## Rollback note

If step 1 fails it rolls back whole, leaving the database as it is today. If a function deploy fails the previous deployment stays live; the database change is additive and harmless on its own because no car_cleaning rows exist.
