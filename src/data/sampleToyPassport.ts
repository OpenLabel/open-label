/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData } from '@/types/passport';

/**
 * Fake but realistic data for a sample Toy DPP. Used by the dashboard
 * "Create sample toy" button so users can preview the toy passport
 * immediately without filling out the long form.
 */
export function buildSampleToyPassport(): PassportFormData {
  return {
    name: 'Sample Plush Bear',
    category: 'toys',
    image_url: null,
    description:
      '<p>A soft plush bear demonstration passport. All data shown here is fictitious and intended for preview only.</p>',
    language: 'en',
    category_data: {
      // Manufacturer responsibility
      manufacturer_responsibility_confirmed: true,

      // Product identity
      brand_name: 'Acme Toys',
      model_name: 'Bear-2026',
      sku: 'ACM-BEAR-001',
      toy_category: 'plush',
      age_group: '3plus',
      mouth_contact: 'no',
      unique_product_identifier: '01234567890128',
      identifier_type: 'GTIN',
      has_instructions_warnings: 'yes',
      public_instructions_warnings:
        'Not suitable for children under 36 months. Small parts may be a choking hazard. Keep away from fire. Wash at 30°C maximum.',

      // Manufacturer
      manufacturer_legal_name: 'Acme Toys SARL',
      manufacturer_street: '10 Rue de la Paix',
      manufacturer_city: 'Paris',
      manufacturer_postal_code: '75002',
      manufacturer_country: 'France',
      manufacturer_email: 'contact@acme-toys.example',
      manufacturer_website: 'https://acme-toys.example',
      manufacturer_operator_id: 'FR12345678900012',
      manufacturer_operator_id_type: 'VAT',

      // Auth rep / EU op
      has_auth_rep: 'no',
      manufacturer_non_eu: 'no',

      // Compliance
      ce_declaration_ack: true,
      eu_doc_available: 'yes',
      eu_doc_reference: 'DoC-ACM-BEAR-2026-001',
      safety_assessment_completed: 'yes',
      technical_documentation_available: 'yes',
      applicable_legislation: ['TSR', 'GPSR'],
      harmonised_standards: ['EN71_1', 'EN71_2', 'EN71_3'],

      // Notified body
      notified_body_involved: 'no',

      // Customs
      cn_chapter: '95',
      customs_code: '98809500',

      // Allergenic fragrances
      has_allergenic_fragrances: 'no',

      // Safety reporting
      safety_channels: ['email', 'website'],
      safety_email: 'safety@acme-toys.example',
      safety_website: 'https://acme-toys.example/safety',
    },
  };
}
