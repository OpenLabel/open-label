import type { CarCleaningCondition, CarCleaningQuestion, CarCleaningSection } from './carCleaning.ts';

export const annexVICondition: CarCleaningCondition = { field: 'detergent_scope', equals: 'yes', and: [{ field: 'dpp_profile', equals: 'annex_vi' }] };
export const isAnnexVI = (data: Record<string, unknown>) => data.detergent_scope === 'yes' && data.dpp_profile === 'annex_vi';
export const annexVIRequiredExisting = new Set(['label_image_url', 'persistent_product_id', 'manufacturer_operator_id', 'backup_provider_url', 'conformity_reference', 'data_review_date']);
const when = (field: string, equals: string | string[]) => ({ field, equals });
const options = (entries: [string, string][]) => entries.map(([value, label]) => ({ value, label, labelKey: `carCleaning.options.${value}` }));
const yesNo = options([['yes', 'Yes'], ['no', 'No'], ['review', 'Assessment needed']]);
const q = (id: string, label: string, type: CarCleaningQuestion['type'] = 'text', extra: Partial<CarCleaningQuestion> = {}): CarCleaningQuestion => ({ id, label, labelKey: `carCleaning.fields.${id}`, type, required: true, ...extra });
const section = (id: string, title: string, questions: CarCleaningQuestion[], condition?: CarCleaningCondition): CarCleaningSection => ({ id, title, titleKey: `carCleaning.sections.${id}`, questions, showWhen: { ...annexVICondition, and: [...annexVICondition.and!, ...(condition ? [condition] : [])] } });
const prose = { translatable: true, autoTranslate: false };

