import { describe, it, expect } from 'vitest';
import {
  DetergentsTemplate,
  detergentsTemplate,
  DETERGENT_CONSTITUENT_CLASSES,
  DETERGENTS_WARNING_MESSAGES,
  DETERGENTS_FORM_COPY,
} from './detergents';
import { evaluateShowWhen, type ShowWhenCondition } from './base';

const sections = detergentsTemplate.sections;
const questions = sections.flatMap((s) => s.questions);
const find = (id: string) => questions.find((q) => q.id === id);

function referencedFields(c: ShowWhenCondition | undefined): string[] {
  if (!c) return [];
  return [c.field, ...(c.and ?? []).flatMap(referencedFields), ...(c.or ?? []).flatMap(referencedFields)];
}

describe('DetergentsTemplate', () => {
  it('has correct properties', () => {
    expect(detergentsTemplate.id).toBe('detergents');
    expect(detergentsTemplate.name).toBe('Detergents');
    expect(detergentsTemplate.icon).toBe('🧴');
  });

  it('is an instance of DetergentsTemplate', () => {
    expect(detergentsTemplate).toBeInstanceOf(DetergentsTemplate);
  });

  it('has the 12 sections in reading order', () => {
    expect(sections.map((s) => s.id)).toEqual([
      'identity',
      'responsible_operators',
      'classification',
      'ingredients',
      'use',
      'packaging',
      'biocide',
      'green_claims',
      'review',
      'annex_identity',
      'annex_substances',
      'annex_microorganisms',
    ]);
  });

  it('starts Product identity with the required translatable Product Name using shared keys', () => {
    expect(sections[0].questions[0]).toMatchObject({
      id: 'product_name',
      type: 'text',
      translatable: true,
      required: true,
      badge: 'required',
      labelKey: 'passport.productName',
      placeholderKey: 'passport.productNamePlaceholder',
      helpKey: 'passport.productNameHelp',
    });
  });

  it('has no duplicate question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  it('only uses valid question types', () => {
    const valid = ['text', 'textarea', 'select', 'checkbox', 'number', 'multi_select', 'substances', 'microorganisms'];
    for (const q of questions) expect(valid, q.id).toContain(q.type);
  });

  it('has no file upload and no internal field, so nothing needs private storage', () => {
    for (const q of questions) {
      expect(q.type, q.id).not.toBe('file');
      expect(q.internal, q.id).toBeFalsy();
    }
  });

  it('select and multi-select questions have options, except the allergen picker', () => {
    for (const q of questions) {
      if (q.type !== 'select' && q.type !== 'multi_select') continue;
      if (q.id === 'fragrance_allergens') {
        expect(q.options).toEqual([]);
        continue;
      }
      expect(q.options?.length, q.id).toBeGreaterThan(0);
      const values = q.options!.map((o) => o.value);
      expect(new Set(values).size, `${q.id} option values`).toBe(values.length);
    }
  });

  describe('is fully key-driven', () => {
    it('every section has a titleKey and, with a description, a descriptionKey', () => {
      for (const s of sections) {
        expect(s.titleKey, s.id).toBe(`detergents.sections.${s.id}.title`);
        if (s.description) expect(s.descriptionKey, s.id).toBe(`detergents.sections.${s.id}.description`);
      }
    });

    it('every question has a labelKey, and helpKey or placeholderKey when it has that text', () => {
      for (const q of questions) {
        expect(q.labelKey, q.id).toBeTruthy();
        if (q.helpText) expect(q.helpKey, q.id).toBeTruthy();
        if (q.placeholder) expect(q.placeholderKey, q.id).toBeTruthy();
        if (q.id !== 'product_name') {
          expect(q.labelKey, q.id).toBe(`detergents.fields.${q.id}.label`);
        }
      }
    });

    it('every option has a labelKey in the detergents namespace', () => {
      for (const q of questions) {
        for (const o of q.options ?? []) {
          expect(o.labelKey, `${q.id}.${o.value}`).toMatch(/^detergents\.options\.[A-Za-z]+\.[A-Za-z0-9_]+$/);
        }
      }
    });

    it('every warnWhen has a messageKey that exists', () => {
      for (const q of questions.filter((x) => x.warnWhen)) {
        const key = q.warnWhen!.messageKey!;
        expect(key, q.id).toMatch(/^detergents\.warnings\./);
        const name = key.replace('detergents.warnings.', '') as keyof typeof DETERGENTS_WARNING_MESSAGES;
        expect(DETERGENTS_WARNING_MESSAGES[name], q.id).toBe(q.warnWhen!.message);
      }
    });
  });

  describe('conditional fields', () => {
    const ids = new Set(questions.map((q) => q.id));

    it('every showWhen refers to a question that exists', () => {
      for (const s of sections) {
        for (const f of referencedFields(s.showWhen)) expect(ids.has(f), `${s.id} -> ${f}`).toBe(true);
      }
      for (const q of questions) {
        for (const f of referencedFields(q.showWhen)) expect(ids.has(f), `${q.id} -> ${f}`).toBe(true);
      }
    });

    it('a field never depends on itself', () => {
      for (const q of questions) expect(referencedFields(q.showWhen), q.id).not.toContain(q.id);
    });

    it('shows importer and authorised representative only for a non-EU manufacturer, and requires them then', () => {
      const ids = [
        'importer_legal_name', 'importer_street', 'importer_postal_code', 'importer_city',
        'importer_country', 'importer_email', 'importer_phone', 'eu_operator_name', 'eu_operator_address',
        'eu_operator_email', 'eu_operator_phone', 'eu_operator_mandate_reference',
      ];
      for (const id of ids) {
        const q = find(id)!;
        expect(q.showWhen, id).toEqual({ field: 'manufacturer_non_eu', equals: 'yes' });
        expect(q.required, id).toBe(true);
        expect(q.badge, id).toBe('required');
      }
      expect(find('manufacturer_non_eu')?.required).toBe(true);
      expect(find('manufacturer_phone')?.required).toBe(true);
      expect(find('manufacturer_email')?.required).toBe(true);
    });

    it('reuses the operator ids that prefill from an earlier passport', () => {
      for (const id of [
        'brand_name', 'manufacturer_legal_name', 'manufacturer_street', 'manufacturer_postal_code',
        'manufacturer_city', 'manufacturer_country', 'manufacturer_email', 'manufacturer_non_eu',
        'importer_legal_name', 'eu_operator_name', 'eu_operator_address', 'eu_operator_email',
      ]) {
        expect(find(id), id).toBeDefined();
      }
    });

    it('asks for a weight range only for each ticked constituent class', () => {
      expect(DETERGENT_CONSTITUENT_CLASSES).toHaveLength(18);
      const classes = find('constituent_classes')!;
      expect(classes.options!.map((o) => o.value)).toEqual(DETERGENT_CONSTITUENT_CLASSES.map((c) => c.value));
      for (const c of DETERGENT_CONSTITUENT_CLASSES) {
        const band = find(`band_${c.value}`)!;
        expect(band.showWhen).toEqual({ field: 'constituent_classes', equals: c.value, includes: true });
        expect(band.options!.map((o) => o.value)).toEqual(['lt5', '5to15', '15to30', 'gte30']);
        expect(band.required).toBe(true);
      }
    });

    it('lists the classes that are named at any concentration', () => {
      expect(find('listed_constituents')!.options!.map((o) => o.value)).toEqual([
        'enzymes', 'micro_organisms', 'optical_brighteners', 'perfumes', 'disinfectants',
      ]);
    });

    it('gates dosage fields by product type', () => {
      for (const id of ['laundry_type', 'dosage_soft', 'dosage_medium', 'dosage_hard', 'dosage_two_cycle_note', 'loads_per_pack', 'measuring_cup_ml']) {
        expect(find(id)!.showWhen, id).toEqual({ field: 'product_type', equals: 'laundry' });
      }
      for (const id of ['dishwasher_dose', 'dishwasher_dose_hardness_note']) {
        expect(find(id)!.showWhen, id).toEqual({ field: 'product_type', equals: 'machine_dishwashing' });
      }
      expect(find('dosage_unit')!.showWhen).toEqual({ field: 'product_type', equals: ['laundry', 'machine_dishwashing'] });
      expect(find('phosphorus_per_dose_g')!.showWhen).toEqual({ field: 'product_type', equals: ['laundry', 'machine_dishwashing'] });
      expect(evaluateShowWhen(find('surface_dilution')!.showWhen, { product_type: 'glass' })).toBe(true);
      expect(evaluateShowWhen(find('surface_dilution')!.showWhen, { product_type: 'laundry' })).toBe(false);
    });

    it('asks for the public ingredients page only for consumer products', () => {
      expect(evaluateShowWhen(find('ingredients_url')!.showWhen, { use_sector: 'consumer' })).toBe(true);
      expect(evaluateShowWhen(find('ingredients_url')!.showWhen, { use_sector: 'professional' })).toBe(false);
      expect(evaluateShowWhen(find('professional_ingredient_info')!.showWhen, { use_sector: 'industrial' })).toBe(true);
    });

    it('asks for hazard wording only when the product is classified', () => {
      for (const id of ['hazard_statements', 'precautionary_statements', 'signal_word', 'pictograms']) {
        expect(evaluateShowWhen(find(id)!.showWhen, { clp_classification: 'health_physical' }), id).toBe(true);
        expect(evaluateShowWhen(find(id)!.showWhen, { clp_classification: 'environment' }), id).toBe(true);
        expect(evaluateShowWhen(find(id)!.showWhen, { clp_classification: 'none' }), id).toBe(false);
      }
      expect(evaluateShowWhen(find('supplemental_statements')!.showWhen, { clp_classification: 'none' })).toBe(true);
    });

    it('asks for the UFI only when poison centre notification is required for a health or physical hazard', () => {
      const ufi = find('ufi_code')!.showWhen;
      expect(evaluateShowWhen(ufi, { clp_classification: 'health_physical', pcn_applicability: 'required' })).toBe(true);
      expect(evaluateShowWhen(ufi, { clp_classification: 'environment', pcn_applicability: 'required' })).toBe(false);
      expect(evaluateShowWhen(ufi, { clp_classification: 'health_physical', pcn_applicability: 'exempt' })).toBe(false);
    });

    it('asks for the data sheet details only when a data sheet is required or on request', () => {
      for (const id of ['sds_url', 'sds_languages', 'sds_revision_date']) {
        expect(evaluateShowWhen(find(id)!.showWhen, { sds_requirement: 'required' }), id).toBe(true);
        expect(evaluateShowWhen(find(id)!.showWhen, { sds_requirement: 'on_request' }), id).toBe(true);
        expect(evaluateShowWhen(find(id)!.showWhen, { sds_requirement: 'not_required' }), id).toBe(false);
      }
    });

    it('shows the biocide section only for biocidal claims', () => {
      const biocide = sections.find((s) => s.id === 'biocide')!;
      expect(evaluateShowWhen(biocide.showWhen, { biocidal_claims: 'yes' })).toBe(true);
      expect(evaluateShowWhen(biocide.showWhen, { biocidal_claims: 'no' })).toBe(false);
    });

    it('shows the Annex VI sections only for an in-scope product on the Annex VI profile', () => {
      for (const id of ['annex_identity', 'annex_substances', 'annex_microorganisms']) {
        const s = sections.find((x) => x.id === id)!;
        expect(evaluateShowWhen(s.showWhen, { detergent_scope: 'yes', dpp_profile: 'annex_vi' }), id).toBe(true);
        expect(evaluateShowWhen(s.showWhen, { detergent_scope: 'yes', dpp_profile: 'current' }), id).toBe(false);
        expect(evaluateShowWhen(s.showWhen, { detergent_scope: 'no', dpp_profile: 'annex_vi' }), id).toBe(false);
      }
    });
  });

  describe('Annex VI dataset', () => {
    it('reuses the shared substance and micro-organism list question types', () => {
      expect(find('substances')?.type).toBe('substances');
      expect(find('microorganisms')?.type).toBe('microorganisms');
    });

    it('follows Annex VI Part A points (a) to (i)', () => {
      for (const id of [
        'persistent_product_id', 'manufacturer_operator_id', 'backup_provider_url', 'model_content_reference',
        'manufacturing_process_reference', 'manufacturer_responsibility', 'commodity_code_status',
        'compliance_statement', 'substance_list_route', 'substances', 'microorganisms_added', 'microorganisms',
      ]) {
        expect(find(id), id).toBeDefined();
      }
    });

    it('offers the equivalent safety data sheet route only with its own supporting fields', () => {
      expect(find('substance_list_route')!.options!.map((o) => o.value)).toEqual([
        'full_list', 'equivalent_sds', 'no_added_substances',
      ]);
      for (const id of ['industrial_institutional_use', 'equivalent_sds_supplied', 'annex_sds_url', 'annex_sds_languages', 'annex_sds_revision_date']) {
        expect(find(id)!.showWhen, id).toEqual({ field: 'substance_list_route', equals: 'equivalent_sds' });
      }
    });

    it('never makes the micro-organism list optional because of the safety data sheet route', () => {
      expect(find('microorganisms_added')!.required).toBe(true);
      expect(find('microorganisms')!.showWhen).toEqual({ field: 'microorganisms_added', equals: 'yes' });
    });
  });

  describe('safety wording', () => {
    it('is translatable by the manual button only, never auto-translated', () => {
      for (const id of [
        'hazard_statements', 'precautionary_statements', 'supplemental_statements', 'use_instructions',
        'storage_disposal', 'surface_dilution', 'preservatives', 'biocidal_authorisation', 'compliance_statement',
      ]) {
        const q = find(id)!;
        expect(q.translatable, id).toBe(true);
        expect(q.autoTranslate, id).toBe(false);
      }
    });

    it('offers GHS01 to GHS09 plus none', () => {
      expect(find('pictograms')!.options!.map((o) => o.value)).toEqual([
        'ghs01', 'ghs02', 'ghs03', 'ghs04', 'ghs05', 'ghs06', 'ghs07', 'ghs08', 'ghs09', 'none',
      ]);
    });
  });

  describe('required fields', () => {
    it('every required question carries the Required badge and the reverse', () => {
      for (const q of questions) {
        if (q.required) expect(q.badge, q.id).toBe('required');
        if (q.badge === 'required') expect(q.required, q.id).toBe(true);
      }
    });

    it('requires the identity and scope questions', () => {
      for (const id of ['product_name', 'brand_name', 'product_type', 'detergent_scope', 'use_sector', 'model_identifier', 'net_content', 'target_markets', 'biocidal_claims']) {
        expect(find(id)!.required, id).toBe(true);
      }
    });
  });

  it('does not rely on a dash character in any English text', () => {
    const texts: string[] = [];
    for (const s of sections) texts.push(s.title, s.description ?? '');
    for (const q of questions) {
      texts.push(q.label, q.helpText ?? '', q.placeholder ?? '', ...(q.options ?? []).map((o) => o.label));
    }
    expect(texts.filter((t) => /[–—]/.test(t))).toEqual([]);
  });

  describe('getRequiredLogos', () => {
    it('adds the EU Ecolabel only when a licence number is entered', () => {
      expect(detergentsTemplate.getRequiredLogos({})).toEqual([]);
      expect(detergentsTemplate.getRequiredLogos({ ecolabel_licence_number: '   ' })).toEqual([]);
      expect(detergentsTemplate.getRequiredLogos({ ecolabel_licence_number: 'FR/044/001' })).toEqual(['eu-ecolabel']);
    });
  });

  describe('getInlineWarnings', () => {
    const names = (data: Record<string, unknown>) =>
      detergentsTemplate.getInlineWarnings(data).map((w) => w.messageKey.replace('detergents.warnings.', ''));

    it('returns nothing for empty or clean data', () => {
      expect(detergentsTemplate.getInlineWarnings({})).toEqual([]);
      expect(
        detergentsTemplate.getInlineWarnings({
          product_type: 'laundry',
          phosphorus_per_dose_g: 0.2,
          ufi_code: 'N1QV-R02N-J00M-WQD5',
          ingredients_url: 'https://example.example/ingredients',
          sds_revision_date: '2026-10-01',
          manufacturer_email: 'a@b.example',
        }),
      ).toEqual([]);
    });

    it('flags phosphorus at the laundry and dishwasher limits', () => {
      expect(names({ product_type: 'laundry', phosphorus_per_dose_g: 0.5 })).toEqual(['phosphorusLaundry']);
      expect(names({ product_type: 'laundry', phosphorus_per_dose_g: 0.49 })).toEqual([]);
      expect(names({ product_type: 'machine_dishwashing', phosphorus_per_dose_g: 0.3 })).toEqual(['phosphorusDishwasher']);
      expect(names({ product_type: 'machine_dishwashing', phosphorus_per_dose_g: 0.29 })).toEqual([]);
      expect(names({ product_type: 'glass', phosphorus_per_dose_g: 5 })).toEqual([]);
      const w = detergentsTemplate.getInlineWarnings({ product_type: 'laundry', phosphorus_per_dose_g: 0.8 })[0];
      expect(w.params).toEqual({ value: 0.8 });
      expect(w.message).toContain('0.8 g');
    });

    it('flags a percentage outside 0 to 100', () => {
      expect(names({ recycled_packaging_content: 120 })).toEqual(['percentageRange']);
      expect(names({ recycled_packaging_content: -1 })).toEqual(['percentageRange']);
      expect(names({ recycled_packaging_content: 100 })).toEqual([]);
      expect(names({ recycled_packaging_content: 0 })).toEqual([]);
    });

    it('flags dosage values that are zero or negative', () => {
      expect(names({ dosage_soft: 0 })).toEqual(['positiveNumber']);
      expect(names({ loads_per_pack: -3 })).toEqual(['positiveNumber']);
      expect(names({ dosage_soft: 60, dishwasher_dose: 20 })).toEqual([]);
    });

    it('flags an allergen answer of yes with no allergen selected', () => {
      expect(names({ allergens_above_threshold: 'yes' })).toEqual(['allergensMissing']);
      expect(names({ allergens_above_threshold: 'yes', fragrance_allergens: [] })).toEqual(['allergensMissing']);
      expect(names({ allergens_above_threshold: 'yes', fragrance_allergens: ['linalool'] })).toEqual([]);
      expect(names({ allergens_above_threshold: 'no' })).toEqual([]);
    });

    it('flags added micro-organisms without a safety reference', () => {
      expect(names({ microorganisms_added: 'yes' })).toEqual(['microorganismSafety']);
      expect(names({ microorganisms_added: 'yes', microorganism_safety_reference: 'Report 12' })).toEqual([]);
    });

    it('checks the UFI format, URLs, emails and dates without blocking', () => {
      expect(names({ future_ufi_code: 'N1QV-R02N-J00M' })).toEqual(['ufiFormat']);
      expect(names({ future_ufi_code: 'N1QV-R02N-J00M-WQD5' })).toEqual([]);
      expect(names({ ufi_code: 'N1QV-R02N-J00M' })).toEqual(['ufiFormat']);
      expect(names({ ufi_code: 'N1QV-R02N-J00M-WQDU' })).toEqual([]);
      for (const bad of ['B', 'I', 'L', 'O', 'Z']) expect(names({ ufi_code: `N1QV-R02N-J00M-WQD${bad}` })).toEqual(['ufiFormat']);
      expect(names({ future_ufi_code: 'N1QV-R02N-J00M-WQDB' })).toEqual(['ufiFormat']);
      expect(names({ ingredients_url: 'example.com/ingredients' })).toEqual(['urlFormat']);
      expect(names({ sds_url: 'javascript:alert(1)' })).toEqual(['urlFormat']);
      expect(names({ manufacturer_email: 'not-an-email' })).toEqual(['emailFormat']);
      expect(names({ sds_revision_date: '2026-02-30' })).toEqual(['dateFormat']);
      expect(names({ data_review_date: '13/10/2026' })).toEqual(['dateFormat']);
    });

    it('gives every warning a key, a message and no "undefined"', () => {
      const all = detergentsTemplate.getInlineWarnings({
        product_type: 'laundry',
        phosphorus_per_dose_g: 1,
        recycled_packaging_content: 150,
        dosage_soft: 0,
        allergens_above_threshold: 'yes',
        microorganisms_added: 'yes',
        ufi_code: 'x',
        ingredients_url: 'x',
        manufacturer_email: 'x',
        data_review_date: 'x',
      });
      expect(all.length).toBeGreaterThanOrEqual(8);
      for (const w of all) {
        expect(w.messageKey).toMatch(/^detergents\.warnings\./);
        expect(w.message).not.toContain('undefined');
        expect(w.message).not.toContain('{{');
        expect(JSON.stringify(w.params ?? {})).not.toContain('undefined');
        const name = w.messageKey.replace('detergents.warnings.', '') as keyof typeof DETERGENTS_WARNING_MESSAGES;
        expect(DETERGENTS_WARNING_MESSAGES[name]).toBeDefined();
      }
    });
  });

  describe('client review batch (October 2026)', () => {
    const q = (id: string) => detergentsTemplate.sections.flatMap((s) => s.questions).find((x) => x.id === id);
    const sectionOf = (id: string) => detergentsTemplate.sections.find((s) => s.questions.some((x) => x.id === id))?.id;

    it('asks for the label UFI on the Annex VI profile, independent of the poison centre question', () => {
      const f = q('future_ufi_code')!;
      expect(sectionOf('future_ufi_code')).toBe('annex_identity');
      expect(f.required).toBe(true);
      expect(f.showWhen).toBeUndefined();
      expect(f.helpText).toContain('Annex V Part A point 1(b)');
    });

    it('keeps the registry confirmation in the supplier review section, only on the Annex VI profile', () => {
      const f = q('registry_upload_confirmed')!;
      expect(sectionOf('registry_upload_confirmed')).toBe('review');
      expect(f.type).toBe('checkbox');
      expect(f.showWhen).toEqual({ field: 'dpp_profile', equals: 'annex_vi', and: [{ field: 'detergent_scope', equals: 'yes' }] });
    });

    it('states the two microplastics exceptions and the Ecolabel condition for generic claims', () => {
      expect(q('synthetic_polymer_microparticles')!.helpText).toContain('17 October 2023');
      expect(q('synthetic_polymer_microparticles')!.helpText).toContain('17 October 2029');
      expect(q('claims_avoid_generic_terms')!.helpText).toContain('EU Ecolabel');
      expect(q('claims_avoid_generic_terms')!.helpText).toContain('"Biodegradable" on its own');
    });

    it('exposes the packaging image wording for the shared form', () => {
      expect(DETERGENTS_FORM_COPY.packagingImageLabel).toBe('Colour image of the packaging or label');
    });
  });
});
