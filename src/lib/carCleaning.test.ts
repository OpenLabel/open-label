import { describe, expect, it } from 'vitest';
import { validateCarCleaning, publicCarCleaningData, exportCarCleaningPassport } from './carCleaning';

export const validCleaner = {
  product_name: 'QA Car shampoo', product_kind: 'shampoo', detergent_scope: 'yes',
  use_sector: 'consumer', biocidal_claims: 'no', clp_classification: 'none',
  sds_requirement: 'not_required', manufacturer_name: 'QA Manufacturer',
  manufacturer_address: '1 Test Street, Paris, France', manufacturer_email: 'qa@example.test',
  manufacturer_phone: '+33100000000', manufacturer_established_eu: 'yes',
  model_identifier: 'QA-MODEL-1', batch_identifier: 'QA-BATCH-1', net_content: '500 ml',
  target_markets: 'FR', use_instructions: 'Dilute as directed. Rinse.',
  storage_disposal: 'Keep closed. Follow local collection instructions.',
  ingredient_classes: 'Less than 5% non-ionic surfactants', fragrance_allergens: 'None requiring declaration',
  preservatives: 'None', ingredients_url: 'https://example.test/ingredients',
  biodegradability_reference: 'Manufacturer assessment QA-01', reach_review: 'reviewed',
  physical_label_reviewed: true,
};

describe('Car cleaning conditional validation and data boundary', () => {
  it('accepts an assessed nonhazardous consumer detergent without UFI, SDS or CE', () => {
    expect(validateCarCleaning(validCleaner)).toEqual([]);
  });
  it('rejects empty and unresolved assessments', () => {
    expect(validateCarCleaning({})).not.toHaveLength(0);
    expect(validateCarCleaning({ ...validCleaner, detergent_scope: 'review' })).toContainEqual({ field: 'detergent_scope', code: 'review' });
    expect(validateCarCleaning({ ...validCleaner, manufacturer_name: '  ' })).toContainEqual({ field: 'manufacturer_name', code: 'required' });
  });
  it('requires poison-centre assessment only for health or physical hazards', () => {
    expect(validateCarCleaning({ ...validCleaner, clp_classification: 'health_physical' }).some(e => e.field === 'pcn_applicability')).toBe(true);
    expect(validateCarCleaning({ ...validCleaner, clp_classification: 'environment' }).some(e => e.field === 'pcn_applicability')).toBe(false);
  });
  it('rejects invalid UFI when Annex VIII applies and allows documented exemptions', () => {
    const hazard = { ...validCleaner, clp_classification: 'health_physical', hazard_statements: 'H315', precautionary_statements: 'P280', signal_word: 'warning', pictograms: 'GHS07' };
    expect(validateCarCleaning({ ...hazard, pcn_applicability: 'required', ufi_code: 'bad', pcn_status: 'submitted' })).toContainEqual({ field: 'ufi_code', code: 'ufi' });
    expect(validateCarCleaning({ ...hazard, pcn_applicability: 'exempt', pcn_exemption_reason: 'Mixture only for scientific research and development under Annex VIII.' }).some(e => /ufi|pcn/.test(e.field))).toBe(false);
  });
  it('requires applicable SDS access and biocidal authorisation evidence', () => {
    expect(validateCarCleaning({ ...validCleaner, sds_requirement: 'required' }).some(e => e.field === 'sds_url')).toBe(true);
    expect(validateCarCleaning({ ...validCleaner, biocidal_claims: 'yes' }).some(e => e.field === 'biocidal_authorisation')).toBe(true);
  });
  it('does not impose detergent ingredient fields on assessed wax or lubricant', () => {
    const wax = { ...validCleaner, detergent_scope: 'no', product_kind: 'wax_polish', ingredient_classes: '', ingredients_url: '', fragrance_allergens: '', preservatives: '', biodegradability_reference: '', scope_reason: 'Protection and polishing only; no cleaning function.' };
    expect(validateCarCleaning(wax)).toEqual([]);
  });
  it('requires one applicable EU operator for a non-EU manufacturer', () => {
    const data = { ...validCleaner, manufacturer_established_eu: 'no' };
    expect(validateCarCleaning(data).some(e => e.field === 'eu_operator_role')).toBe(true);
    expect(validateCarCleaning({ ...data, eu_operator_role: 'importer', eu_operator_name: 'EU importer', eu_operator_address: 'Paris, France', eu_operator_email: 'importer@example.test' })).toEqual([]);
  });
  it('rejects dangerous URLs, malformed types and numeric overflow', () => {
    expect(validateCarCleaning({ ...validCleaner, ingredients_url: 'javascript:alert(1)' })).toContainEqual({ field: 'ingredients_url', code: 'url' });
    expect(validateCarCleaning({ ...validCleaner, manufacturer_name: { bad: true } })).toContainEqual({ field: 'manufacturer_name', code: 'type' });
    expect(validateCarCleaning({ ...validCleaner, recycled_content: 101 })).toContainEqual({ field: 'recycled_content', code: 'range' });
  });
  it('drops unknown, hidden and malformed public values, preserving safe translations', () => {
    const data = publicCarCleaningData({ ...validCleaner, confidential_formula: 'SECRET', __ai_autofill: { pcn_status: 'submitted' }, ufi_code: 'STALE', product_name_translations: { fr: 'Shampooing', zz: 'invalid', en: { bad: true } } });
    expect(data).not.toHaveProperty('confidential_formula');
    expect(data).not.toHaveProperty('__ai_autofill');
    expect(data).not.toHaveProperty('ufi_code');
    expect(data.product_name_translations).toEqual({ fr: 'Shampooing' });
  });
  it('exports only public data with schema version and explicit readiness limits', () => {
    const result = exportCarCleaningPassport({ name: 'QA', category_data: { ...validCleaner, secret: 'PRIVATE' }, public_slug: 'abcdef0123456789', user_id: 'PRIVATE-USER' });
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
    expect(result).toMatchObject({ schema_version: 'open-label.car-cleaning.v1', category: 'car_cleaning' });
    expect(JSON.stringify(result)).toContain('2029-09-23');
    expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  });
});
