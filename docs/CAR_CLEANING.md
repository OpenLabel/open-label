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
- Saving through the editor requires the applicable fields and valid value formats. Other categories retain their existing saving behavior. These are client-side completeness checks; direct authenticated database writes are not validated by a new database trigger.
- The public API and renderer apply the same explicit field projection. Unknown fields, malformed values, inactive conditional values and their translations are omitted. The internal dashboard name is not used as the public product name.
- Every collected field is public. No private formulation, poison centre dossier, internal medical ingredient sheet or confidential file upload is collected by this category. A user can still disclose sensitive information in a public text field or link, so the editor states the public boundary explicitly.
- Public JSON uses `open-label.car-cleaning.v1`, stable field and enum identifiers, and a regulatory-context block that explicitly states that it is neither certification nor a complete statutory DPP. Print uses the same public rendering.
- The editor and public interface support all 24 official EU languages plus Simplified Chinese. Free-text translations can be supplied and reviewed per language. Safety fields do not automatically call the AI translation service. Existing wine and toy label extraction is not applied to chemical classification or compliance assertions.

## Technical limits

The future statutory passport requires more than this form. The app does not provide verified persistent product or operator identifiers, registry submission, a contracted passport backup provider, a guaranteed ten-year retention service, role-based authority access to technical documentation, or the full Annex VI substance and microorganism dataset. References entered into preparation fields are not independently verified.

Regulation (EU) 2026/1778 already establishes DPP registry arrangements. This implementation does not connect to that registry. A detergent-specific technical implementing act under Article 21(10) was not verified in this research; do not infer that all infrastructure rules are still pending or that every detergent technical detail has been finalised.

The app does not establish formulation legality, actual biodegradability, REACH substance duties, hazard classification, national label-language sufficiency, poison centre submission, biocidal authorisation, transport classification, packaging duties or entitlement to stock transitions. It does not generate an affirmative conformity statement from form completeness.

Cold loads of public `/p/` routes do not initialise this application's marketing tag, referral capture or consent geolocation. The application also suppresses its page-view reporting for those routes. A third-party script already loaded during an earlier marketing-page visit in the same browser document can remain present after SPA navigation. This is not an audit or guarantee about all third-party behavior, hosting access logs or retained data.

## Deployment

Deploy the additive database enum migration `20260910095000_add_car_cleaning_category.sql` before exposing the selector. Existing category values and customer records remain unchanged. Deploy the updated `get-public-passport` function together with its `_shared/carCleaning.ts` dependency so the public API enforces the projection. Then build and publish the frontend through the existing hosting workflow.

Do not equate a local build, a GitHub commit, or a frontend publish with a complete release. Verify the enum migration, public function response, served frontend assets, actual save/reload behavior and unauthenticated public rendering on the target host. Use only named disposable test records and remove only records created for that verification.

## Verification

Run `npm test`, `npm run test:coverage`, `npm run build`, `npm run lint` and `npx tsc --noEmit -p tsconfig.app.json`. Category tests include legal condition combinations, negative inputs, public data projection, export metadata, actual localized component rendering and regression of existing category behavior. Browser screenshots are supplementary evidence and do not replace assertions or backend checks.

The [EU legal mapping](CAR_CLEANING_LEGAL_MAPPING.md) provides primary sources and article-level conditions.
