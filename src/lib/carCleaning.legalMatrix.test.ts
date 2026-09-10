import { describe, expect, it } from 'vitest';
import { exportCarCleaningPassport, publicCarCleaningData, validateCarCleaning } from './carCleaning';
import { validCleaner as base } from '@/components/car-cleaning/testFixtures';

const cases = ['consumer', 'professional', 'industrial'].flatMap(use =>
  ['none', 'environment', 'health_physical'].flatMap(hazard =>
    ['required', 'on_request', 'not_required'].flatMap(sds =>
      ['yes', 'no'].flatMap(detergent => ['yes', 'no'].flatMap(biocide => ['yes', 'no'].map(eu => ({ use, hazard, sds, detergent, biocide, eu })))))));

describe('Adversarial round 3: legal conditional matrix', () => {
  it.each(cases)('assessed $use / $hazard / SDS $sds / detergent $detergent / biocide $biocide / EU $eu', ({ use, hazard, sds, detergent, biocide, eu }) => {
    const data: Record<string, unknown> = { ...base, use_sector: use, clp_classification: hazard, sds_requirement: sds, detergent_scope: detergent, biocidal_claims: biocide, manufacturer_established_eu: eu };
    if (detergent === 'no') { data.scope_reason = 'Protective coating with no intended cleaning function'; data.product_kind = 'wax_polish'; }
    if (detergent === 'yes' && use !== 'consumer') data.professional_ingredient_info = 'Equivalent ingredient information supplied in the technical sheet.';
    if (hazard !== 'none') Object.assign(data, { hazard_statements: 'Assessed H and EUH statements', precautionary_statements: 'Assessed P statements', signal_word: 'warning', pictograms: 'GHS07' });
    if (hazard === 'health_physical') Object.assign(data, { pcn_applicability: 'required', ufi_code: 'N1QV-R02N-J00M-WQD5', pcn_status: 'submitted' });
    if (sds !== 'not_required') Object.assign(data, { sds_url: 'https://example.test/sds.pdf', sds_languages: 'FR: fr', sds_revision_date: '2026-09-10' });
    if (biocide === 'yes') Object.assign(data, { biocidal_authorisation: 'Supplier authorisation for the listed market', biocidal_actives: 'Assessed active substances and approved use' });
    if (eu === 'no') Object.assign(data, { eu_operator_role: 'importer', eu_operator_name: 'EU importer', eu_operator_address: 'Paris, France', eu_operator_email: 'eu@example.test' });
    expect(validateCarCleaning(data)).toEqual([]);
    const exported = publicCarCleaningData(data);
    expect(exported.pcn_applicability !== undefined).toBe(hazard === 'health_physical');
    expect(exported.ingredients_url !== undefined).toBe(detergent === 'yes' && use === 'consumer');
    expect(exported.sds_url !== undefined).toBe(sds !== 'not_required');
  });
  it.each(['detergent_scope', 'biocidal_claims', 'clp_classification', 'manufacturer_established_eu', 'sds_requirement', 'reach_review'])('rejects unresolved %s', field => {
    expect(validateCarCleaning({ ...base, [field]: 'review' })).toContainEqual({ field, code: 'review' });
  });
  it.each(['2026-02-30', '2025-02-29', 'September 10, 2026', '2026-13-01', '2026-09-31'])('rejects invalid date %s', value => {
    expect(validateCarCleaning({ ...base, data_review_date: value })).toContainEqual({ field: 'data_review_date', code: 'date' });
  });
  it.each([NaN, Infinity, -Infinity, '50', {}, []])('rejects malformed percentage %#', value => {
    expect(validateCarCleaning({ ...base, recycled_content: value })).toContainEqual({ field: 'recycled_content', code: 'type' });
  });
  it.each([0, 100])('preserves percentage boundary %s', value => {
    expect(publicCarCleaningData({ ...base, recycled_content: value }).recycled_content).toBe(value);
  });
});

describe('Adversarial round 5: public data and exports', () => {
  it.each(['javascript:alert(1)', 'data:text/html,<script>1</script>', '//example.test/path', 'file:///etc/passwd', 'https://name:private@example.test', 'https://example.test/\npath'])('rejects unsafe document link %s', url => {
    expect(validateCarCleaning({ ...base, ingredients_url: url })).toContainEqual({ field: 'ingredients_url', code: 'url' });
    expect(publicCarCleaningData({ ...base, ingredients_url: url })).not.toHaveProperty('ingredients_url');
  });
  it('does not export a private dashboard name or owner', () => {
    const result = exportCarCleaningPassport({ name: 'CONFIDENTIAL PROJECT', category_data: base, user_id: 'PRIVATE OWNER' });
    expect(result.name).toBe(base.product_name);
    expect(JSON.stringify(result)).not.toMatch(/CONFIDENTIAL|PRIVATE OWNER/);
  });
  it('handles arbitrary API data and prototype keys without throwing', () => {
    for (const value of [null, undefined, true, 17, 'text', [], ['bad'], { product_name: { toString: null } }, JSON.parse('{"__proto__":{"polluted":true}}')]) expect(() => publicCarCleaningData(value)).not.toThrow();
    expect(Object.prototype).not.toHaveProperty('polluted');
  });
  it('drops subordinate data after upstream assessments change', () => {
    const data = publicCarCleaningData({ ...base, pcn_applicability: 'required', pcn_status: 'submitted', ufi_code: 'N1QV-R02N-J00M-WQD5', sds_url: 'https://example.test/old.pdf', eu_operator_name: 'OLD IMPORTER', biocidal_authorisation: 'OLD AUTHORISATION' });
    for (const key of ['pcn_applicability', 'pcn_status', 'ufi_code', 'sds_url', 'eu_operator_name', 'biocidal_authorisation']) expect(data).not.toHaveProperty(key);
  });
});
