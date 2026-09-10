import { describe, expect, it } from 'vitest';
import { validateCarCleaning, publicCarCleaningData, exportCarCleaningPassport } from './carCleaning';
import { validCleaner } from '@/components/car-cleaning/testFixtures';

import { annexCleaner } from '@/components/car-cleaning/annexFixtures';

describe('Annex VI: full conditional dataset, distinct from current information', () => {
  for (const use_sector of ['consumer', 'professional', 'industrial']) for (const manufacturer_established_eu of ['yes', 'no']) for (const importer_applicable of ['yes', 'no']) for (const substance_list_route of ['full_list', 'equivalent_sds', 'no_added_substances']) for (const microorganisms_added of ['yes', 'no']) {
    it(`future conditional matrix ${use_sector}/${manufacturer_established_eu}/${importer_applicable}/${substance_list_route}/${microorganisms_added}`, () => {
      const data = { ...annexCleaner, use_sector, manufacturer_established_eu, importer_applicable, substance_list_route, microorganisms_added,
        professional_ingredient_info: 'Equivalent professional information supplied',
        eu_operator_role: 'authorised_representative', eu_operator_name: 'EU AR', eu_operator_address: 'Paris', eu_operator_email: 'ar@example.test',
        authorised_representative_name: 'EU AR', authorised_representative_address: 'Paris', authorised_representative_email: 'ar@example.test', authorised_representative_phone: '+33100000000', authorised_representative_mandate: 'QA mandate',
        importer_name: 'EU importer', importer_address: 'Paris', importer_email: 'importer@example.test', importer_phone: '+33100000000',
        industrial_institutional_use: true, annex_sds_url: 'https://example.test/sds', annex_sds_languages: 'fr', annex_sds_revision_date: '2029-09-23', equivalent_sds_supplied: true,
        no_substances_reason: 'Supplier confirms no substance requiring listing', microorganisms: [{ genus: 'Bacillus', species: 'subtilis', strain: 'QA-1' }], microorganism_safety_reference: 'QA Annex II', microorganism_shelf_life: '12 months', food_contact_use: 'no',
      };
      const issues = validateCarCleaning(data);
      expect(issues).toEqual(use_sector === 'consumer' && substance_list_route === 'equivalent_sds' ? [{ field: 'substance_list_route', code: 'condition' }] : []);
      const publicData = publicCarCleaningData(data);
      expect('microorganisms' in publicData).toBe(microorganisms_added === 'yes');
      expect('authorised_representative_name' in publicData).toBe(manufacturer_established_eu === 'no');
      expect('importer_name' in publicData).toBe(importer_applicable === 'yes');
      expect('substances' in publicData).toBe(substance_list_route === 'full_list');
    });
  }
  it('requires the future Annex VI fields only in the explicitly selected detergent profile', () => {
    expect(validateCarCleaning(validCleaner)).toEqual([]);
    const issues = validateCarCleaning({ ...validCleaner, dpp_profile: 'annex_vi' });
    for (const field of ['label_image_url', 'persistent_product_id', 'manufacturer_operator_id', 'backup_provider_url', 'manufacturer_responsibility', 'compliance_statement', 'substance_list_route', 'microorganisms_added', 'future_ufi_code']) {
      expect(issues.some(issue => issue.field === field), field).toBe(true);
    }
    expect(validateCarCleaning(annexCleaner)).toEqual([]);
  });
  it('keeps wax without cleaning function outside the detergent Annex VI profile', () => {
    const wax = { ...annexCleaner, detergent_scope: 'no', scope_reason: 'Protective wax without cleaning', product_kind: 'wax_polish', substances: 'invalid' };
    expect(validateCarCleaning(wax)).toEqual([]);
    expect(publicCarCleaningData(wax)).not.toHaveProperty('substances');
  });
  it('permits the supplied model traceability without imposing an additional batch number universally', () => {
    expect(validateCarCleaning({ ...annexCleaner, batch_identifier: undefined })).toEqual([]);
  });
  it.each(['manufacturer_responsibility', 'substance_list_complete', 'carrier_reviewed', 'market_language_reviewed'])('requires the supplier confirmation %s', field => {
    expect(validateCarCleaning({ ...annexCleaner, [field]: false })).toContainEqual({ field, code: 'confirmation' });
  });
  it('requires full structured substance identities and carryover label basis without public quantities', () => {
    expect(validateCarCleaning({ ...annexCleaner, substances: [] })).toContainEqual({ field: 'substances', code: 'required' });
    expect(validateCarCleaning({ ...annexCleaner, substances: [{ chemical_name: 'Preservative', addition: 'carryover_preservative' }] })).toContainEqual({ field: 'substances', code: 'rows' });
    const data = { ...annexCleaner, substances: [{ chemical_name: 'Water', addition: 'intentional', concentration: 99, private_evidence: 'SECRET' }, { chemical_name: 'Preservative', addition: 'carryover_preservative', label_basis: 'clp_18_3_b' }] };
    expect(validateCarCleaning(data)).toEqual([]);
    expect(publicCarCleaningData(data).substances).toEqual([{ chemical_name: 'Water', addition: 'intentional' }, { chemical_name: 'Preservative', addition: 'carryover_preservative', label_basis: 'clp_18_3_b' }]);
    expect(JSON.stringify(exportCarCleaningPassport({ name: 'INTERNAL', category_data: data }))).not.toMatch(/SECRET|concentration|private_evidence/);
  });
  it.each([null, 'not a dataset', [{ chemical_name: '', addition: 'intentional' }], [{ chemical_name: 'Water', addition: 'invented' }], [{ chemical_name: 'Water', addition: 'intentional', identifier_type: 'cas', identifier: 'invalid' }]])('rejects malformed substance dataset %j', substances => {
    expect(validateCarCleaning({ ...annexCleaner, substances }).some(issue => issue.field === 'substances')).toBe(true);
  });
  it('does not discard bad rows and misrepresent a partial dataset as the complete list', () => {
    const data = { ...annexCleaner, substances: [...annexCleaner.substances, { chemical_name: '', addition: 'intentional' }] };
    expect(publicCarCleaningData(data)).not.toHaveProperty('substances');
  });
  it('limits the SDS exemption to supplied equivalent information for industrial or institutional detergents', () => {
    const exempt = { ...annexCleaner, use_sector: 'professional', professional_ingredient_info: 'Supplied technical sheet', substance_list_route: 'equivalent_sds', industrial_institutional_use: true, annex_sds_url: 'https://example.test/sds', annex_sds_languages: 'fr', annex_sds_revision_date: '2029-09-23', equivalent_sds_supplied: true };
    expect(validateCarCleaning(exempt)).toEqual([]);
    expect(publicCarCleaningData(exempt)).not.toHaveProperty('substances');
    expect(validateCarCleaning({ ...exempt, use_sector: 'consumer' })).toContainEqual({ field: 'substance_list_route', code: 'condition' });
    expect(validateCarCleaning({ ...exempt, industrial_institutional_use: false })).toContainEqual({ field: 'industrial_institutional_use', code: 'confirmation' });
  });
  it('never exempts microorganisms using the substance SDS exception', () => {
    const data = { ...annexCleaner, microorganisms_added: 'yes' };
    expect(validateCarCleaning(data)).toContainEqual({ field: 'microorganisms', code: 'required' });
    expect(validateCarCleaning({ ...data, microorganisms: [{ genus: 'Bacillus', species: 'subtilis' }] })).toContainEqual({ field: 'microorganisms', code: 'rows' });
    const complete = { ...data, microorganisms: [{ genus: 'Bacillus', species: 'subtilis', strain: 'QA-01' }], microorganism_safety_reference: 'Annex II assessment QA', microorganism_shelf_life: '12 months in specified storage', food_contact_use: 'no' };
    expect(validateCarCleaning(complete)).toEqual([]);
    expect(publicCarCleaningData({ ...complete, microorganisms_added: 'no' })).not.toHaveProperty('microorganisms');
  });
  it('requires the future non-EU authorised representative separately from an applicable importer', () => {
    const data = { ...annexCleaner, manufacturer_established_eu: 'no', eu_operator_role: 'importer', eu_operator_name: 'EU importer', eu_operator_address: 'Paris', eu_operator_email: 'qa@example.test' };
    expect(validateCarCleaning(data)).toContainEqual({ field: 'authorised_representative_name', code: 'required' });
    expect(validateCarCleaning({ ...annexCleaner, importer_applicable: 'yes' })).toContainEqual({ field: 'importer_phone', code: 'required' });
  });
  it('collects an appointed representative for an EU manufacturer without requiring one universally', () => {
    expect(validateCarCleaning({ ...annexCleaner, authorised_representative_applicable: 'yes' })).toContainEqual({ field: 'authorised_representative_phone', code: 'required' });
    expect(validateCarCleaning({ ...annexCleaner, authorised_representative_applicable: 'no' }).some(issue => issue.field === 'authorised_representative_phone')).toBe(false);
  });
  it('requires explicit assessment if no customs code applies', () => {
    expect(validateCarCleaning({ ...annexCleaner, commodity_code_status: 'not_applicable', commodity_code: '' })).toContainEqual({ field: 'commodity_code_reason', code: 'required' });
  });
  it('keeps the future UFI branch independent of current CLP notification applicability', () => {
    const issues = validateCarCleaning({ ...annexCleaner, future_ufi_code: 'bad' });
    expect(issues).toContainEqual({ field: 'future_ufi_code', code: 'ufi' });
    expect(issues.some(issue => issue.field === 'pcn_applicability')).toBe(false);
  });
  it('rejects oversized and duplicate structured rows', () => {
    expect(validateCarCleaning({ ...annexCleaner, substances: Array(501).fill(annexCleaner.substances[0]) })).toContainEqual({ field: 'substances', code: 'rows' });
    expect(validateCarCleaning({ ...annexCleaner, substances: [...annexCleaner.substances, ...annexCleaner.substances] })).toContainEqual({ field: 'substances', code: 'rows' });
  });
  it('exports server history metadata without raw snapshots, owner IDs or invented verification', () => {
    const result = exportCarCleaningPassport({ name: 'INTERNAL', category_data: annexCleaner, public_slug: 'aabbccdd', dpp_history: {
      product_identifier: 'urn:uuid:00000000-0000-4000-8000-000000000001', latest_version: 2, selected_version: 1,
      retained_until: '2039-09-23T00:00:00Z', withdrawn: false, user_id: 'SECRET',
      versions: [{ version: 1, recorded_at: '2029-09-23T00:00:00Z', snapshot: { confidential: 'SECRET' } }],
    } });
    expect(result).toHaveProperty('dpp_history.identifier_status', 'internal_unverified');
    expect(result).toHaveProperty('dpp_history.selected_version', 1);
    expect(result).toHaveProperty('regulatory_context.annex_vi_field_validation_passed', true);
    expect(JSON.stringify(result)).not.toContain('SECRET');
  });
  it('serializes safely when an untrusted caller supplies malformed top-level metadata', () => {
    const cycle: Record<string, unknown> = {}; cycle.self = cycle;
    const result = exportCarCleaningPassport({ name: 'INTERNAL', category_data: annexCleaner, public_slug: cycle, updated_at: cycle } as unknown as Parameters<typeof exportCarCleaningPassport>[0]);
    expect(result.public_slug).toBeNull();
    expect(result.updated_at).toBeNull();
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});