export const annexVISections: CarCleaningSection[] = [
  section('annex_identity', 'Annex VI: product identity and manufacturer statement', [
    q('model_content_reference', 'Product content revision reference'),
    q('manufacturing_process_reference', 'Manufacturing process revision reference'),
    q('authorised_representative_applicable', 'Has an authorised representative been appointed?', 'select', { options: yesNo, showWhen: when('manufacturer_established_eu', 'yes') }),
    q('identifier_scheme', 'Identifier scheme, issuer and verification evidence'),
    q('backup_reference', 'Actual backup service agreement reference'),
    q('commodity_code_status', 'Customs commodity code applicability', 'select', { options: options([['applicable', 'Applicable'], ['not_applicable', 'Not applicable after assessment']]) }),
    q('commodity_code_reason', 'Reason no commodity code applies', 'textarea', { showWhen: when('commodity_code_status', 'not_applicable') }),
    q('manufacturer_responsibility', 'The manufacturer issues this passport under its sole responsibility', 'checkbox'),
    q('compliance_statement', 'Manufacturer statement that compliance has been demonstrated', 'textarea', prose),
    q('applicable_union_law', 'Applicable Union legislation identified in the manufacturer assessment', 'textarea'),
    q('last_placed_on_market_date', 'Latest actual placing on the market date (YYYY-MM-DD)', 'text', { required: false }),
    q('carrier_placement', 'Physical carrier location and distance-sale access arrangements', 'textarea'),
    q('carrier_reviewed', 'The carrier is indelible, readable and visible before purchase, including applicable refill and distance sales', 'checkbox'),
    q('market_language_reviewed', 'The required information and safety wording have been reviewed in every target market language', 'checkbox'),
    q('future_ufi_code', 'UFI for the future detergent label'),
  ]),
  section('annex_representative', 'Applicable future authorised representative', [
    q('authorised_representative_name', 'Authorised representative name'),
    q('authorised_representative_address', 'Authorised representative postal address', 'textarea'),
    q('authorised_representative_email', 'Authorised representative email'),
    q('authorised_representative_phone', 'Authorised representative telephone'),
    q('authorised_representative_mandate', 'Written mandate reference'),
  ], { field: 'manufacturer_established_eu', equals: 'no', or: [{ field: 'manufacturer_established_eu', equals: 'yes', and: [when('authorised_representative_applicable', 'yes')] }] }),
  section('annex_importer', 'Applicable importer in the future detergent passport', [
    q('importer_applicable', 'Is an importer involved in this supply chain?', 'select', { options: yesNo }),
    q('importer_name', 'Importer name', 'text', { showWhen: when('importer_applicable', 'yes') }),
    q('importer_address', 'Importer postal address', 'textarea', { showWhen: when('importer_applicable', 'yes') }),
    q('importer_email', 'Importer email', 'text', { showWhen: when('importer_applicable', 'yes') }),
    q('importer_phone', 'Importer telephone', 'text', { showWhen: when('importer_applicable', 'yes') }),
  ]),
  section('annex_substances', 'Annex VI: complete public substance dataset', [
    q('substance_list_route', 'Substance disclosure route', 'select', { options: options([['full_list', 'Full public substance list'], ['equivalent_sds', 'Equivalent SDS supplied for industrial or institutional use'], ['no_added_substances', 'No substances to list after assessment']]) }),
    q('substances', 'All intentionally added substances and label-required carry-over preservatives', 'substances', { showWhen: when('substance_list_route', 'full_list') }),
    q('no_substances_reason', 'Basis for the absence of substances to list', 'textarea', { showWhen: when('substance_list_route', 'no_added_substances') }),
    q('substance_list_complete', 'The list is complete, includes qualifying carry-over preservatives and uses identities assessed under CLP Article 18(3)', 'checkbox', { showWhen: when('substance_list_route', ['full_list', 'no_added_substances']) }),
    q('industrial_institutional_use', 'Use is exclusively outside the domestic sphere by specialised personnel', 'checkbox', { showWhen: when('substance_list_route', 'equivalent_sds') }),
    q('annex_sds_url', 'Equivalent public SDS URL', 'text', { showWhen: when('substance_list_route', 'equivalent_sds') }),
    q('annex_sds_languages', 'Equivalent SDS languages', 'text', { showWhen: when('substance_list_route', 'equivalent_sds') }),
    q('annex_sds_revision_date', 'Equivalent SDS revision date (YYYY-MM-DD)', 'text', { showWhen: when('substance_list_route', 'equivalent_sds') }),
    q('equivalent_sds_supplied', 'Equivalent substance information has actually been provided in an SDS under REACH Article 31', 'checkbox', { showWhen: when('substance_list_route', 'equivalent_sds') }),
  ]),
  section('annex_label', 'Future detergent label information', [
    q('future_label_ingredients', 'Annex V ingredient classes, bands and added constituents, or equivalent supplied SDS information', 'textarea', prose),
    q('future_label_preservatives', 'Annex V preservative names, or assessed basis for omission', 'textarea', prose),
    q('future_label_allergens', 'Annex V Part D fragrance allergens, or assessed absence', 'textarea', prose),
  ]),
  section('annex_microorganisms', 'Annex VI: intentionally added microorganisms', [
    q('microorganisms_added', 'Are microorganisms intentionally added?', 'select', { options: yesNo }),
    q('microorganisms', 'All intentionally added microorganisms', 'microorganisms', { showWhen: when('microorganisms_added', 'yes') }),
    q('microorganism_safety_reference', 'Annex II microorganism safety assessment reference', 'textarea', { showWhen: when('microorganisms_added', 'yes') }),
    q('microorganism_shelf_life', 'Microorganism product shelf life and storage conditions', 'textarea', { ...prose, showWhen: when('microorganisms_added', 'yes') }),
    q('food_contact_use', 'Intended use on food-contact surfaces?', 'select', { options: yesNo, showWhen: when('microorganisms_added', 'yes') }),
    q('food_contact_instructions', 'Food-contact surface precautions and instructions', 'textarea', { ...prose, showWhen: { field: 'microorganisms_added', equals: 'yes', and: [when('food_contact_use', 'yes')] } }),
  ]),
];

