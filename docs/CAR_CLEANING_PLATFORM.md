# Car cleaning passport history and access design

Scope: car_cleaning only. Implementation is a reviewable local change. No production database, deployment, external account or customer record was modified while preparing it.

## Legal source and limits

Source: the actual text of Regulation (EU) 2026/405, captured in `research/2026-405-browser.txt`, especially Articles 8(3), 21(2), 21(10), 21(12), 22, 23 and 24. Official text: https://eur-lex.europa.eu/eli/reg/2026/405/oj/eng . Article 37 sets the main application date at 23 September 2029.

Article 21 requires a model-specific passport, a persistent unique product identifier, and availability for ten years after placing on the market, including operator insolvency, liquidation and cessation. Article 21(12)(c) requires a backup through a passport service provider. Article 22 covers open interoperable data, free access according to rights, consumer access without registration, linking new passports to original ones, integrity and privacy. Articles 21(10), 23 and 24 require technical access measures, applicable identifier standards and registry integration. An internal UUID, JSON download, retention timestamp or optional supplier URL does not establish fulfilment of those requirements.

The code implements local storage and access building blocks. It cannot guarantee the continued operation or solvency of the hosting provider, payment of infrastructure bills, DNS continuity, regulatory qualification of a backup provider, EU registry availability or future credential interoperability. Those remain explicit prerequisites below.

## Data model

`20260910110000_car_cleaning_passport_history.sql` must follow the committed enum migration `20260910095000_add_car_cleaning_category.sql`.

- `car_cleaning_passport_archives` retains one manifest per passport: original record ID, owner ID, reserved public slug, server-generated archive UUID and `urn:uuid:` identifier, monotonically advancing latest version, minimum retention timestamp, optional withdrawal timestamp and the first Annex VI model definition.
- `car_cleaning_passport_versions` contains immutable full record snapshots with server timestamps and per-passport version numbers. The raw snapshot omits its duplicate top-level owner ID. Category data can contain private evidence and is therefore never publicly readable at the table level.
- Neither table references the live passport or auth user through a foreign key. Deleting a live passport or account cannot cascade into the archive.
- An AFTER trigger captures car inserts and substantive changes atomically. A locked manifest serializes version allocation. Timestamp and dashboard-order-only changes do not create content versions.
- Existing car rows are copied to initial snapshots without changing the original rows. Earlier historical states cannot be recovered or claimed. Backfill constraints fail the migration transaction safely if existing slugs are missing or malformed; review such exceptions before deployment rather than silently changing customer identifiers.

## Identity and deletion

A live car passport's record ID, owner ID, category and public slug are immutable. On the first saved Annex VI detergent profile, nonempty product_name, model_identifier, manufacturer_operator_id, model_content_reference, manufacturing_process_reference and clp_classification values become fixed in the guarded_model_definition manifest. Missing historical fields can be supplied once and then become fixed. Switching back to the current-rules profile or changing detergent scope cannot bypass the existing guard. Corrections to descriptions, contacts and other product metadata create versions. A formula or production change that constitutes a new model must use a new passport; the software cannot infer that scientific assessment from arbitrary supplier text.

Deleting a live car row marks the retained manifest withdrawn. It removes the editable dashboard row, but preserves the public URI and every retained snapshot. The owner can still read private retained records while their account exists. Account erasure remains possible because the archive has no auth-user foreign key. The previous owner ID is retained only as archive authorization/audit metadata; an erased account has no continuing authentication mechanism. A legally authorized succession or erasure/redaction procedure is an operational prerequisite, not a public self-service privilege.

The slug remains reserved after withdrawal. Attempts to reuse a retained car URL for any other row or category fail, preventing a QR link from silently changing products. Ordinary edits and deletion for unrelated categories continue unchanged.

The archive `urn:uuid:` value is an internal identifier with `identifier_status: internal_unverified`. It is not a validated GS1/ISO identifier, a registry-issued registration identifier, or evidence that the supplier-provided identifier meets future EU standards.

## Retention and assets

The server sets the minimum retention floor to ten years after the later of the save time and a valid supplier `last_placed_on_market_date`. Further saves can extend but never shorten that floor. Invalid or absent dates use the save time. No automatic expiry or purge exists, including after that timestamp. The timestamp is a policy floor; it is not a guarantee of continuous availability or a verified placing-on-market date.

The retained JSON includes image and document URLs, not the underlying files. The public image bucket still permits its owner to delete objects. External SDS, label, conformity and ingredient URLs can disappear or change. Skipping form cleanup of replaced car images reduces accidental loss but does not establish immutable asset retention. This migration does not add triggers to the managed `storage.objects` schema: a metadata guard alone cannot prove retention of underlying object bytes or the storage API's operation order. Immutable versioned asset ingestion, content integrity checks, retention configuration and independent backup of the actual files are necessary before claiming documentary retention.

## Access and public API

RLS grants authenticated owners SELECT only on their own manifest and private snapshots. Anonymous SQL reads and all client table writes are revoked. The edge service role has SELECT only on archive tables. Private snapshots cannot be edited or deleted through ordinary SQL because an immutable row trigger rejects both operations. A privileged database administrator can still change schema or disable protections; this is not tamper-proof archival storage against administrators.

`get-public-passport` accepts anonymous GET query parameters or POST JSON:

```
{ "slug": "aabbccdd", "version": 2, "history_before": 51 }
```

