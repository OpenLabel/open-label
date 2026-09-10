/** Shared, dependency-free car cleaning data contract for the UI and public API. */
export type CarCleaningCondition = { field: string; equals: string | string[] };
export type CarCleaningQuestion = {
  id: string; label: string; labelKey: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean; options?: { value: string; label: string; labelKey: string }[];
  showWhen?: CarCleaningCondition; helpText?: string; helpKey?: string;
  translatable?: boolean; autoTranslate?: boolean;
};
export type CarCleaningSection = {
  id: string; title: string; titleKey: string;
  showWhen?: CarCleaningCondition; questions: CarCleaningQuestion[];
};
const options = (entries: [string, string][]) => entries.map(([value, label]) => ({
  value, label: value === 'required' ? 'Required' : value === 'review' ? 'Assessment needed' : label,
  labelKey: `carCleaning.options.${value}`,
}));
const yesNo = options([['yes', 'Yes'], ['no', 'No'], ['review', 'Assessment needed']]);
const q = (id: string, label: string, type: CarCleaningQuestion['type'] = 'text', extra: Partial<CarCleaningQuestion> = {}): CarCleaningQuestion => ({ id, label, labelKey: `carCleaning.fields.${id}`, type, ...extra });
const section = (id: string, title: string, questions: CarCleaningQuestion[], showWhen?: CarCleaningCondition): CarCleaningSection => ({ id, title, titleKey: `carCleaning.sections.${id}`, questions, ...(showWhen ? { showWhen } : {}) });
const when = (field: string, equals: string | string[]): CarCleaningCondition => ({ field, equals });
const req = { required: true };
const prose = { translatable: true, autoTranslate: false };

