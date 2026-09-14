/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { BaseTemplate, TemplateSection } from './base';

export class TextilesTemplate extends BaseTemplate {
  id = 'textiles';
  name = 'Apparel, Footwear & Accessories';
  description =
    'Garment Passport for apparel, footwear and accessories per EU Regulation 1007/2011 fibre labelling, the ESPR rules on destruction of unsold consumer goods, and the Empowering Consumers Directive (EU) 2024/825';
  icon = '👕';

  sections: TemplateSection[] = [
    {
      id: 'identity',
      title: 'Identity',
      description: 'Product and item level identification plus the EU economic operator',
      questions: [
        {
          id: 'show_advanced_fields',
          label:
            'Show all fields (certifications detail, full supply chain, environmental footprint, durability testing, extended circularity)',
          type: 'checkbox',
          helpText:
            'Most brands only need the fields below. Turn this on if you have lab test results, LCA data, or detailed supply-chain traceability to record.',
        },
        {
          id: 'gtin',
          label: 'GTIN / EAN',
          type: 'text',
          placeholder: 'e.g., 3401234567890',
          helpText: 'Trade item number identifying the SKU.',
        },
        {
          id: 'item_unique_identifier',
          label: 'Per-item Unique Identifier',
          type: 'text',
          placeholder: 'e.g., DPP-2026-000184213',
          helpText:
            'Identifies this individual physical item, not the SKU. Per-item identifiers are what enable resale, ownership transfer and authentication over the product lifetime.',
          warnWhen: {
            equals: [undefined, ''],
            message:
              'Open Label does not assign this identifier for you. Brands should build their own per-item identification system — e.g. serialized RFID/NFC tags, a production-line numbering scheme, or an existing ERP serial — and enter that value here.',
          },
        },
        {
          id: 'style_reference',
          label: 'Style / Model Reference',
          type: 'text',
          required: true,
          badge: 'required',
          placeholder: 'e.g., ST-4412 Oxford Shirt',
          helpText:
            'Regulation (EU) 2023/988 (GPSR) requires a product identifier of type, batch or serial number alongside the manufacturer name and address. This is the identifier for the product type/batch — it is not a substitute for the per-item identifier above.',
        },
        {
          id: 'colourway',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Colourway',
          type: 'text',
          placeholder: 'e.g., Indigo / Ecru',
        },
        {
          id: 'size',
          label: 'Size',
          type: 'text',
          placeholder: 'e.g., M, 42, 10',
        },
        {
          id: 'product_weight_grams',
          label: 'Product Weight (grams)',
          type: 'number',
          placeholder: 'e.g., 220',
          helpText:
            'Net weight of the item, used for shipping and material-intensity reporting.',
          showWhen: { field: 'show_advanced_fields', equals: true },
        },
        {
          id: 'batch_lot',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Batch or Production Lot',
          type: 'text',
          placeholder: 'e.g., LOT-2026-03-A',
        },
        {
          id: 'brand_name',
          label: 'Brand Name',
          type: 'text',
          required: true,
          badge: 'required',
        },
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'text',
          required: true,
          badge: 'required',
          placeholder: 'e.g., T-shirt, Sneaker, Belt',
        },
        {
          id: 'eu_operator_name',
          label: 'EU Responsible Person / Economic Operator Name',
          type: 'text',
          required: true,
          badge: 'required',
        },
        {
          id: 'eu_operator_address',
          label: 'EU Responsible Person / Economic Operator Address',
          type: 'textarea',
          required: true,
          badge: 'required',
          placeholder: 'Registered address inside the European Union',
        },
        {
          id: 'passport_valid_until',
          label: 'Passport Valid Until',
          type: 'text',
          placeholder: 'YYYY-MM-DD',
          helpText:
            'Optional expiry date for this passport record, e.g. for a limited-run or seasonal product. Leave blank if the passport should remain valid indefinitely.',
          showWhen: { field: 'show_advanced_fields', equals: true },
        },
      ],
    },
    {
      id: 'materials',
      title: 'Materials and Composition',
      description: 'Mandatory fibre content labelling per EU Regulation 1007/2011',
      questions: [
        {
          id: 'primary_fiber',
          label: 'Primary Fiber Type',
          type: 'select',
          required: true,
          badge: 'required',
          options: [
            { value: 'cotton', label: 'Cotton' },
            { value: 'organic_cotton', label: 'Organic Cotton' },
            { value: 'polyester', label: 'Polyester' },
            { value: 'recycled_polyester', label: 'Recycled Polyester' },
            { value: 'wool', label: 'Wool' },
            { value: 'linen', label: 'Linen' },
            { value: 'silk', label: 'Silk' },
            { value: 'viscose', label: 'Viscose/Rayon' },
            { value: 'lyocell', label: 'Lyocell/Tencel' },
            { value: 'nylon', label: 'Nylon/Polyamide' },
            { value: 'elastane', label: 'Elastane/Spandex' },
            { value: 'hemp', label: 'Hemp' },
            { value: 'leather', label: 'Leather' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'primary_fiber_percentage',
          label: 'Primary Fiber Percentage (%)',
          type: 'number',
          required: true,
          badge: 'required',
          placeholder: 'e.g., 80'
        },
        {
          id: 'secondary_fiber',
          label: 'Secondary Fiber Type (if applicable)',
          type: 'text',
          placeholder: 'e.g., Elastane'
        },
        {
          id: 'secondary_fiber_percentage',
          label: 'Secondary Fiber Percentage (%)',
          type: 'number',
          placeholder: 'e.g., 20'
        },
        {
          id: 'full_composition',
          label: 'Full Composition Statement',
          type: 'textarea',
          placeholder: 'e.g., 80% Cotton, 15% Polyester, 5% Elastane',
          required: true,
          badge: 'required',
        },
        {
          id: 'component_composition',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Component-level Composition',
          type: 'textarea',
          placeholder:
            'Outer shell: 100% Cotton\nLining: 100% Viscose\nTrims: Polyester zip, brass buttons',
          helpText:
            'Declare outer shell, lining and trims separately so each component can be assessed for recycling.',
        },
        {
          id: 'recycled_content_percentage',
          label: 'Total Recycled Content Percentage (%)',
          type: 'number',
          placeholder: 'e.g., 50'
        },
        {
          id: 'recycled_pre_consumer_percentage',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Pre-consumer Recycled Content (%)',
          type: 'number',
          placeholder: 'e.g., 20',
          helpText: 'Production waste reclaimed before reaching a consumer.',
        },
        {
          id: 'recycled_post_consumer_percentage',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Post-consumer Recycled Content (%)',
          type: 'number',
          placeholder: 'e.g., 30',
          helpText: 'Material recovered from products that reached end users.',
        },
        {
          id: 'microplastic_shedding',
          label: 'Contains synthetic fibres that shed microplastics?',
          type: 'checkbox',
          helpText:
            'The French AGEC law requires informing consumers when a garment releases microplastic fibres during washing.',
        },
        {
          id: 'svhc_declared',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'REACH / SVHC substances present above 0.1% w/w?',
          type: 'checkbox',
          badge: 'where_applicable',
          helpText: 'Substances of Very High Concern per Regulation (EC) 1907/2006 (REACH).',
        },
        {
          id: 'svhc_details',
          label: 'SVHC Substance Details',
          type: 'textarea',
          placeholder: 'Substance name, CAS number, concentration and component',
          showWhen: { field: 'svhc_declared', equals: true },
        },
        {
          id: 'rsl_compliance_status',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Restricted Substance List (RSL) Compliance Status',
          type: 'select',
          options: [
            { value: 'compliant_tested', label: 'Compliant — verified by testing' },
            { value: 'compliant_declared', label: 'Compliant — supplier declaration only' },
            { value: 'in_progress', label: 'Assessment in progress' },
            { value: 'not_assessed', label: 'Not assessed' }
          ]
        },
      ],
    },
    {
      id: 'certifications',
      title: 'Certifications',
      description:
        'Which certifications this item holds, and how to verify each claim.',
      questions: [
        {
          id: 'certifications_held',
          label: 'Certifications Held',
          type: 'multi_select',
          options: [
            { value: 'gots', label: 'GOTS (Global Organic Textile Standard)' },
            { value: 'oeko_tex', label: 'OEKO-TEX Standard 100' },
            { value: 'grs', label: 'GRS (Global Recycled Standard)' },
            { value: 'bluesign', label: 'bluesign®' },
            { value: 'fair_trade', label: 'Fair Trade' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'certificate_references',
          label: 'Certificate References',
          type: 'textarea',
          placeholder:
            'One per line, e.g.\nGOTS — CU 123456 GOTS — expires 2027-06-30\nOEKO-TEX — 21.HTR.12345 — expires 2027-01-15',
          helpText:
            'From 27 September 2026 the Empowering Consumers Directive (EU) 2024/825 prohibits displaying a certification claim without a verifiable reference behind it. Leave blank if no certifications are held above.',
        },
      ],
    },

    {
      id: 'supply_chain',
      title: 'Supply Chain Journey',
      description: 'Country of each production stage plus Tier 1 factory and audit status',
      questions: [
        {
          id: 'country_fibre_production',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Country of Fibre Production',
          type: 'text',
          placeholder: 'Where the fibre was grown or produced',
        },
        {
          id: 'country_spinning_weaving',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Country of Spinning / Weaving',
          type: 'text',
        },
        {
          id: 'country_dyeing_finishing',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Country of Dyeing / Finishing',
          type: 'text',
        },
        {
          id: 'country_of_origin',
          label: 'Country of Making-up / Assembly',
          type: 'text',
          required: true,
          badge: 'required',
          helpText: 'The stage declared as country of origin on the label.',
        },
        {
          id: 'made_in_eu',
          label: 'Made in EU?',
          type: 'checkbox'
        },
        {
          id: 'manufacturing_facility',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Tier 1 Factory Name',
          type: 'text'
        },
        {
          id: 'factory_address',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Tier 1 Factory Address',
          type: 'textarea',
        },
        {
          id: 'audit_status',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Social / Environmental Audit Status',
          type: 'select',
          options: [
            { value: 'amfori_bsci', label: 'amfori BSCI audited' },
            { value: 'sedex_smeta', label: 'Sedex SMETA audited' },
            { value: 'sa8000', label: 'SA8000 certified' },
            { value: 'wrap', label: 'WRAP certified' },
            { value: 'brand_audit', label: 'Brand-led audit' },
            { value: 'not_audited', label: 'Not audited' }
          ]
        },
        {
          id: 'audit_certificate_file',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Audit Certificate (upload)',
          type: 'file',
          accept: 'application/pdf,image/*',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText: 'Held for your internal records — never published on the public passport.',
        },
        {
          id: 'supply_chain_transparent',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Full supply chain transparency available?',
          type: 'checkbox'
        },
      ],
    },
    {
      id: 'environment',
      title: 'Environmental Footprint',
      description: 'Environmental figures with a stated calculation method',
      questions: [
        {
          id: 'carbon_footprint',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Carbon Footprint (kg CO2e)',
          type: 'number',
          placeholder: 'Per unit of product'
        },
        {
          id: 'water_usage',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Water Usage (liters per unit)',
          type: 'number',
          placeholder: 'e.g., 2700 for cotton t-shirt'
        },
        {
          id: 'footprint_method',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Calculation Method',
          type: 'select',
          options: [
            { value: 'pefcr_apparel_footwear', label: 'PEFCR Apparel & Footwear' },
            { value: 'iso_14067', label: 'ISO 14067' },
            { value: 'ghg_protocol', label: 'GHG Protocol Product Standard' },
            { value: 'iso_14040_44', label: 'ISO 14040/14044 LCA' },
            { value: 'higg_msi', label: 'Higg MSI' },
            { value: 'internal_model', label: 'Internal model' }
          ],
          helpText:
            'A figure without a stated calculation method is not a substantiated claim under the Empowering Consumers Directive.',
        },
        {
          id: 'lca_report_file',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Supporting LCA Report (upload)',
          type: 'file',
          accept: 'application/pdf',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText: 'Held for your internal records — never published on the public passport.',
        },
      ],
    },
    {
      id: 'durability',
      title: 'Durability and Testing',
      description:
        'Measured durability results. The expected textile delegated act under ESPR is anticipated to focus on durability metrics, so record real test results rather than subjective scores.',
      questions: [
        {
          id: 'pilling_resistance',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Pilling Resistance Result',
          type: 'text',
          placeholder: 'e.g., Grade 4 after 2000 rubs',
          helpText: 'Test standard: ISO 12945-2 (Martindale pilling).',
        },
        {
          id: 'colour_fastness_washing',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Colour Fastness to Washing Result',
          type: 'text',
          placeholder: 'e.g., Grade 4-5',
          helpText: 'Test standard: ISO 105-C06.',
        },
        {
          id: 'colour_fastness_light',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Colour Fastness to Light Result',
          type: 'text',
          placeholder: 'e.g., Grade 5',
          helpText: 'Test standard: ISO 105-B02.',
        },
        {
          id: 'dimensional_stability',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Dimensional Stability After Washing Result',
          type: 'text',
          placeholder: 'e.g., -2% length, -1% width',
          helpText: 'Test standard: ISO 6330 with ISO 5077 measurement.',
        },
        {
          id: 'seam_strength',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Seam Strength Result',
          type: 'text',
          placeholder: 'e.g., 220 N',
          helpText: 'Test standard: ISO 13935-2 (grab method).',
        },
        {
          id: 'test_report_reference',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Test Report Reference',
          type: 'text',
          placeholder: 'Laboratory name and report number',
        },
        {
          id: 'test_report_file',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Test Report (upload)',
          type: 'file',
          accept: 'application/pdf',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText: 'Held for your internal records — never published on the public passport.',
        },
      ],
    },
    {
      id: 'circularity',
      title: 'Circularity and End of Life',
      description: 'Care, repair, take-back and recyclability information',
      questions: [
        {
          id: 'washing_temp',
          label: 'Maximum Washing Temperature',
          type: 'select',
          options: [
            { value: 'hand', label: 'Hand wash only' },
            { value: '30', label: '30°C' },
            { value: '40', label: '40°C' },
            { value: '60', label: '60°C' },
            { value: '95', label: '95°C' },
            { value: 'dry_clean', label: 'Dry clean only' }
          ]
        },
        {
          id: 'can_tumble_dry',
          label: 'Can be tumble dried?',
          type: 'checkbox'
        },
        {
          id: 'can_iron',
          label: 'Can be ironed?',
          type: 'checkbox'
        },
        {
          id: 'iron_temp',
          label: 'Maximum Iron Temperature',
          type: 'select',
          showWhen: { field: 'can_iron', equals: true },
          options: [
            { value: 'low', label: 'Low (110°C)' },
            { value: 'medium', label: 'Medium (150°C)' },
            { value: 'high', label: 'High (200°C)' }
          ]
        },
        {
          id: 'care_symbols',
          label: 'Care Symbols',
          type: 'multi_select',
          options: [
            { value: 'wash_30', label: 'Wash 30°C' },
            { value: 'wash_40', label: 'Wash 40°C' },
            { value: 'wash_60', label: 'Wash 60°C' },
            { value: 'hand_wash', label: 'Hand wash' },
            { value: 'do_not_wash', label: 'Do not wash' },
            { value: 'bleach_allowed', label: 'Bleaching allowed' },
            { value: 'non_chlorine_bleach', label: 'Non-chlorine bleach only' },
            { value: 'do_not_bleach', label: 'Do not bleach' },
            { value: 'tumble_dry_low', label: 'Tumble dry low heat' },
            { value: 'tumble_dry_normal', label: 'Tumble dry normal' },
            { value: 'do_not_tumble_dry', label: 'Do not tumble dry' },
            { value: 'iron_low', label: 'Iron low' },
            { value: 'iron_medium', label: 'Iron medium' },
            { value: 'iron_high', label: 'Iron high' },
            { value: 'do_not_iron', label: 'Do not iron' },
            { value: 'dry_clean_any', label: 'Professional dry clean' },
            { value: 'dry_clean_petroleum', label: 'Professional dry clean, petroleum solvent only' },
            { value: 'wet_clean', label: 'Professional wet clean' },
            { value: 'do_not_dry_clean', label: 'Do not dry clean' }
          ]
        },
        {
          id: 'care_instructions_text',
          label: 'Additional Care Instructions',
          type: 'textarea',
          placeholder: 'Any special care instructions'
        },
        {
          id: 'spare_trims_available',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Spare trims available for repair?',
          type: 'checkbox',
          helpText: 'Buttons, zips, cords and other replaceable components.',
        },
        {
          id: 'repair_booking_url',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Repair Booking URL',
          type: 'text',
          placeholder: 'https://…',
        },
        {
          id: 'recyclable',
          label: 'Recyclable at end of life?',
          type: 'checkbox'
        },
        {
          id: 'take_back_program',
          label: 'Take-back program available?',
          type: 'checkbox'
        },
        {
          id: 'take_back_scheme_epr',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Take-back Scheme Name and EPR Registration Numbers per Market',
          type: 'textarea',
          placeholder: 'FR: Refashion — FR123456_01ABCD\nDE: …',
          helpText:
            'Extended Producer Responsibility registration numbers differ per member state, so list one line per market.',
        },
        {
          id: 'recyclability_class',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Recyclability Class',
          type: 'select',
          options: [
            { value: 'mono_material', label: 'Mono-material — fibre-to-fibre recyclable' },
            { value: 'separable_blend', label: 'Blend, separable components' },
            { value: 'mechanical_only', label: 'Mechanical recycling only' },
            { value: 'downcycle_only', label: 'Downcycling only' },
            { value: 'not_recyclable', label: 'Not currently recyclable' }
          ]
        },
        {
          id: 'disassembly_notes',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Disassembly Notes',
          type: 'textarea',
          placeholder:
            'How to separate the outer shell, lining, trims and hardware for recycling',
        },
      ],
    },
    {
      id: 'disposition',
      title: 'Disposition Record',
      description:
        'Supports the ESPR ban on destroying unsold consumer goods, which applies to large companies from 19 July 2026 and requires record-keeping and disclosure',
      questions: [
        {
          id: 'disposition_status',
          label: 'Current Disposition',
          type: 'select',
          options: [
            { value: 'in_stock', label: 'Still in stock' },
            { value: 'sold', label: 'Sold' },
            { value: 'donated', label: 'Donated' },
            { value: 'recycled', label: 'Recycled' },
            { value: 'remanufactured', label: 'Remanufactured' },
            { value: 'destroyed', label: 'Destroyed' }
          ]
        },
        {
          id: 'disposition_reason_code',
          label: 'Destruction Reason Code',
          type: 'select',
          showWhen: { field: 'disposition_status', equals: 'destroyed' },
          options: [
            { value: 'health_safety', label: 'Health and safety' },
            { value: 'counterfeit_ip', label: 'Counterfeit / IP infringement' },
            { value: 'returned_unsellable', label: 'Returned and unsellable' },
            { value: 'damaged_beyond_repair', label: 'Damaged beyond repair' },
            { value: 'other', label: 'Other' }
          ],
          warnWhen: {
            equals: [undefined, '', 'other', 'returned_unsellable'],
            message:
              'Destruction of unsold apparel, footwear and accessories by large companies is restricted from 19 July 2026 under the ESPR and requires record-keeping and public disclosure.',
          },
        },
        {
          id: 'disposition_date',
          label: 'Disposition Date',
          type: 'text',
          placeholder: 'YYYY-MM-DD',
        },
        {
          id: 'disposition_notes',
          label: 'Disposition Notes',
          type: 'textarea',
          placeholder: 'Quantity, handling route and any competent authority reference',
        },
      ],
    },
    {
      id: 'green_claims',
      title: 'Green Claims Substantiation',
      description:
        'Supports the Empowering Consumers Directive (EU) 2024/825, which applies from 27 September 2026',
      questions: [
        {
          id: 'environmental_claims',
          label: 'Environmental Claims Made on Product or Packaging',
          type: 'textarea',
          translatable: true,
          placeholder: 'e.g., "Made with 50% post-consumer recycled polyester (GRS certified)"',
        },
        {
          id: 'claims_evidence_reference',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Substantiation Evidence Reference',
          type: 'textarea',
          placeholder: 'Study, certificate or verification body reference for each claim',
        },
        {
          id: 'claims_evidence_file',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Substantiation Evidence (upload)',
          type: 'file',
          accept: 'application/pdf',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText: 'Held for your internal records — never published on the public passport.',
        },
        {
          id: 'claims_avoid_generic_terms',
          showWhen: { field: 'show_advanced_fields', equals: true },
          label: 'Claims avoid generic environmental terms?',
          type: 'checkbox',
          helpText:
            'Generic claims such as "eco-friendly", "conscious" and "carbon neutral via offsetting" are prohibited from 27 September 2026.',
        },
      ],
    },
    {
      id: 'authentication',
      title: 'Authentication',
      description: 'Anti-counterfeit features linked to this item',
      questions: [
        {
          id: 'authentication_feature_present',
          label: 'Authentication feature present?',
          type: 'checkbox',
          helpText:
            'Apparel is among the most counterfeited product categories in the EU, so item-level authentication materially protects the brand and the buyer.',
        },
        {
          id: 'authentication_method',
          label: 'Authentication Method',
          type: 'select',
          showWhen: { field: 'authentication_feature_present', equals: true },
          options: [
            { value: 'nfc_tag', label: 'NFC tag' },
            { value: 'secure_qr', label: 'Secure / serialised QR code' },
            { value: 'security_seal', label: 'Tamper-evident security seal' },
            { value: 'ai_fingerprint', label: 'AI image fingerprint' },
            { value: 'rfid', label: 'RFID' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'authentication_verification_url',
          label: 'Verification URL',
          type: 'text',
          placeholder: 'https://…',
          showWhen: { field: 'authentication_feature_present', equals: true },
        },
      ],
    },
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];

    const held = Array.isArray(data.certifications_held)
      ? (data.certifications_held as string[])
      : [];
    const hasReference =
      typeof data.certificate_references === 'string' &&
      data.certificate_references.trim().length > 0;

    if (hasReference) {
      if (held.includes('gots')) logos.push('gots');
      if (held.includes('oeko_tex')) logos.push('oeko-tex');
      if (held.includes('grs')) logos.push('grs');
      if (held.includes('bluesign')) logos.push('bluesign');
      if (held.includes('fair_trade')) logos.push('fair-trade');
    }
    if (data.made_in_eu) logos.push('made-in-eu');

    return logos;
  }

  getCompositionWarning(
    data: Record<string, unknown>,
  ): { fieldId: string; message: string } | null {
    const toNumber = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === '')
        return undefined;
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? n : undefined;
    };

    const primary = toNumber(data.primary_fiber_percentage);
    if (primary === undefined) return null;
    const secondary = toNumber(data.secondary_fiber_percentage);
    const sum = primary + (secondary ?? 0);

    if (sum > 100.5) {
      return {
        fieldId: 'secondary_fiber_percentage',
        message: `Primary (${primary}%) and secondary (${secondary}%) fiber percentages sum to ${sum}%, which exceeds 100%. EU Regulation 1007/2011 requires the declared fibre composition to reflect the item's actual make-up — check these figures.`,
      };
    }

    if (secondary === undefined && primary < 95) {
      return {
        fieldId: 'primary_fiber_percentage',
        message: `Primary fiber is declared at ${primary}% with no secondary fiber recorded. If this item is a blend, add the remaining fiber(s) via Secondary Fiber Type/Percentage or the Full Composition Statement so the declared composition accounts for the full 100%.`,
      };
    }

    return null;
  }
}

export const textilesTemplate = new TextilesTemplate();
