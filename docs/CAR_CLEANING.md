# Car cleaning products

The `car_cleaning` category is an available product-information workflow. It supports current chemical safety information and preparation for the detergent passport provisions in Regulation (EU) 2026/405. The main application date is 23 September 2029. It is not an EU certification, a product authorisation or a complete statutory DPP implementation.

## Product scope

Choose the product function and explicitly assess whether it is intended to wash or clean surfaces. A wax, polish or lubricant with no cleaning function can fall outside detergent scope. A cleaning product with an intended biocidal effect can have overlapping detergent and biocidal obligations. Product naming alone does not decide the applicable rules.

The form separates consumer, professional-only and industrial-only uses. It requires an explicit CLP classification assessment and an SDS supply assessment. UFI and poison centre fields are conditional on health or physical hazards and the user's Annex VIII assessment. Environmental hazards alone do not activate those fields. An exemption requires a reason. UFI validation checks character format only, not its checksum, formula correspondence or national notification status.

Detergent ingredient fields follow the current information workflow. Consumer products request a public ingredients URL; professional-only products request the equivalent information supplied to users. Hazard wording, allergen declarations, preservative information and all translations remain the supplier's responsibility. A website link is not proof that an SDS was supplied to the appropriate recipients.

For a non-EU manufacturer, the current information workflow asks for the applicable EU operator and its role. It does not require two universal representatives. The future authorised representative duty in Article 9 of Regulation 2026/405 requires a separate supply-chain assessment. No CE mark is generated for ordinary chemical cleaners.

## Data, validation and language behavior

- The stable stored category value is `car_cleaning`; product information is held in `passports.category_data`.
- The shared contract is `supabase/functions/_shared/carCleaning.ts`. The frontend imports it through `src/lib/carCleaning.ts`.
- Saving through the editor requires the applicable fields and valid value formats. The authenticated `save-car-cleaning-passport` gateway validates the same shared contract on the server, verifies the user and restricts updates to that user's car records. The later restrictive RLS migration rejects direct authenticated REST inserts and updates for this category. Other categories retain their existing saving behavior. These controls enforce the application's data contract, not product compliance or the truth of supplier evidence.
- The explicit Annex VI profile collects the applicable future dataset, including full lists of intentionally added substances, qualifying carry-over preservatives and microorganisms identified by genus, species and strain. Its narrow equivalent-SDS route requires the applicable industrial or institutional use and equivalent supply assessments; it does not exempt microorganism data. Future operator, identifier, backup, manufacturer statement, traceability and label information remain separate from the current chemical information workflow. Structured rows are validated as complete lists, including duplicate and malformed entries.
- The public API and renderer apply the same explicit field projection. Unknown fields, malformed values, inactive conditional values and their translations are omitted. The internal dashboard name is not used as the public product name.
- Category authoring fields are public. The gateway discards unknown and inactive category data before new writes. It does not collect a private formulation, poison centre dossier, internal medical ingredient sheet or confidential file upload. A user can still disclose sensitive information in a public text field or link, so the editor states the public boundary explicitly. Retained raw snapshots, including any older private data, remain owner-only; anonymous responses and exports apply the public projection.
- Public JSON uses `open-label.car-cleaning.v1`, stable field and enum identifiers, and a regulatory-context block that explicitly states that it is neither certification nor a complete statutory DPP. Print uses the same public rendering.
- The editor and public interface support all 24 official EU languages plus Simplified Chinese. Free-text translations can be supplied and reviewed per language. Safety fields do not automatically call the AI translation service. Existing wine and toy label extraction is not applied to chemical classification or compliance assertions.
- The public demo includes a clearly fictitious current-information car cleaner alongside the existing category samples. It uses the same dedicated public renderer and privacy boundary as saved car passports. Demo data does not create a saved passport, retained history or a supplier compliance assessment.

## Technical limits

The implementation includes a stable public URI, an internal archive identifier, immutable version snapshots, retained public access after withdrawal, and a downloadable SVG QR carrier. The stored retention floor can extend but does not decrease, and the public API can return a selected version with a paginated history index. These implemented controls do not establish verified persistent product or operator identifiers, registry submission, a contracted passport backup provider, guaranteed ten-year service operation or verified authority access to technical documentation. Supplier references, declarations and dataset completeness are not independently verified.

Retained snapshots contain JSON and document or image URLs, not immutable copies of the underlying files. External links and storage objects can change or disappear. Actual asset retention, independent backups and restore tests, hosting and domain continuity, and an authorised succession or exceptional redaction process remain operational prerequisites. The [platform design](CAR_CLEANING_PLATFORM.md) details the implemented controls, deployment order and remaining limits.

Regulation (EU) 2026/1778 already establishes DPP registry arrangements. This implementation does not connect to that registry. A detergent-specific technical implementing act under Article 21(10) was not verified in this research; do not infer that all infrastructure rules are still pending or that every detergent technical detail has been finalised.

The app does not establish formulation legality, actual biodegradability, REACH substance duties, hazard classification, national label-language sufficiency, poison centre submission, biocidal authorisation, transport classification, packaging duties or entitlement to stock transitions. It does not generate an affirmative conformity statement from form completeness.

Public `/p/` documents omit authoring authentication storage and refresh, the application's marketing tag, referral capture and consent geolocation. The application suppresses its page-view reporting for those routes. Transitions between authoring or marketing pages and public passports use a fresh document so previously loaded scripts are isolated. Public passport fetches omit viewer credentials and referrers; arbitrary third-party primary images require an explicit link click, and rich descriptions exclude active media and style content. These controls do not constitute an audit or guarantee about all third-party behavior, hosting access logs or retained data.

## Deployment

Apply and commit the additive enum migration `20260910095000_add_car_cleaning_category.sql` before `20260910110000_car_cleaning_passport_history.sql`. Deploy `get-public-passport` and `save-car-cleaning-passport` with their shared dependencies and the updated frontend. Enable `20260910120000_require_car_cleaning_save_gateway.sql` only after the gateway and client are available, so the direct-write restriction does not block older callers during a partial release. Coordinate category visibility and follow the existing hosting workflow. Review the sequence against a disposable compatible database before production.

The history migration removes inherited non-owner grants on its two new tables and five internal functions before granting intended reads. This prevents deployment-specific default grants, including grants to automation roles that bypass RLS, from exposing raw history or allowing forged versions. Existing table grants and role defaults remain unchanged. Database owners and privileged platform administrators remain part of the operational trust boundary.

Do not equate a local build, a GitHub commit, or a frontend publish with a complete release. Verify the migrations, authenticated gateway, public function response, served frontend assets, actual save/reload and history behavior, and unauthenticated public rendering on the target host. Use only named disposable test records. Deleting a car dashboard row withdraws it while retaining its public archive, so cleanup must respect the documented retention semantics and affect only task-owned records.

## Verification

Run `npm test`, `npm run test:coverage`, `npm run build`, `npm run lint` and `npx tsc --noEmit -p tsconfig.app.json`. Category tests include legal condition combinations, negative inputs, public data projection, export metadata, actual localized component rendering and regression of existing category behavior. Browser screenshots are supplementary evidence and do not replace assertions or backend checks.

The [EU legal mapping](CAR_CLEANING_LEGAL_MAPPING.md) provides primary sources and article-level conditions.
