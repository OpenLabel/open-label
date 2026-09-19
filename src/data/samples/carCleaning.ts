/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData } from '@/types/passport';

/**
 * Fictitious current-profile cleaner for the public demo. Assessment choices
 * demonstrate a complete form; they are not assessments of a real product.
 */
export function buildSampleCarCleaningPassport(): PassportFormData {
  return {
    name: 'Sample Car Shampoo',
    category: 'car_cleaning',
    image_url: null,
    description:
      '<p>A car shampoo demonstration passport. All product and supplier details are fictitious and intended for preview only. The assessment choices and review confirmations are illustrative. This is not a certification, a supplier assessment, or safety advice for a real product.</p>',
    language: 'en',
    category_data: {
      product_name: 'Sample Car Shampoo',
      product_kind: 'shampoo',
      detergent_scope: 'yes',
      dpp_profile: 'current',
      use_sector: 'consumer',
      biocidal_claims: 'no',
      clp_classification: 'none',
      sds_requirement: 'not_required',

      model_identifier: 'DEMO-CAR-SHAMPOO-001',
      batch_identifier: 'DEMO-BATCH-001',
      net_content: '500 ml',
      target_markets: 'France; French (fictitious demo market)',

      manufacturer_name: 'Example Cleaner (fictitious supplier)',
      manufacturer_address: '1 Example Lane, Example City, France (fictitious address)',
      manufacturer_email: 'contact@example-cleaner.example',
      manufacturer_phone: '+33 1 00 00 00 00 (fictitious demo contact)',
      manufacturer_established_eu: 'yes',

      use_instructions:
        'Fictitious example only: follow the real product label for dilution and rinsing. Do not use this demo as safety advice.',
      storage_disposal:
        'Fictitious example only: follow the real product label and applicable local disposal instructions.',
      ingredient_classes: 'Less than 5% non-ionic surfactants (fictitious example)',
      fragrance_allergens: 'None requiring declaration in this fictitious example',
      preservatives: 'None in this fictitious example',
      ingredients_url: 'https://example-cleaner.example/ingredients',
      biodegradability_reference:
        'Fictitious reference DEMO-BIO-001; no supplier evidence is provided.',
      reach_review: 'reviewed',
      physical_label_reviewed: true,
    },
  };
}