export const annexVICopy = {
  annexHelp: 'Annex VI of Regulation (EU) 2026/405 requires a complete public substance list and every intentionally added microorganism. Do not enter concentrations or confidential technical files. CAS and EC numbers are optional identity aids. The supplier must assess chemical names under CLP Article 18(3). The SDS exception applies only to equivalent information actually supplied for industrial or institutional detergents; it never removes microorganism disclosure.',
  identityHelp: 'Use actual product and operator identifiers and a real backup service reference. Saving a URI or contract reference does not verify its issuer or create a service agreement. Keep the latest market placement date up to date for retention. A changed formulation, manufacturing process, trade name or CLP classification may require a new model and passport.',
  dataset: {
    add: 'Add entry', remove: 'Remove entry', entry: 'Entry',
    chemical_name: 'Chemical name', identifier_type: 'Optional identifier type', identifier: 'Identifier',
    addition: 'Reason for inclusion', label_basis: 'Carry-over preservative label basis',
    genus: 'Genus', species: 'Species', strain: 'Strain name or code',
    intentional: 'Intentionally added', carryover_preservative: 'Label-required carry-over preservative',
    none: 'Not supplied', cas: 'CAS', ec: 'EC', other: 'Other identifier',
    clp_18_3_b: 'CLP Article 18(3)(b)', bpr_58: 'BPR Article 58', annex_v: '2026/405 Annex V A1(h)(iii)', multiple: 'Multiple listed legal grounds',
  },
};

export type DatasetKind = 'substances' | 'microorganisms';
export type PublicDatasetRow = Record<string, string>;
const text = (value: unknown, max = 500) => typeof value === 'string' && value.trim().length > 0 && value.length <= max && !Array.from(value).some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
function casValid(value: string): boolean {
  if (!/^\d{2,7}-\d{2}-\d$/.test(value)) return false;
  const digits = value.replace(/-/g, '');
  return [...digits.slice(0, -1)].reverse().reduce((sum, digit, index) => sum + Number(digit) * (index + 1), 0) % 10 === Number(digits.at(-1));
}
/** All-or-nothing projection: never present a truncated invalid list as complete. */
export function projectDataset(kind: DatasetKind, value: unknown): PublicDatasetRow[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 500) return null;
  const result: PublicDatasetRow[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    const projected: PublicDatasetRow = {};
    if (kind === 'microorganisms') {
      for (const key of ['genus', 'species', 'strain']) {
        if (!text(row[key])) return null;
        projected[key] = (row[key] as string).trim();
      }
    } else {
      if (!text(row.chemical_name) || !['intentional', 'carryover_preservative'].includes(row.addition as string)) return null;
      projected.chemical_name = (row.chemical_name as string).trim();
      projected.addition = row.addition as string;
      if (row.addition === 'carryover_preservative') {
        if (!['clp_18_3_b', 'bpr_58', 'annex_v', 'multiple'].includes(row.label_basis as string)) return null;
        projected.label_basis = row.label_basis as string;
      }
      const hasType = row.identifier_type !== undefined && row.identifier_type !== '' && row.identifier_type !== 'none';
      const hasIdentifier = row.identifier !== undefined && row.identifier !== '';
      if (hasType !== hasIdentifier) return null;
      if (hasType) {
        if (!['cas', 'ec', 'other'].includes(row.identifier_type as string) || !text(row.identifier, 200)) return null;
        const id = row.identifier as string;
        if (row.identifier_type === 'cas' && !casValid(id)) return null;
        if (row.identifier_type === 'ec' && !/^\d{3}-\d{3}-\d$/.test(id)) return null;
        projected.identifier_type = row.identifier_type as string;
        projected.identifier = id;
      }
    }
    const identity = kind === 'microorganisms' ? ['genus', 'species', 'strain'].map(k => projected[k]).join('|') : projected.chemical_name;
    const key = identity.normalize('NFKC').toLocaleLowerCase('en');
    if (seen.has(key)) return null;
    seen.add(key);
    result.push(projected);
  }
  return result;
}