export const carCleaningSections: CarCleaningSection[] = [
  section('scope', 'Product and regulatory scope', [
    q('product_kind', 'Product function', 'select', { ...req, options: options([['shampoo', 'Car shampoo'], ['surface_cleaner', 'Surface or interior cleaner'], ['glass_cleaner', 'Glass cleaner'], ['wheel_cleaner', 'Wheel cleaner or degreaser'], ['wax_polish', 'Wax or polish'], ['lubricant', 'Lubricant'], ['other', 'Other car care product']]) }),
    q('detergent_scope', 'Intended to wash or clean surfaces?', 'select', { ...req, options: yesNo }),
    q('scope_reason', 'Reason the product is outside detergent scope', 'textarea', { ...req, showWhen: when('detergent_scope', 'no') }),
    q('use_sector', 'Intended users', 'select', { ...req, options: options([['consumer', 'Consumers, including mixed consumer and professional use'], ['professional', 'Professional use only'], ['industrial', 'Industrial use only']]) }),
    q('biocidal_claims', 'Biocidal function or disinfecting claims?', 'select', { ...req, options: yesNo }),
    q('clp_classification', 'CLP classification assessment', 'select', { ...req, options: options([['none', 'Not classified as hazardous'], ['environment', 'Environmental hazards only'], ['health_physical', 'Health or physical hazards, with or without environmental hazards'], ['review', 'Assessment needed']]) }),
    q('supplemental_statements', 'Supplemental label statements (including EUH208)', 'textarea', { ...prose, showWhen: when('clp_classification', 'none') }),
    q('sds_requirement', 'Safety data sheet supply requirement', 'select', { ...req, options: options([['required', 'SDS must be supplied'], ['on_request', 'SDS must be available on request'], ['not_required', 'SDS not required after assessment'], ['review', 'Assessment needed']]) }),
  ]),
  section('identity', 'Identification and traceability', [
    q('model_identifier', 'Product model identifier', 'text', req),
    q('batch_identifier', 'Batch or lot reference', 'text', req),
    q('net_content', 'Nominal quantity with unit', 'text', req),
    q('target_markets', 'EU markets and required label languages', 'textarea', req),
    q('brand_name', 'Brand'),
    q('manufacturer_name', 'Manufacturer name', 'text', req),
    q('manufacturer_address', 'Manufacturer postal address', 'textarea', req),
    q('manufacturer_email', 'Manufacturer email', 'text', req),
    q('manufacturer_phone', 'Manufacturer telephone', 'text', req),
    q('manufacturer_established_eu', 'Manufacturer established in the EU?', 'select', { ...req, options: yesNo }),
  ]),
  section('operator', 'Applicable EU economic operator', [
    q('eu_operator_role', 'EU operator role', 'select', { ...req, options: options([['importer', 'Importer'], ['authorised_representative', 'Authorised representative'], ['other_operator', 'Other applicable EU economic operator']]) }),
    q('eu_operator_name', 'EU operator name', 'text', req),
    q('eu_operator_address', 'EU operator postal address', 'textarea', req),
    q('eu_operator_email', 'EU operator email', 'text', req),
    q('eu_operator_basis', 'Applicable legal basis or mandate', 'textarea'),
  ], when('manufacturer_established_eu', 'no')),
  section('use', 'Safe use and disposal', [
    q('use_instructions', 'Suitable surfaces, dosage, dilution and precautions', 'textarea', { ...req, ...prose }),
    q('storage_disposal', 'Storage, packaging and product disposal', 'textarea', { ...req, ...prose }),
    q('emergency_contact', 'Emergency contact and availability'),
    q('packaging_material', 'Packaging material'),
    q('recycled_content', 'Recycled packaging content (%)', 'number'),
  ]),
  section('ingredients', 'Detergent ingredient information', [
    q('ingredient_classes', 'Label ingredient classes and concentration bands', 'textarea', { ...req, ...prose }),
    q('preservatives', 'Preservatives, or explicit absence', 'textarea', { ...req, ...prose }),
    q('fragrance_allergens', 'Declarable fragrance allergens, or explicit absence', 'textarea', { ...req, ...prose }),
    q('ingredients_url', 'Public detergent ingredient list URL', 'text', { ...req, showWhen: when('use_sector', 'consumer') }),
    q('professional_ingredient_info', 'Equivalent ingredient information supplied to professional users', 'textarea', { ...req, showWhen: when('use_sector', ['professional', 'industrial']) }),
    q('biodegradability_reference', 'Surfactant biodegradability evidence reference', 'textarea', req),
  ], when('detergent_scope', 'yes')),
  section('hazards', 'Physical label hazard information', [
    q('hazard_statements', 'Applicable hazard and supplemental statements', 'textarea', { ...req, ...prose }),
    q('precautionary_statements', 'Applicable precautionary statements', 'textarea', { ...req, ...prose }),
    q('signal_word', 'Signal word', 'select', { ...req, options: options([['danger', 'Danger'], ['warning', 'Warning'], ['not_applicable', 'Not applicable after assessment']]) }),
    q('pictograms', 'Applicable GHS pictogram codes, or explicit absence', 'text', req),
  ], when('clp_classification', ['health_physical', 'environment'])),
  section('pcn', 'Poison centre information', [
    q('pcn_applicability', 'CLP Annex VIII poison centre notification', 'select', { ...req, options: options([['required', 'Required'], ['exempt', 'Documented exemption'], ['review', 'Assessment needed']]) }),
    q('pcn_exemption_reason', 'Reason and legal basis for exemption', 'textarea', { ...req, showWhen: when('pcn_applicability', 'exempt') }),
    q('ufi_code', 'Unique formula identifier (UFI)', 'text', { ...req, showWhen: when('pcn_applicability', 'required') }),
    q('pcn_status', 'Applicable poison centre submissions', 'select', { ...req, options: options([['submitted', 'Submitted for the relevant markets'], ['review', 'Pending or assessment needed']]), showWhen: when('pcn_applicability', 'required') }),
  ], when('clp_classification', 'health_physical')),
  section('sds', 'Safety data sheet access', [
    q('sds_url', 'Public safety data sheet URL', 'text', req),
    q('sds_languages', 'SDS languages and markets', 'text', req),
    q('sds_revision_date', 'SDS revision date (YYYY-MM-DD)', 'text', req),
  ], when('sds_requirement', ['required', 'on_request'])),
  section('biocide', 'Biocidal product assessment', [
    q('biocidal_authorisation', 'Applicable authorisation or lawful transitional basis', 'textarea', req),
    q('biocidal_actives', 'Active substances and authorised uses', 'textarea', req),
  ], when('biocidal_claims', 'yes')),
  section('review', 'Supplier review and future passport preparation', [
    q('reach_review', 'Applicable REACH restrictions and duties assessed', 'select', { ...req, options: options([['reviewed', 'Reviewed by the supplier'], ['review', 'Assessment needed']]) }),
    q('physical_label_reviewed', 'I have checked the required physical label and supplied safety information', 'checkbox', req),
    q('label_image_url', 'Public colour image of packaging and label URL'),
    q('persistent_product_id', 'Persistent product identifier for future DPP'),
    q('manufacturer_operator_id', 'Manufacturer economic operator identifier'),
    q('commodity_code', 'Applicable customs commodity code'),
    q('backup_provider_url', 'Independent passport backup provider reference URL'),
    q('conformity_reference', 'Manufacturer conformity evidence reference'),
    q('data_review_date', 'Product information review date (YYYY-MM-DD)'),
  ]),
];

