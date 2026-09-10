# Car cleaning products: EU legal mapping

Research date: 10 September 2026. This is an implementation mapping for collecting product information and preparing future passport data. It does not establish that any specific formulation, supplier, label or product complies.

## Primary sources

Sources were reviewed on 10 September 2026. This mapping distinguishes current duties, the 2029 detergent regime and technical implementation limits.

Primary sources used:

- [Regulation (EU) 2026/405, official text](https://eur-lex.europa.eu/eli/reg/2026/405/oj/eng): complete browser snapshot, Articles 1 to 4, 8 to 10, 17 to 24, 35 to 37, Annexes IV to VI.
- [Regulation (EC) 648/2004, current consolidated text dated 1 June 2015](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02004R0648-20150601): Articles 2 to 4 and 9; Annex VII. Indexed primary excerpts used after direct fetch challenge.
- [ECHA CLP labelling and packaging](https://echa.europa.eu/web/guest/regulations/clp/labelling) and [ECHA classification and labelling decisions](https://echa.europa.eu/en/support/mixture-classification/decide-on-classification-and-labelling).
- [ECHA poison-centre scope](https://poisoncentres.echa.europa.eu/nl/know-your-obligations), [UFI generation and placement](https://poisoncentres.echa.europa.eu/mt/generate-your-ufis), and [industrial-use-only information](https://poisoncentres.echa.europa.eu/pl/-/compliance-date-for-industrial-use-only-mixtures-approaching-january-2024). These pages expose English substantive text despite their locale path.
- [ECHA safety data sheets](https://echa.europa.eu/en-GB/safety-data-sheets), [REACH substance registration](https://echa.europa.eu/support/registration/), and [Commission REACH restrictions](https://single-market-economy.ec.europa.eu/sectors/chemicals/reach/restrictions_en).
- [Biocidal Products Regulation, current consolidated text dated 15 June 2026](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02012R0528-20260615): Articles 17, 22 and Annex V. [ECHA authorised biocidal products](https://echa.europa.eu/information-on-chemicals/biocidal-products) supplies the scope of authorisation and transitional review context.
- [ESPR Regulation (EU) 2024/1781](https://eur-lex.europa.eu/eli/reg/2024/1781/oj): Article 9 and Annex III.
- [Commission Implementing Regulation (EU) 2026/1778](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R1778): registry arrangements, Articles 1 to 3 and 24.
- [Commission CE marking guidance](https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking_en).

## Applicable regime and dates

Regulation 2026/405 was published on 2 March 2026 and entered into force on 22 March 2026. Article 37 makes it applicable from **23 September 2029**, apart from Article 4(3) and (4), which have their own later biodegradability milestones. Article 35 repeals 648/2004 on 23 September 2029. In force and applicable are separate concepts.

Article 36 permits compliant products placed on the market before 23 September 2029 to continue being made available indefinitely. Products first placed from 23 September 2029 until before 23 September 2030 under the old requirements may be made available until 23 September 2030. These provisions concern actual market placement, not the date a form or passport was created. A product date or a checked box alone does not establish entitlement to a transition.

Article 2(1) of the new regulation covers substances, mixtures and micro-organisms intended to clean surfaces; Article 2(6) defines the cleaning process. Product function determines scope. Ordinary shampoos, wheel cleaners and interior surface cleaners are plausible category members. The current definition expressly includes cleaning mixtures for means of transport and associated equipment. Pure coatings, polish without cleaning function, lubricants and air fresheners need individual scope review. A name containing "car care" is insufficient. Disinfection is a separate conditional branch, and may coexist with detergents rules.

The app should state that it supports current product information and preparation for the 2029 detergent DPP requirements. It should not mark a passport as legally complete, certified, authorised by the EU, or mandatory today merely because fields have values.

## Current information and chemical-law conditions

Under 648/2004, the responsible manufacturer is established in the EU, and this legal role includes importers and certain relabellers. Keep EU responsible-party details. Annex VII A uses specified constituent classes and four percentage bands when those classes exceed 0.2% by weight; added preservatives are listed regardless of concentration and specified fragrance allergens above 0.01%. Annex VII D requires an unrestricted, maintained ingredients webpage, without mandatory percentage ranges or CAS numbers. Its naming and perfume/colorant rules differ from the medical sheet. Professional-only supply can use an equivalent information route. Articles 4 and 9 require supporting surfactant biodegradability information; a boolean is not a test report. Do not apply laundry or dishwasher phosphate/dosage limits indiscriminately to car products. [648/2004](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02004R0648-20150601)

CLP hazard assessment controls hazard labelling. Collect classification status, product identifier, applicable pictograms, signal word, hazard statements, precautionary statements, supplemental statements, supplier contacts and nominal quantity. ECHA states the supplier details must be for an EU-established supplier from 1 July 2026. Do not infer classification from pH or hazard pictograms alone; use the actual assessed classification and approved label. Literal H/P/EUH code strings are not a substitute for the required wording in each applicable market language. [ECHA CLP](https://echa.europa.eu/web/guest/regulations/clp/labelling), [ECHA label decisions](https://echa.europa.eu/en/support/mixture-classification/decide-on-classification-and-labelling)

Current poison-centre notification generally covers mixtures classified for human-health or physical hazards, subject to scope exemptions. Environment-only classification, a nonhazardous mixture, or supplemental EUH208 alone must not automatically activate a mandatory UFI. For in-scope products, collect the actual UFI and notification review status; a syntactically valid code does not establish a valid national notification. Consumer and professional supply generally requires label UFI; industrial-site-only supply may put it in SDS section 1.1. "Professional" and "industrial-site-only" are not equivalent. A public form should never request the confidential PCN composition. [ECHA scope](https://poisoncentres.echa.europa.eu/nl/know-your-obligations), [ECHA industrial route](https://poisoncentres.echa.europa.eu/pl/-/compliance-date-for-industrial-use-only-mixtures-approaching-january-2024)

REACH safety-data-sheet duties are conditional. Hazardous mixtures require SDS provision in the supply chain; some nonhazardous mixtures require it on request. General-public supply with sufficient safe-use information does not automatically mean an SDS must be handed to every consumer. Collect SDS applicability/review status and an actual current SDS URL, language and revision date when available. Registration relates to constituent substances, with role, tonnage and exemption conditions; do not invent a single "REACH registration number" for the cleaning mixture. Substance-specific Annex XVII restrictions must be reviewed using the actual formula and uses. A public product page cannot establish that review. [ECHA SDS](https://echa.europa.eu/en-GB/safety-data-sheets), [ECHA registration](https://echa.europa.eu/support/registration/), [Commission restrictions](https://single-market-economy.ec.europa.eu/sectors/chemicals/reach/restrictions_en)

BPR Annex V excludes cleaners that have no intended biocidal effect from its disinfectant product types. If antimicrobial or disinfectant function is intended, record the product's regulatory review and applicable authorisation or transitional legal basis, relevant markets, active-substance information and authorised uses. Article 17 normally requires authorisation, while legacy active-substance review arrangements require specific checking. Do not reduce this to "contains preservative = disinfectant" or "claims absent = outside BPR". Treated-article issues can arise separately. Keep authorisation checks distinct from the detergent DPP. [BPR](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02012R0528-20260615), [ECHA authorisation information](https://echa.europa.eu/information-on-chemicals/biocidal-products)

## Future DPP field requirements

The following table maps Regulation 2026/405 Annex VI Part A. These are future regulatory fields, not proof that the app implements an operative statutory passport.

| Reference | Data | Condition and implementation rule |
| --- | --- | --- |
| (a) | Trade name, unique product identifier, clear colour image of model packaging or label | Use real identifiers and identifiable product images. An internal UUID is not automatically a standards-compliant persistent identifier. |
| (b) | Manufacturer name, postal and electronic address, telephone, unique operator identifier | Collect business contact details. Include applicable importer or authorised-representative contacts. |
| (c) | Reference to provider hosting passport backup | Only name a real arranged provider. A database backup or blank provider string does not prove the required service. |
| (d) | Identification enabling traceability | Model identity plus appropriate type or batch references. |
| (e) | Manufacturer's sole responsibility indication | Not a third-party certificate or app attestation. |
| (f) | Commodity codes | Where applicable, use the actual classification at passport creation; do not guess solely from the category. |
| (g) | Demonstrated compliance statement and relevant other Union law | Requires supporting assessment. Store a review state rather than automatically generating an affirmative legal statement. |
| (h) | Full intentionally added substance list, plus qualifying carry-over preservatives | Identify according to CLP Article 18(3). Industrial/institutional detergents or surfactants may use the stated equivalent-SDS exception. This is distinct from quantitative technical/PCN formulation and from the present public ingredients page. |
| (i) | All intentionally added micro-organisms by genus, species and strain name or code | Conditional on intentional addition. Absence must not be inferred from an empty field. |

Annex VI Part B permits additional label information. It does not turn every technical-document field into mandatory public passport content.

Article 21 normally requires a passport per model; batch/item level is allowed where other applicable Union legislation requires it. Article 2(39) ties a model to manufacturer, trade name, content, manufacturing process and applicable CLP classification. A reformulation may require a new model and linked new passport, not silently editing an old public record.

Article 21 requires completeness, accuracy, updating, required market languages, persistent identifier linkage and 10-year availability including business cessation. The carrier must be physically present in the specified location, indelible, machine processable and visible before purchase, including relevant distance sales; refill stations have explicit carrier requirements. A single carrier/passport should serve overlapping Union obligations, with optional material clearly separated. Article 21(12) requires a backup through a passport service provider.

Article 22 requires open, interoperable, structured and appropriate machine-readable data, free access based on actor rights, no consumer registration/password barrier, security and integrity. Usage tracking is tightly constrained. A marketing analytics script on the public page may be inconsistent with the future passport rules. Technical-document access is not equivalent to unrestricted public access.

Article 23 links carrier/identifier standards and operator credentials to ESPR. Article 24 requires registry uploads of product/operator identifiers and applicable customs commodity codes. The resulting registration identifier is expressly not proof of product compliance.

## Future labels and technical evidence

Articles 17 to 19 and Annex V require traceability, product/operator identity, relevant use instructions and precautions. Annex V adds the UFI for detergents/end-user surfactants and addresses professional-only labelling. It has changed preservative/allergen and microorganism rules, so the present Annex VII logic must not be silently reused as a claimed 2029 implementation. Consumer surface detergents require recommended dilution and quantity per area or other instructions that avoid excessive use (Annex V Part B(4)).

Digital information does not eliminate the physical label. Article 18 and Annex V Part C allow only specified information to move exclusively to digital form. Hazard communication under CLP continues under Article 1(2). A QR code alone is not the product label.

Annex IV uses internal production control. Its technical file includes a general description, applicable test/risk reports, methods, calculations and a detailed ingredients sheet including composition ranges, applicable microorganism data, pH or an explanation if unavailable, and a label specimen. These technical fields should be referenced as evidence without requesting confidential files in the present publicly exposed category data. Intentionally added microorganisms also engage Annex II safety requirements.

For EU operators under the new regime, Article 9 requires an EU authorised representative for a manufacturer established outside the EU. This is not interchangeable with the current 648/2004 manufacturer definition. Importers have separate verification obligations in Article 10. A future form should allow the actual roles rather than a generic "EU contact" alone.

## ESPR, registry and CE boundaries

ESPR Article 9 connects its DPP requirements to applicable product delegated acts. It is not an immediate blanket passport mandate for every physical product. Regulation 2026/405 separately creates the detergent passport and coordinates identifiers and infrastructure with ESPR. [ESPR](https://eur-lex.europa.eu/eli/reg/2024/1781/oj)

Registry implementing arrangements already exist: Regulation 2026/1778 was published on 17 July 2026 and entered into force on 6 August 2026. It covers registry access, verification, identifiers, granularity, update/deletion and systems. Its existence does not accelerate the detergent application date. No real registry integration or verified-provider relationship has been established for this app. A detergent-specific Article 21(10) technical implementing act was not verified in this research, so do not assert either that all technical rules are final or that no implementing rules exist. [Registry act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R1778)

The detergent acts do not create a CE marking requirement. Annex IV manufacturer assessment and an Article 21 passport do not amount to EU certification. The Commission limits CE marking to products whose relevant legislation requires it. Exclude CE mark, notified-body number and generic EU Declaration of Conformity generation from this ordinary cleaning-product category. Any separately regulated equipment or other product is outside this category decision. [Commission CE guidance](https://single-market-economy.ec.europa.eu/single-market/goods/ce-marking_en)

## Original current-information implementation

Seven field groups can cover the intended preparation workflow without implying certification:

1. Product identity and scope: trade name, cleaning function, use audience, target markets, model/traceability and package quantity.
2. Responsible operators: manufacturer and applicable EU supplier/importer/representative business contacts.
3. Safe use: suitable surfaces, dilution/dose, use instructions, precautions, storage and disposal information supported by the product documents.
4. Public ingredients: current detergent label classes/bands, preservatives/allergens as applicable, and unrestricted current ingredients URL.
5. Hazard information: classification status, label information, conditional UFI, SDS review and document link.
6. Regulatory evidence status: biodegradability, REACH review, and biocidal applicability/authorisation review with nonconfidential references.
7. Future DPP preparation: packaging image, identifiers, backup-provider status, manufacturer assessment status and explicit preparation limitations.

Use unknown/not assessed states rather than defaulting false. Distinguish form completeness from evidence review and legal compliance. Scope requiring special review should remain visibly unresolved; completing unrelated fields must not convert it into a pass. Store no confidential composition, poison-centre dossier, medical ingredient sheet or internal risk report in publicly exposed category data. Enforce the same public projection in API, exports and display. A public free-text field or URL can itself leak sensitive data, so label requested information as public and constrain document types at the point of entry.

This mapping checks EU-level source rules and their conditions. It does not check a particular formulation, Member State labelling languages, actual registrations, poison-centre submissions, biocidal authorisation, transport classification, packaging waste duties or product-specific claims. Those should not be represented as verified by saving or exporting this form.


## Annex VI and platform amendment, 10 September 2026

The current profile remains available because the main application date is 23 September 2029. The explicit `annex_vi` profile now collects the full Annex VI Part A dataset for detergent-scope products. A complete field set is not an assessment, verified identifier, registry submission or operating-service guarantee.

| Primary provision | Implemented data and behavior |
| --- | --- |
| VI A(a) | Public product trade name, supplier persistent product identifier, model reference, public colour label/packaging image URL. Server-issued internal UUID and immutable public slug identify the platform record separately. |
| VI A(b), Article 9 | Manufacturer name/address/email/phone/operator ID. Future non-EU representative contacts and mandate are required. EU manufacturers can declare an appointed representative. Importer applicability and name/address/email/phone are separate. |
| VI A(c) | Actual independent backup provider URL and agreement reference, entered by the supplier. No agreement or backup service is created by these fields. |
| VI A(d) | Model and traceability references. Product-content and manufacturing-process revision references help record the Article 2(39) model definition. |
| VI A(e), A(g) | Explicit manufacturer sole-responsibility indication, manufacturer compliance-demonstrated statement, other applicable Union laws and assessment reference. The platform never produces certification. |
| VI A(f) | Applicable commodity code or an explicit non-applicability assessment. No automatic customs classification. |
| VI A(h) | Full structured substance identities, optional CAS/EC/other identifier, intentional-addition or qualifying carry-over preservative basis. No concentrations or confidential medical/technical formula. The supplier confirms completeness and CLP Article 18(3) naming assessment. |
| VI A(h) exception | Separate equivalent-SDS route requires non-consumer use, statutory industrial/institutional confirmation, actual equivalent SDS supply confirmation, URL, language and revision. Ordinary professional use alone does not qualify. |
| VI A(i) | Explicit microorganism presence or absence; every intentionally added genus, species and strain name/code. The substance-SDS exception never removes this dataset. |
| Annex V | Future UFI separate from current CLP notification scope; distinct future ingredient class/constituent, preservative and Part D allergen information; microorganism shelf-life and conditional food-contact instructions. Current 648/2004 information remains separate. |
| Articles 21, 22 | Structured JSON and anonymous public GET/POST, permanent platform URI reservation, append-only retained versions, version index and old-version access, retained withdrawal route, owner-only raw archive access, authenticated validated write gateway and restrictive direct-write policy. |
| Article 22(f) | Supplier-entered preceding-passport URL; duplicating a record records the source URI and starts a current-information profile with a new model reference. This is not an external identifier verification service. |
| Articles 21(4), 21(12) | Real downloadable SVG QR carrier, four-module quiet zone, scan instruction, readable stable URI and JSON endpoint metadata. Local image decoding verifies encoded bytes only. Physical label placement, print material, size, visibility, durability and live resolution still require testing. |

The source contract is shared between frontend validation, public projection, export and the authenticated save gateway. Invalid structured lists are rejected as a whole rather than silently truncated. Unknown keys and hidden branches are removed before new saves and public historical rendering. The platform bounds each dataset at 500 rows, row identity text at 500 characters, optional identifiers at 200 characters, ordinary text at 2,000 characters and prose at 10,000 characters. Those are implementation limits, not legal limits.

The archive fixes the platform UUID and public slug. Once future model information is retained, the model reference, trade name, manufacturer operator ID, content revision, process revision and CLP classification cannot be silently replaced, including by changing the selected profile. A new model needs a new passport. This does not detect a real formulation or process change concealed behind an unchanged supplier revision reference.

Retention is a software floor of at least ten years after the later of the save timestamp and the supplier's latest declared placing-on-market date. The floor never decreases and there is no automatic expiry purge. The actual market-placement date may be omitted for a product not yet placed. Supplier updates for later placements remain necessary. Deleting the dashboard record or auth account does not cascade into retained snapshots. Historical data starts with the migration seed or first subsequent save; earlier versions cannot be reconstructed.

These records retain JSON and document URLs. They do not guarantee retention of external files or object-storage bytes. Replaced car images are excluded from the app's ordinary post-save cleanup, but provider lifecycle policies, direct object deletion and external links need an immutable asset system and tested backup/restore process. Account erasure does not erase legally retained business records automatically; exceptional correction, confidential-data removal and rights requests need an authorised, audited operational process before regulatory operation.

Public routes omit authoring authentication storage/refresh and advertising/referral tools. Crossing between authoring and public content reloads the document. Public API calls omit viewer credentials and referrer. Rich-description media/style content is removed; arbitrary external primary image hosts remain behind a user-initiated link. Managed app image delivery still necessarily receives network requests. The rate limiter uses bounded ephemeral salted IP hashes, not a persistent usage log. Hosting, CDN, provider logging and contractual data-processing controls still require independent review.

## Required external and deployment prerequisites

1. Restore the mandated real Chrome WebBridge connection and complete all five browser QA rounds, at least 50 distinct genuine screenshots, console/network checks, real account persistence and public resolution. None of the local rendering or unit tests substitutes for this gate.
2. Obtain authorised backend deployment access through the supported credential workflow. Deploy the enum migration first in its own committed migration transaction, then the additive history migration. Deploy both edge functions and the client that uses the save gateway before enabling the restrictive direct-write policy. Coordinate hosting visibility so users never reach a partially deployed category.
3. Configure and verify the actual production domain, HTTPS resolver and carrier URLs. Keep the same canonical public origin stable. The current environment has not verified the hosting/domain binding or deployed these amendments.
4. Establish actual persistent product/operator identifier issuance, applicable standards conformance, digital credentials, registry access and submission under the applicable EU arrangements. The platform UUID is explicitly unverified; no registry ID is generated locally.
5. Contract an independent DPP service provider for backup, establish business-continuity and insolvency availability, immutable assets, monitored retention and tested restore procedures. Supplier text fields do not establish these services.
6. Implement authority and other restricted actor access according to the applicable implementing measures and verified credentials. Present access is anonymous public content plus authenticated owner archives, with no claimed regulator login, confidential technical-file portal or federated authority system.
7. Require product-specific supplier evidence: composition and intended use, conformity assessment and technical file, physical label and market languages, REACH/CLP/SDS/PCN/BPR duties as applicable, dates, operator mandates and actual provider arrangements. Do not place private dossiers in the public category or public upload bucket.

Primary legal detail and exact-source extracts are preserved outside git in `research/ANNEX_VI_AUDIT.md` and `research/ANNEX_VI_PRIMARY_EXTRACTS.txt`. This amendment does not change the verified legal dates or turn ESPR into a universal present mandate. [2026/405](https://eur-lex.europa.eu/eli/reg/2026/405/oj/eng), [648/2004](https://eur-lex.europa.eu/eli/reg/2004/648/2015-06-01/eng), [ESPR](https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng), [registry arrangements 2026/1778](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32026R1778).
