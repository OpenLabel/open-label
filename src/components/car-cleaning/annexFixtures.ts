import { validCleaner } from './testFixtures';
export const annexCleaner = {
  ...validCleaner, dpp_profile: 'annex_vi',
  label_image_url: 'https://example.test/pack-label.png', persistent_product_id: 'https://example.test/id/QA1',
  model_content_reference: 'QA-CONTENT-1', manufacturing_process_reference: 'QA-PROCESS-1',
  identifier_scheme: 'Supplier URI, pending standards review', manufacturer_operator_id: 'QA-OP-1',
  backup_provider_url: 'https://example.test/contracted-provider', backup_reference: 'QA backup contract 1',
  commodity_code_status: 'applicable', commodity_code: '34025090',
  manufacturer_responsibility: true, compliance_statement: 'Manufacturer statement supported by assessment QA-1',
  conformity_reference: 'QA-1 internal production control assessment', applicable_union_law: '2026/405; 1272/2008; 1907/2006',
  authorised_representative_applicable: 'no', future_label_ingredients: 'Less than 5% non-ionic surfactants; no other declarable constituents', future_label_preservatives: 'No preservatives requiring declaration', future_label_allergens: 'No Annex V Part D fragrance allergens above the applicable threshold',
  importer_applicable: 'no', substance_list_route: 'full_list', substance_list_complete: true,
  substances: [{ chemical_name: 'Water', identifier_type: 'cas', identifier: '7732-18-5', addition: 'intentional' }],
  microorganisms_added: 'no', future_ufi_code: '0000-0000-0000-0000',
  last_placed_on_market_date: '2029-09-23', data_review_date: '2029-09-23',
  carrier_placement: 'Packaging label, visible before purchase', carrier_reviewed: true,
  market_language_reviewed: true,
};
