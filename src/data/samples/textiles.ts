/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData } from '@/types/passport';

/**
 * Fictitious Apparel (textiles) demo passport. Fills every required question
 * of the Apparel template plus a representative set of optional ones.
 * `show_advanced_fields` is deliberately not set.
 */
export function buildSampleTextilesPassport(): PassportFormData {
  return {
    name: 'Sample Cotton T-Shirt',
    category: 'textiles',
    image_url: null,
    description:
      '<p>A short-sleeve jersey T-shirt demonstration passport. All data shown here is fictitious and intended for preview only.</p>',
    language: 'en',
    category_data: {
      // Identity
      gtin: '01234567890128',
      item_unique_identifier: 'DPP-2026-000184213',
      style_reference: 'ST-4412',
      size: 'M',
      brand_name: 'Example Apparel',
      product_type: 'T-shirt',

      // Who is responsible
      manufacturer_legal_name: 'Example Apparel SA',
      manufacturer_street: '12 Rua do Exemplo',
      manufacturer_postal_code: '4000-001',
      manufacturer_city: 'Porto',
      manufacturer_country: 'Portugal',
      manufacturer_email: 'contact@example-apparel.example',
      manufacturer_non_eu: 'no',
      eu_operator_name: 'Example Apparel SA',
      eu_operator_address: '12 Rua do Exemplo, 4000-001 Porto, Portugal',
      eu_operator_email: 'eu.responsible@example-apparel.example',

      // Materials and composition
      primary_fiber: 'cotton',
      primary_fiber_percentage: 80,
      secondary_fiber: 'Recycled polyester',
      secondary_fiber_percentage: 20,
      full_composition: '80% cotton, 20% recycled polyester',
      contains_animal_parts: false,
      recycled_content_percentage: 20,
      microplastic_shedding: false,
      svhc_declared: false,
      pfas_present: 'no',

      // Certifications
      certifications_held: ['gots'],
      certificate_references: 'GOTS — certificate CU 123456 GOTS (scope certificate, issued 2026)',

      // Supply chain
      country_spinning_weaving: 'Portugal',
      country_dyeing_finishing: 'Portugal',
      country_of_origin: 'Portugal',
      made_in_eu: true,

      // Circularity and end of life
      washing_temp: '30',
      can_tumble_dry: false,
      can_iron: true,
      iron_temp: 'medium',
      care_symbols: ['wash_30', 'do_not_bleach', 'do_not_tumble_dry', 'iron_medium', 'do_not_dry_clean'],
      care_instructions_text:
        'Machine wash at 30°C with similar colours. Do not bleach. Dry flat. Iron at medium temperature.',
      recyclable: true,
      take_back_program: true,
      take_back_scheme_epr: 'France — EPR textile scheme, Refashion, producer identifier FR123456_01ABCD.',

      // Disposition
      disposition_status: 'in_stock',

      // Green claims
      environmental_claims:
        'Made with 20% recycled polyester from post-consumer bottles. Claim substantiated by supplier transaction certificates.',

      // Authentication
      authentication_feature_present: false,
    },
  };
}