export const CAR_CLEANING_COPY = {
  publicTitle: 'Car cleaning product information',
  noticeTitle: 'Chemical safety and DPP preparation',
  noticeBody: 'Regulation (EU) 2026/405 mainly applies from 23 September 2029. Until then, Regulation (EC) No 648/2004 remains relevant for detergents, with transitional rules for existing stock. This record supports product information and future DPP preparation. It is not certification, a legal approval or a complete regulatory DPP. Physical labels, REACH, CLP, applicable SDS supply and biocidal requirements still apply. Ordinary chemical cleaners do not acquire a CE marking through this passport.',
  publicDataNotice: 'Everything saved in this category is public. Use public document links only. Do not enter confidential formulations, private technical files or personal data unrelated to the product.',
  scopeHelp: 'Assess intended function and composition. A wax, polish or lubricant may fall outside detergent rules if it does not clean. Cleaning and disinfecting claims can trigger overlapping detergent and biocidal duties.',
  limits: 'Future DPP limits: this service does not provide the EU registry connection, verified persistent identifiers, independent backup, guaranteed regulatory retention, authority access controls or full Annex VI substance and microorganism data. Technical specifications and access rights depend on implementing measures. Supplier entries are not independently verified. ESPR requirements apply only where an applicable product measure requires them.',
  operatorHelp: 'Record the applicable EU operator. Roles depend on the supply chain and applicable law; two representatives are not universally required. A non-EU manufacturer will also need to assess the authorised representative duty under Article 9 of Regulation (EU) 2026/405 when it applies.',
  ingredientsHelp: 'Current detergent labels and public ingredient lists follow Article 11 and Annex VII of Regulation (EC) No 648/2004. Declarable fragrance allergens above 0.01% must be assessed. Professional-only products may use equivalent technical information. A public summary does not replace the medical ingredient data sheet or future Annex VI data.',
  pcnHelp: 'Under current CLP rules, UFI and poison centre notification depend on Annex VIII scope, including health or physical hazards and applicable exemptions. Environmental hazards alone do not automatically trigger notification. Industrial-only use and exemptions need assessment. The 2029 detergent rules include further UFI labelling provisions.',
  sdsHelp: 'A website link does not by itself fulfil the duty to supply an SDS. Assess REACH Article 31, including supply on request and consumer exceptions, and provide required language versions to recipients.',
  translationHelp: 'Check safety wording against the authorised label and SDS in every target market language. Translations are supplier content, not validated legal translations.',
  downloadJson: 'Download public JSON', print: 'Print product information',
  emptyPublic: 'No product details have been supplied.',
  validationTitle: 'Review the product information',
  validationBody: 'Complete the applicable fields and resolve the issues below before saving. These checks test data completeness and format; they do not establish legal compliance.',
  validationSaveError: 'Resolve the applicable car cleaning fields before saving.',
  sources: 'EU legal sources',
  validation: {
    required: 'Complete this field.', type: 'Use the expected value type.', option: 'Choose a listed option.',
    review: 'Resolve the assessment before saving.', url: 'Use a complete public HTTP or HTTPS URL without credentials.',
    email: 'Enter a valid email address.', ufi: 'Enter a UFI with four groups of four valid characters. Format checking does not verify a poison centre submission.',
    range: 'Enter a percentage from 0 to 100.', date: 'Use a valid date in YYYY-MM-DD format.',
    confirmation: 'Confirm the review before saving.', length: 'Keep this value within the supported length.',
  },
  fields: Object.fromEntries(carCleaningSections.flatMap(s => s.questions.map(f => [f.id, f.label]))),
  sections: Object.fromEntries(carCleaningSections.map(s => [s.id, s.title])),
  options: Object.fromEntries(carCleaningSections.flatMap(s => s.questions.flatMap(f => (f.options ?? []).map(o => [o.value, o.label])))),
};