`version` and `history_before` are optional positive safe integers. The normal request returns the latest retained version. An exact older version can be requested without overwriting the latest state. When the live row has been deleted, the same slug resolves through the archive. Every snapshot is projected through the current shared `publicCarCleaningData` allowlist and a separate top-level allowlist. Internal record names, owner IDs and private evidence stay private. The ordinary bounded public product description is retained. Unsafe image URLs are removed. The public endpoint does not return raw version bodies in its index.

The returned `passport.dpp_history` includes:

```
product_identifier, identifier_status, public_path,
latest_version, selected_version, retained_until, withdrawn,
versions: [{ version, recorded_at }], next_before_version
```

The index contains at most 50 entries. Send `history_before=next_before_version` to retrieve the next page. Reads use explicit public columns for manifests and indexes and sanitize the single selected private snapshot before returning it. No archive is invented when a legacy row lacks history. A database failure returns an error rather than a retention claim.

The standalone machine-readable link is `/functions/v1/get-public-passport?slug=...` at the Supabase API origin. Its scoped function configuration must disable gateway JWT verification because consumer reads require no login; the write endpoints retain authentication. GET responses are JSON with no-store and no-referrer headers. Security rate limiting uses per-isolate salted SHA-256 keys, a 10,000-entry capacity, one-minute windows and automatic expiry pruning every second. It stores no raw IP address and adds no usage analytics. Rate state disappears when its isolate terminates.

## Authenticated write gateway

`save-car-cleaning-passport` validates the shared conditional car cleaning contract on the server. It accepts the normal flat form fields and optional `id`. Without `id` it creates a record with a database-generated identity. With `id` it updates only an existing car_cleaning row belonging to the authenticated owner. The gateway verifies the presented token with `auth.getUser(token)` and uses that verified user ID; it never trusts a body `user_id`, an unverified decoded token claim, an arbitrary public slug or caller timestamps. Unknown envelope fields are rejected. The gateway caps request size, enforces the explicit 25 supported product languages, and validates the public URL and envelope field types before checking the shared category schema. After validation it applies the public allowlist before writing; new unknown confidential payloads and inactive fields are discarded rather than collected into retained history. A profile downgrade that removes already fixed model revision references is rejected as a model conflict.

The trusted edge service role performs explicitly owner-bound writes only after validation. `20260910120000_require_car_cleaning_save_gateway.sql` adds restrictive authenticated INSERT and UPDATE policies so direct REST cannot bypass those checks for car rows. Existing ownership policies still apply to other categories. Read and delete behavior is unchanged. The existing owner-scoped SECURITY DEFINER reorder RPC remains usable because its database-owner execution bypasses the client restriction; it updates only display order and does not create a content version. No new reorder write API was added.

Successful writes return `{passport}`. Invalid category fields return `{error, issues: [{field, code}]}` with the shared issue codes. The API rejects unauthenticated calls, returns no row when an update target does not belong to the owner or has a different category, and does not expose raw database error data. This enforces the application's validation contract, not legal compliance, external identifier verification or completeness of documents behind URLs.

## Deployment and operational prerequisites

1. Review migrations against a disposable database with the deployed schema. Commit and apply the enum migration first, then the archive migration. Deploy the public/save edge functions and updated client, then enable the restrictive gateway policy only after both callers and gateway are available. A coordinated maintenance window is another option. Applying the restrictive policy before the new client and gateway are live causes car writes through older clients to fail. No such deployment was performed here.
2. Establish funded hosting and domain continuity, independent backup/provider arrangements, tested restore and export procedures, and a successor operator process that survives company cessation. Keep actual files as well as JSON.
3. Implement verified actor credentials and legally defined restricted access for authorities and other actors once the relevant measures specify those rights. The owner/private and anonymous/public split is deliberately narrower than that future system.
4. Integrate and verify applicable unique identifier standards, registry upload and registry-issued references. Do not fabricate registration success.
5. Assess model changes, linked predecessor passports and manufacturer responsibility. A version of the same record is not automatically a newly issued regulatory passport.
6. Establish a controlled, legally assessed admin process for exceptional redaction, account succession and archive disposal. The normal app exposes none of those privileges.

## Validation evidence

The SQL tests run against isolated in-memory PostgreSQL via PGlite, using a minimal schema matching relevant deployed columns and auth/RLS semantics. The package was installed only under the parent `logs/passport-history-db-check` directory, with no repository dependency changes. Run:

```
node supabase/tests/car_cleaning_passport_history.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
```

Twenty-five checks cover additive backfill, generated identity, ten-year floor, owner versus stranger/anonymous access, write denial, immutable snapshots, version order, reordering, identity guards, model-profile bypass, placement-date handling, withdrawal, slug reuse, unrelated categories, account cascade deletion, direct REST write rejection, trusted gateway writes and the existing reorder RPC, the full supplier model definition, inactive profiles and fillable legacy gaps. They validate PostgreSQL logic, not deployed Supabase storage, gateway configuration, backups or provider durability.

Fifteen Vitest checks cover sanitized historical projections, malformed envelopes, bounded descriptions, safe image URLs, private index suppression, cursor pagination, exact version selection, withdrawn lookup, unrelated categories and storage failure behavior. Twenty-one save-gateway checks additionally cover authoritative token lookup, owner binding, identity overrides, conditional validation, malformed envelopes, request size, update misses error suppression, supported languages, public-only persistence and retained model conflicts. Four rate-limit checks cover concurrent limits, timed expiry, map capacity and cleanup. The application type check and edge bundle syntax checks also pass. Red/green logs are retained under `logs/passport-history-*`.
