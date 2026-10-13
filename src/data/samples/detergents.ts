/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData } from '@/types/passport';

/**
 * Fictitious Detergents demo passport on the current information profile. It
 * fills every required question of the Detergents template plus a
 * representative set of optional ones. It makes no certification claim.
 */
export function buildSampleDetergentsPassport(): PassportFormData {
  return {
    name: 'Sample Laundry Liquid',
    category: 'detergents',
    image_url: null,
    description:
      '<p>A demonstration passport for a fictitious laundry detergent. All data shown here is fictitious and for preview only. It is not a certification, an approval or a complete regulatory passport.</p>',
    language: 'en',
    category_data: {
      // Identity
      product_name: 'Sample Laundry Liquid',
      brand_name: 'Example Clean',
      product_type: 'laundry',
      product_form: 'liquid',
      detergent_scope: 'yes',
      use_sector: 'consumer',
      model_identifier: 'EC-LL-1500',
      batch_identifier: 'LOT-2026-10-A',
      gtin: '3401234567890',
      net_content: '1.5 L',
      target_markets: 'France (French), Germany (German)',
      dpp_profile: 'current',
      biocidal_claims: 'no',

      // Who is responsible
      manufacturer_legal_name: 'Example Clean SAS',
      manufacturer_street: '12 Rue de l’Exemple',
      manufacturer_postal_code: '75001',
      manufacturer_city: 'Paris',
      manufacturer_country: 'France',
      manufacturer_email: 'contact@example-clean.example',
      manufacturer_phone: '+33 1 00 00 00 00',
      manufacturer_non_eu: 'no',

      // Hazard classification and safety information
      clp_classification: 'health_physical',
      signal_word: 'warning',
      pictograms: ['ghs07'],
      hazard_statements: 'H319 Causes serious eye irritation. (Fictitious sample wording.)',
      precautionary_statements:
        'P264 Wash hands thoroughly after handling. P280 Wear eye protection. (Fictitious sample wording.)',
      pcn_applicability: 'required',
      ufi_code: 'N1QV-R02N-J00M-WQD5',
      pcn_status: 'submitted',
      sds_requirement: 'on_request',
      sds_url: 'https://example-clean.example/sds',
      sds_languages: 'English, French, German',
      sds_revision_date: '2026-09-01',
      emergency_contact: 'Poison centre +33 1 00 00 00 01',

      // Ingredients and label information
      constituent_classes: ['anionic_surfactants', 'nonionic_surfactants', 'soap'],
      band_anionic_surfactants: '5to15',
      band_nonionic_surfactants: 'lt5',
      band_soap: 'lt5',
      listed_constituents: ['enzymes', 'perfumes'],
      preservatives_present: 'yes',
      preservatives: 'Phenoxyethanol, Benzisothiazolinone',
      allergens_above_threshold: 'no',
      ingredients_url: 'https://example-clean.example/ingredients',
      biodegradability_test: 'OECD 301 series',
      biodegradability_reference: 'Supplier test report 2026-14 (fictitious reference).',
      synthetic_polymer_microparticles: 'no',

      // Safe use and dosage
      use_instructions:
        'Dose according to the water hardness and the soiling of the laundry. Add to the drum or the dispenser drawer before starting the wash.',
      laundry_type: 'heavy_duty',
      dosage_unit: 'ml',
      dosage_soft: 60,
      dosage_medium: 75,
      dosage_hard: 90,
      loads_per_pack: 20,
      measuring_cup_ml: 75,
      phosphorus_per_dose_g: 0,
      storage_disposal:
        'Store closed and protected from frost. Empty containers can go to plastic recycling.',

      // Packaging and recycling
      packaging_material: 'hdpe',
      packaging_recyclable: true,
      recycled_packaging_content: 30,

      // Environmental claims
      environmental_claims: 'Bottle made with 30% recycled plastic.',
      claims_evidence_reference: 'Supplier transaction certificate 2026-07 (fictitious reference).',

      // Supplier review
      reach_review: 'reviewed',
      physical_label_reviewed: true,
      data_review_date: '2026-10-01',
    },
  };
}