export const CAR_CLEANING_SOURCES = [
  { title: 'Regulation (EU) 2026/405, Articles 2, 8, 9, 21, 36, 37 and Annex VI', url: 'https://eur-lex.europa.eu/eli/reg/2026/405/oj/eng' },
  { title: 'Detergents Regulation (EC) No 648/2004', url: 'https://eur-lex.europa.eu/eli/reg/2004/648/oj/eng' },
  { title: 'REACH Regulation (EC) No 1907/2006', url: 'https://eur-lex.europa.eu/eli/reg/2006/1907/oj/eng' },
  { title: 'CLP Regulation (EC) No 1272/2008', url: 'https://eur-lex.europa.eu/eli/reg/2008/1272/oj/eng' },
  { title: 'Biocidal Products Regulation (EU) No 528/2012', url: 'https://eur-lex.europa.eu/eli/reg/2012/528/oj/eng' },
  { title: 'ESPR Regulation (EU) 2024/1781', url: 'https://eur-lex.europa.eu/eli/reg/2024/1781/oj/eng' },
];
export type CarCleaningIssue = { field: string; code: keyof typeof CAR_CLEANING_COPY.validation };
export function matchesCarCleaning(condition: CarCleaningCondition | undefined, data: Record<string, unknown>): boolean {
  return !condition || (Array.isArray(condition.equals) ? condition.equals.includes(data[condition.field] as string) : data[condition.field] === condition.equals);
}
export function visibleCarCleaningQuestions(data: Record<string, unknown>): CarCleaningQuestion[] {
  return carCleaningSections.filter(s => matchesCarCleaning(s.showWhen, data)).flatMap(s => s.questions.filter(f => matchesCarCleaning(f.showWhen, data)));
}
export function publicHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string' || Array.from(value).some(c => c.charCodeAt(0) <= 32 || c.charCodeAt(0) === 127)) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function fieldIssue(field: CarCleaningQuestion, value: unknown): CarCleaningIssue['code'] | null {
  const empty = value === undefined || value === null || (typeof value === 'string' && !value.trim());
  if (empty) return field.required ? 'required' : null;
  if (field.type === 'checkbox') return value === true ? null : value === false ? 'confirmation' : 'type';
  if (field.type === 'number') return typeof value !== 'number' || !Number.isFinite(value) ? 'type' : value < 0 || value > 100 ? 'range' : null;
  if (typeof value !== 'string') return 'type';
  if (value.length > (field.type === 'textarea' ? 10000 : 2000)) return 'length';
  if (field.options && !field.options.some(o => o.value === value)) return 'option';
  if (field.options && value === 'review') return 'review';
  if (field.id.endsWith('_url') && !publicHttpUrl(value)) return 'url';
  if (field.id.endsWith('_email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  if (field.id === 'ufi_code' && !/^[0-9A-HJKMNP-TV-Y]{4}(?:-[0-9A-HJKMNP-TV-Y]{4}){3}$/.test(value)) return 'ufi';
  if (field.id.endsWith('_date')) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
    const parsed = new Date(value + 'T00:00:00Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return 'date';
  }
  return null;
}
export function validateCarCleaning(data: Record<string, unknown>): CarCleaningIssue[] {
  const issues: CarCleaningIssue[] = [];
  const nameIssue = fieldIssue(q('product_name', 'Product name', 'text', req), data.product_name);
  if (nameIssue) issues.push({ field: 'product_name', code: nameIssue });
  for (const field of visibleCarCleaningQuestions(data)) {
    const code = fieldIssue(field, data[field.id]);
    if (code) issues.push({ field: field.id, code });
  }
  return issues;
}
const languages = new Set(['bg','cs','da','de','el','en','es','et','fi','fr','ga','hr','hu','it','lt','lv','mt','nl','pl','pt','ro','sk','sl','sv','zh-CN']);
const translations = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([k, v]) => languages.has(k) && typeof v === 'string' && v.trim() && v.length <= 10000)) as Record<string, string>;
};
export function publicCarCleaningData(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const data = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const field of visibleCarCleaningQuestions(data)) {
    const value = data[field.id];
    if (value === undefined || value === null || value === '' || fieldIssue(field, value)) continue;
    result[field.id] = value;
    if (field.translatable) {
      const tr = translations(data[`${field.id}_translations`]);
      if (Object.keys(tr).length) result[`${field.id}_translations`] = tr;
    }
  }
  for (const key of ['product_name', 'description']) {
    if (typeof data[key] === 'string' && (data[key] as string).length <= (key === 'product_name' ? 2000 : 10000)) result[key] = data[key];
    const tr = translations(data[`${key}_translations`]);
    if (Object.keys(tr).length) result[`${key}_translations`] = tr;
  }
  return result;
}
export function exportCarCleaningPassport(passport: { name: string; category_data: unknown; public_slug?: string | null; image_url?: string | null; description?: string | null; updated_at?: string; [key: string]: unknown }) {
  const publicData = publicCarCleaningData(passport.category_data);
  return {
    schema_version: 'open-label.car-cleaning.v1', category: 'car_cleaning',
    name: typeof publicData.product_name === 'string' ? publicData.product_name : null, public_slug: passport.public_slug ?? null,
    image_url: publicHttpUrl(passport.image_url), description: typeof passport.description === 'string' ? passport.description : null,
    updated_at: passport.updated_at ?? null,
    category_data: publicData,
    regulatory_context: { main_application_date: '2029-09-23', certification: false, regulatory_dpp_complete: false, limitations: CAR_CLEANING_COPY.limits, sources: CAR_CLEANING_SOURCES },
  };
}
