/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import {
  BaseTemplate,
  ShowWhenCondition,
  TemplateOption,
  TemplateQuestion,
  TemplateSection,
} from './base';

// Helper: build option lists with labelKey wired up to a namespace.
function opts(
  ns: string,
  entries: { value: string; label: string }[],
): TemplateOption[] {
  return entries.map((e) => ({
    value: e.value,
    label: e.label,
    labelKey: `detergents.options.${ns}.${e.value}`,
  }));
}

// Runtime messages used by getInlineWarnings and warnWhen. One source of truth
// for the English fallback and for the locale seed script.
export const DETERGENTS_WARNING_MESSAGES = {
  assessmentNeeded:
    'This assessment is not finished. Resolve it before relying on the passport.',
  scopeOutside:
    'This product may fall outside the definition of a detergent in Article 2(1) of Regulation (EU) 2026/405. Check the scope before using this category.',
  biocidal:
    'Disinfecting or antimicrobial claims need a biocidal product authorisation under Regulation (EU) No 528/2012.',
  microparticles:
    'Check Regulation (EU) 2023/2055 on synthetic polymer microparticles before placing this product on the market. An unknown answer must be resolved with the supplier.',
  phosphorusLaundry:
    'A total phosphorus content of {{value}} g is not below the 0.5 g limit for a consumer laundry detergent in hard water (Annex III of Regulation (EU) 2026/405).',
  phosphorusDishwasher:
    'A total phosphorus content of {{value}} g is not below the 0.3 g limit for a consumer automatic dishwasher detergent (Annex III of Regulation (EU) 2026/405).',
  percentageRange: 'A percentage must be between 0 and 100. You entered {{value}}.',
  positiveNumber: 'Enter a number greater than zero. You entered {{value}}.',
  allergensMissing:
    'You answered yes, but no allergen is selected. Select each allergen from the official list.',
  ufiFormat:
    'A UFI has four groups of four characters, for example N1QV-R02N-J00M-WQD5. The format is checked, but a poison centre submission is not.',
  urlFormat: 'Use a complete web address starting with http:// or https://.',
  emailFormat: 'Enter a valid email address.',
  dateFormat: 'Use a valid date in YYYY-MM-DD format.',
  microorganismSafety:
    'Micro-organisms are added, but no safety assessment reference is entered.',
} as const;

export type DetergentsWarningName = keyof typeof DETERGENTS_WARNING_MESSAGES;

const warnKey = (name: DetergentsWarningName) => `detergents.warnings.${name}`;

// Reused option lists.
const YES_NO_REVIEW = opts('yesNoReview', [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'review', label: 'Assessment needed' },
]);

const YES_NO_UNKNOWN = opts('yesNoUnknown', [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
]);

// Annex V Part A, point 1(h)(i): classes labelled by weight band when added
// above 0.2% by weight. Values are frozen for data compatibility.
export const DETERGENT_CONSTITUENT_CLASSES: readonly { value: string; label: string }[] = [
  { value: 'phosphates', label: 'Phosphates' },
  { value: 'phosphonates', label: 'Phosphonates' },
  { value: 'anionic_surfactants', label: 'Anionic surfactants' },
  { value: 'cationic_surfactants', label: 'Cationic surfactants' },
  { value: 'amphoteric_surfactants', label: 'Amphoteric surfactants' },
  { value: 'nonionic_surfactants', label: 'Non-ionic surfactants' },
  { value: 'oxygen_bleach', label: 'Oxygen-based bleaching agents' },
  { value: 'chlorine_bleach', label: 'Chlorine-based bleaching agents' },
  { value: 'edta', label: 'EDTA and salts thereof' },
  { value: 'nta', label: 'NTA and salts thereof' },
  { value: 'phenols', label: 'Phenols and halogenated phenols' },
  { value: 'paradichlorobenzene', label: 'Paradichlorobenzene' },
  { value: 'aromatic_hydrocarbons', label: 'Aromatic hydrocarbons' },
  { value: 'aliphatic_hydrocarbons', label: 'Aliphatic hydrocarbons' },
  { value: 'halogenated_hydrocarbons', label: 'Halogenated hydrocarbons' },
  { value: 'soap', label: 'Soap' },
  { value: 'zeolites', label: 'Zeolites' },
  { value: 'polycarboxylates', label: 'Polycarboxylates' },
];

const WEIGHT_BANDS = opts('weightBand', [
  { value: 'lt5', label: 'Less than 5%' },
  { value: '5to15', label: '5% or over but less than 15%' },
  { value: '15to30', label: '15% or over but less than 30%' },
  { value: 'gte30', label: '30% and more' },
]);

// Conditions.
const when = (field: string, equals: unknown | unknown[]): ShowWhenCondition => ({
  field,
  equals,
});
const includes = (field: string, equals: unknown): ShowWhenCondition => ({
  field,
  equals,
  includes: true,
});

const SURFACE_TYPES = [
  'all_purpose',
  'kitchen',
  'bathroom',
  'toilet',
  'glass',
  'floor',
  'descaler',
  'bleach',
];
const DOSAGE_TYPES = ['laundry', 'machine_dishwashing'];
const CLASSIFIED = ['health_physical', 'environment'];
const SDS_NEEDED = ['required', 'on_request'];
const NON_DOMESTIC = ['professional', 'industrial'];

const IF_NON_EU = when('manufacturer_non_eu', 'yes');
const IF_ANNEX_VI: ShowWhenCondition = {
  field: 'dpp_profile',
  equals: 'annex_vi',
  and: [when('detergent_scope', 'yes')],
};

// Question shortcuts.
const REQ = { required: true, badge: 'required' } as const;
// Legal or safety wording: translatable by the manual button only, never auto-translated.
const PROSE = { translatable: true, autoTranslate: false } as const;

type FieldDef = Omit<TemplateQuestion, 'labelKey' | 'helpKey' | 'placeholderKey'>;
function f(q: FieldDef): TemplateQuestion {
  const out: TemplateQuestion = {
    ...q,
    labelKey: `detergents.fields.${q.id}.label`,
  };
  if (q.helpText) out.helpKey = `detergents.fields.${q.id}.help`;
  if (q.placeholder) out.placeholderKey = `detergents.fields.${q.id}.placeholder`;
  return out;
}

function section(
  id: string,
  title: string,
  description: string | undefined,
  questions: TemplateQuestion[],
  showWhen?: ShowWhenCondition,
): TemplateSection {
  return {
    id,
    title,
    titleKey: `detergents.sections.${id}.title`,
    description,
    descriptionKey: description ? `detergents.sections.${id}.description` : undefined,
    questions,
    ...(showWhen ? { showWhen } : {}),
  };
}

const assessmentWarn = {
  equals: ['review'],
  message: DETERGENTS_WARNING_MESSAGES.assessmentNeeded,
  messageKey: warnKey('assessmentNeeded'),
};

export class DetergentsTemplate extends BaseTemplate {
  id = 'detergents';
  name = 'Detergents';
  description =
    'Digital Product Passport for detergents under Regulation (EC) No 648/2004, with preparation for Regulation (EU) 2026/405';
  icon = '🧴';

  sections: TemplateSection[] = [
    section('identity', 'Product identity', 'Product, model and traceability', [
      {
        ...f({
          id: 'product_name',
          label: 'Product Name',
          type: 'text',
          translatable: true,
          required: true,
          badge: 'required',
          placeholder: 'Enter a name for this product',
          helpText: 'This is the name consumers will see on the public Digital Product Passport',
        }),
        labelKey: 'passport.productName',
        placeholderKey: 'passport.productNamePlaceholder',
        helpKey: 'passport.productNameHelp',
      },
      f({ id: 'brand_name', label: 'Brand Name', type: 'text', ...REQ }),
      f({
        id: 'product_type',
        label: 'Product type',
        type: 'select',
        ...REQ,
        options: opts('productType', [
          { value: 'laundry', label: 'Laundry detergent' },
          { value: 'laundry_additive', label: 'Laundry additive or pre-wash' },
          { value: 'machine_dishwashing', label: 'Machine dishwashing detergent' },
          { value: 'dishwasher_additive', label: 'Rinse aid or dishwasher additive' },
          { value: 'hand_dishwashing', label: 'Hand dishwashing detergent' },
          { value: 'all_purpose', label: 'All-purpose or surface cleaner' },
          { value: 'kitchen', label: 'Kitchen cleaner' },
          { value: 'bathroom', label: 'Bathroom cleaner' },
          { value: 'toilet', label: 'Toilet cleaner' },
          { value: 'glass', label: 'Glass cleaner' },
          { value: 'floor', label: 'Floor cleaner' },
          { value: 'descaler', label: 'Descaler' },
          { value: 'bleach', label: 'Bleach' },
          { value: 'other', label: 'Other detergent' },
        ]),
      }),
      f({
        id: 'product_type_other',
        label: 'Product type (specify)',
        type: 'text',
        showWhen: when('product_type', 'other'),
      }),
      f({
        id: 'product_form',
        label: 'Product form',
        type: 'select',
        options: opts('productForm', [
          { value: 'liquid', label: 'Liquid' },
          { value: 'gel', label: 'Gel' },
          { value: 'powder', label: 'Powder' },
          { value: 'tablet', label: 'Tablet' },
          { value: 'capsule', label: 'Capsule or pod' },
          { value: 'spray', label: 'Spray' },
          { value: 'wipe', label: 'Wipe' },
          { value: 'paste', label: 'Paste' },
          { value: 'other', label: 'Other' },
        ]),
      }),
      f({
        id: 'detergent_scope',
        label: 'Is the product intended to clean, soak, rinse or bleach fabrics, dishes or surfaces?',
        type: 'select',
        ...REQ,
        options: YES_NO_REVIEW,
        helpText:
          'See Article 2(1) of Regulation (EU) 2026/405. Paints, adhesives, solvents and products that do not clean are outside this category.',
        warnWhen: {
          equals: ['no', 'review'],
          message: DETERGENTS_WARNING_MESSAGES.scopeOutside,
          messageKey: warnKey('scopeOutside'),
        },
      }),
      f({
        id: 'scope_reason',
        label: 'Reason the product is outside the detergent definition',
        type: 'textarea',
        ...PROSE,
        ...REQ,
        showWhen: when('detergent_scope', 'no'),
      }),
      f({
        id: 'use_sector',
        label: 'Who is the product intended for?',
        type: 'select',
        ...REQ,
        options: opts('useSector', [
          { value: 'consumer', label: 'Consumers, including mixed consumer and professional use' },
          { value: 'professional', label: 'Professional use only' },
          { value: 'industrial', label: 'Industrial and institutional use only' },
        ]),
        helpText:
          'Industrial and institutional means used only outside the domestic sphere by specialised personnel.',
      }),
      f({
        id: 'model_identifier',
        label: 'Product model identifier',
        type: 'text',
        ...REQ,
        helpText:
          'One passport covers one model. A change of formulation or production that changes the label can make it a new model.',
      }),
      f({
        id: 'batch_identifier',
        label: 'Type, batch or lot reference',
        type: 'text',
        helpText: 'The label needs a type number, batch number or other traceability element.',
      }),
      f({ id: 'gtin', label: 'GTIN / EAN', type: 'text', placeholder: 'e.g., 3401234567890' }),
      f({
        id: 'net_content',
        label: 'Nominal quantity with unit',
        type: 'text',
        ...REQ,
        placeholder: 'e.g., 1.5 L, 750 ml, 2 kg',
      }),
      f({
        id: 'target_markets',
        label: 'EU markets and label languages',
        type: 'textarea',
        ...REQ,
        placeholder: 'e.g., France (French), Germany (German)',
        helpText:
          'Label and safety wording must be available in the language or languages required in each market.',
      }),
      f({
        id: 'dpp_profile',
        label: 'Information profile',
        type: 'select',
        options: opts('dppProfile', [
          { value: 'current', label: 'Current product information' },
          { value: 'annex_vi', label: 'Full Annex VI dataset for the 2029 rules' },
        ]),
        helpText:
          'Regulation (EU) 2026/405 applies from 23 September 2029. Choose the Annex VI dataset to prepare the future passport data. Completing it does not make a passport compliant or certified.',
        showWhen: when('detergent_scope', 'yes'),
      }),
      f({
        id: 'biocidal_claims',
        label: 'Biocidal or disinfecting claims?',
        type: 'select',
        ...REQ,
        options: YES_NO_REVIEW,
        helpText:
          'Disinfecting or antimicrobial claims need a biocidal product authorisation under Regulation (EU) No 528/2012.',
        warnWhen: {
          equals: ['yes', 'review'],
          message: DETERGENTS_WARNING_MESSAGES.biocidal,
          messageKey: warnKey('biocidal'),
        },
      }),
    ]),

    section(
      'responsible_operators',
      'Who is responsible',
      'Manufacturer, importer and EU authorised representative, kept as separate parties',
      [
        f({
          id: 'manufacturer_legal_name',
          label: 'Manufacturer legal name',
          type: 'text',
          ...REQ,
          helpText:
            'The label shows the name, postal address, electronic address and telephone number of the manufacturer. The postal address must be a single point in the Union.',
        }),
        f({ id: 'manufacturer_street', label: 'Street address', type: 'text', ...REQ }),
        f({ id: 'manufacturer_postal_code', label: 'Postal code', type: 'text', ...REQ }),
        f({ id: 'manufacturer_city', label: 'City', type: 'text', ...REQ }),
        f({ id: 'manufacturer_country', label: 'Country', type: 'text', ...REQ }),
        f({
          id: 'manufacturer_email',
          label: 'Electronic address (email)',
          type: 'text',
          ...REQ,
          placeholder: 'name@company.com',
        }),
        f({
          id: 'manufacturer_phone',
          label: 'Telephone number',
          type: 'text',
          ...REQ,
          placeholder: 'e.g., +33 1 23 45 67 89',
        }),
        f({
          id: 'manufacturer_non_eu',
          label: 'Is the manufacturer established outside the EU?',
          type: 'select',
          ...REQ,
          options: opts('manufacturerNonEu', [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]),
        }),
        f({
          id: 'importer_legal_name',
          label: 'Importer legal name',
          type: 'text',
          ...REQ,
          showWhen: IF_NON_EU,
          helpText:
            "When the manufacturer is established outside the EU, the importer's contact details are also required.",
        }),
        f({ id: 'importer_street', label: 'Street address', type: 'text', ...REQ, showWhen: IF_NON_EU }),
        f({ id: 'importer_postal_code', label: 'Postal code', type: 'text', ...REQ, showWhen: IF_NON_EU }),
        f({ id: 'importer_city', label: 'City', type: 'text', ...REQ, showWhen: IF_NON_EU }),
        f({ id: 'importer_country', label: 'Country', type: 'text', ...REQ, showWhen: IF_NON_EU }),
        f({
          id: 'importer_email',
          label: 'Electronic address (email)',
          type: 'text',
          ...REQ,
          placeholder: 'name@company.com',
          showWhen: IF_NON_EU,
        }),
        f({
          id: 'eu_operator_name',
          label: 'EU authorised representative: legal name',
          type: 'text',
          ...REQ,
          showWhen: IF_NON_EU,
          helpText:
            'A manufacturer established outside the EU must appoint an authorised representative (Article 9 of Regulation (EU) 2026/405).',
        }),
        f({
          id: 'eu_operator_address',
          label: 'EU authorised representative: address',
          type: 'textarea',
          ...REQ,
          showWhen: IF_NON_EU,
          placeholder: 'Registered address inside the European Union',
        }),
        f({
          id: 'eu_operator_email',
          label: 'EU authorised representative: electronic address (email)',
          type: 'text',
          ...REQ,
          showWhen: IF_NON_EU,
          placeholder: 'name@company.com',
        }),
      ],
    ),

    section(
      'classification',
      'Hazard classification and safety information',
      'CLP classification, label hazard information, poison centre and safety data sheet',
      [
        f({
          id: 'clp_classification',
          label: 'CLP classification assessment',
          type: 'select',
          ...REQ,
          options: opts('clpClassification', [
            { value: 'none', label: 'Not classified as hazardous' },
            { value: 'environment', label: 'Environmental hazards only' },
            {
              value: 'health_physical',
              label: 'Health or physical hazards, with or without environmental hazards',
            },
            { value: 'review', label: 'Assessment needed' },
          ]),
          helpText:
            'Use the classification actually assessed for this mixture under Regulation (EC) No 1272/2008. Do not infer it from the pH or the pictograms.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'supplemental_statements',
          label: 'Supplemental label statements',
          type: 'textarea',
          ...PROSE,
          showWhen: when('clp_classification', 'none'),
          helpText: 'For example EUH208, where it applies.',
        }),
        f({
          id: 'signal_word',
          label: 'Signal word',
          type: 'select',
          ...REQ,
          showWhen: when('clp_classification', CLASSIFIED),
          options: opts('signalWord', [
            { value: 'danger', label: 'Danger' },
            { value: 'warning', label: 'Warning' },
            { value: 'not_applicable', label: 'Not applicable after assessment' },
          ]),
        }),
        f({
          id: 'pictograms',
          label: 'GHS pictograms',
          type: 'multi_select',
          showWhen: when('clp_classification', CLASSIFIED),
          options: opts('pictograms', [
            { value: 'ghs01', label: 'GHS01 Exploding bomb' },
            { value: 'ghs02', label: 'GHS02 Flame' },
            { value: 'ghs03', label: 'GHS03 Flame over circle' },
            { value: 'ghs04', label: 'GHS04 Gas cylinder' },
            { value: 'ghs05', label: 'GHS05 Corrosion' },
            { value: 'ghs06', label: 'GHS06 Skull and crossbones' },
            { value: 'ghs07', label: 'GHS07 Exclamation mark' },
            { value: 'ghs08', label: 'GHS08 Health hazard' },
            { value: 'ghs09', label: 'GHS09 Environment' },
            { value: 'none', label: 'No pictogram applies' },
          ]),
        }),
        f({
          id: 'hazard_statements',
          label: 'Hazard statements',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('clp_classification', CLASSIFIED),
          placeholder: 'e.g., H315 Causes skin irritation',
          helpText:
            'Enter the wording exactly as on the approved label. Use the translation button for each market language. This wording is never translated automatically.',
        }),
        f({
          id: 'precautionary_statements',
          label: 'Precautionary statements',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('clp_classification', CLASSIFIED),
          placeholder: 'e.g., P280 Wear protective gloves',
          helpText:
            'Enter the wording exactly as on the approved label. Use the translation button for each market language. This wording is never translated automatically.',
        }),
        f({
          id: 'pcn_applicability',
          label: 'Poison centre notification (CLP Annex VIII)',
          type: 'select',
          ...REQ,
          showWhen: when('clp_classification', 'health_physical'),
          options: opts('pcnApplicability', [
            { value: 'required', label: 'Notification required' },
            { value: 'exempt', label: 'Documented exemption' },
            { value: 'review', label: 'Assessment needed' },
          ]),
          helpText:
            'UFI and notification depend on health or physical hazards and the applicable exemptions. Environmental hazards alone do not trigger notification.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'pcn_exemption_reason',
          label: 'Reason and legal basis for the exemption',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: {
            field: 'pcn_applicability',
            equals: 'exempt',
            and: [when('clp_classification', 'health_physical')],
          },
        }),
        f({
          id: 'ufi_code',
          label: 'Unique formula identifier (UFI)',
          type: 'text',
          ...REQ,
          showWhen: {
            field: 'pcn_applicability',
            equals: 'required',
            and: [when('clp_classification', 'health_physical')],
          },
          placeholder: 'e.g., N1QV-R02N-J00M-WQD5',
          helpText:
            'Four groups of four characters. The format is checked, but the app cannot verify a poison centre submission.',
        }),
        f({
          id: 'pcn_status',
          label: 'Poison centre submissions',
          type: 'select',
          ...REQ,
          showWhen: {
            field: 'pcn_applicability',
            equals: 'required',
            and: [when('clp_classification', 'health_physical')],
          },
          options: opts('pcnStatus', [
            { value: 'submitted', label: 'Submitted for the relevant markets' },
            { value: 'pending', label: 'Pending' },
          ]),
        }),
        f({
          id: 'sds_requirement',
          label: 'Safety data sheet supply requirement',
          type: 'select',
          ...REQ,
          options: opts('sdsRequirement', [
            { value: 'required', label: 'Must be supplied' },
            { value: 'on_request', label: 'Must be available on request' },
            { value: 'not_required', label: 'Not required after assessment' },
            { value: 'review', label: 'Assessment needed' },
          ]),
          helpText:
            'A web link does not by itself fulfil the duty to supply a safety data sheet under REACH Article 31.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'sds_url',
          label: 'Public safety data sheet URL',
          type: 'text',
          ...REQ,
          showWhen: when('sds_requirement', SDS_NEEDED),
          placeholder: 'https://...',
        }),
        f({
          id: 'sds_languages',
          label: 'Safety data sheet languages',
          type: 'text',
          ...REQ,
          showWhen: when('sds_requirement', SDS_NEEDED),
          placeholder: 'e.g., English, French, German',
        }),
        f({
          id: 'sds_revision_date',
          label: 'Safety data sheet revision date',
          type: 'text',
          ...REQ,
          showWhen: when('sds_requirement', SDS_NEEDED),
          placeholder: 'YYYY-MM-DD',
        }),
        f({
          id: 'emergency_contact',
          label: 'Emergency contact (poison centre or 24-hour number)',
          type: 'text',
          placeholder: 'Phone number for emergencies',
        }),
      ],
    ),

    section(
      'ingredients',
      'Ingredients and label information',
      'Label content under Annex V of Regulation (EU) 2026/405 and the current rules',
      [
        f({
          id: 'constituent_classes',
          label: 'Constituent classes added above 0.2% by weight',
          type: 'multi_select',
          options: opts(
            'constituentClass',
            DETERGENT_CONSTITUENT_CLASSES.map((c) => ({ ...c })),
          ),
          helpText:
            'Tick each class that is added above 0.2% by weight, then choose its weight range below (Annex V Part A point 1(h)(i)).',
        }),
        ...DETERGENT_CONSTITUENT_CLASSES.map((c) =>
          f({
            id: `band_${c.value}`,
            label: `${c.label}: weight range`,
            type: 'select',
            ...REQ,
            options: WEIGHT_BANDS,
            showWhen: includes('constituent_classes', c.value),
          }),
        ),
        f({
          id: 'listed_constituents',
          label: 'Constituent classes added at any concentration',
          type: 'multi_select',
          options: opts('listedConstituent', [
            { value: 'enzymes', label: 'Enzymes' },
            { value: 'micro_organisms', label: 'Micro-organisms' },
            { value: 'optical_brighteners', label: 'Optical brighteners' },
            { value: 'perfumes', label: 'Perfumes' },
            { value: 'disinfectants', label: 'Disinfectants (current rules until 23 September 2029)' },
          ]),
          helpText:
            'Annex V Part A point 1(h)(ii). Disinfectants are listed under the current rules and are no longer a listed class from 23 September 2029.',
        }),
        f({
          id: 'preservatives_present',
          label: 'Are preservatives present?',
          type: 'select',
          ...REQ,
          options: YES_NO_REVIEW,
          helpText:
            'Preservatives are listed under Annex V Part A point 1(h)(iii) unless already labelled under CLP Article 18(3)(b) or Biocidal Products Regulation Article 58.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'preservatives',
          label: 'Preservatives',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('preservatives_present', 'yes'),
          placeholder: 'e.g., Phenoxyethanol, Methylisothiazolinone',
          helpText: 'Use the INCI name where possible.',
        }),
        f({
          id: 'allergens_above_threshold',
          label: 'Fragrance allergens added above 0.01% by weight?',
          type: 'select',
          ...REQ,
          options: YES_NO_REVIEW,
          helpText:
            'Allergens from the list in Annex V Part D that are intentionally added above 0.01% by weight are named on the label, unless already labelled under CLP.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'fragrance_allergens',
          label: 'Fragrance allergens present',
          type: 'multi_select',
          options: [], // Rendered by the allergen picker (official Annex V Part D list)
          showWhen: when('allergens_above_threshold', 'yes'),
          helpText: 'Pick each allergen from the official list of 105 entries.',
        }),
        f({
          id: 'ingredients_url',
          label: 'Public ingredients web page',
          type: 'text',
          ...REQ,
          showWhen: when('use_sector', 'consumer'),
          placeholder: 'https://...',
          helpText:
            'The current rules (Regulation (EC) No 648/2004, Annex VII part D) require a maintained public ingredient list for consumer products. It needs no percentage ranges or CAS numbers.',
        }),
        f({
          id: 'professional_ingredient_info',
          label: 'Equivalent ingredient information supplied to professional users',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('use_sector', NON_DOMESTIC),
        }),
        f({
          id: 'biodegradability_test',
          label: 'Surfactant biodegradability test method',
          type: 'text',
          placeholder: 'e.g., OECD 301 series',
        }),
        f({
          id: 'biodegradability_reference',
          label: 'Biodegradability evidence reference',
          type: 'textarea',
          ...REQ,
          helpText:
            'Name the test report or supplier declaration. Do not upload or paste confidential files.',
        }),
        f({
          id: 'synthetic_polymer_microparticles',
          label: 'Contains intentionally added synthetic polymer microparticles?',
          type: 'select',
          options: YES_NO_UNKNOWN,
          helpText:
            'Regulation (EU) 2023/2055 restricts these under REACH Annex XVII entry 78. Detergents are reached from 17 October 2028.',
          warnWhen: {
            equals: ['yes', 'unknown'],
            message: DETERGENTS_WARNING_MESSAGES.microparticles,
            messageKey: warnKey('microparticles'),
          },
        }),
      ],
    ),

    section('use', 'Safe use and dosage', 'Dosage and use information under Annex V Part B', [
      f({
        id: 'use_instructions',
        label: 'Instructions for use and special precautions',
        type: 'textarea',
        ...PROSE,
        ...REQ,
        helpText: 'Method, suitable fabrics or surfaces, and any special precautions.',
      }),
      f({
        id: 'laundry_type',
        label: 'Laundry detergent type',
        type: 'select',
        showWhen: when('product_type', 'laundry'),
        options: opts('laundryType', [
          { value: 'heavy_duty', label: 'Heavy-duty' },
          { value: 'heavy_duty_short', label: 'Heavy-duty for short cycles' },
          { value: 'light_duty', label: 'Light-duty or delicate fabrics' },
        ]),
        helpText:
          'Decides the standard load: 4.5 kg of dry fabric for heavy-duty, 2.5 kg for short-cycle heavy-duty and for light-duty detergents.',
      }),
      f({
        id: 'dosage_unit',
        label: 'Dosage unit',
        type: 'select',
        showWhen: when('product_type', DOSAGE_TYPES),
        options: opts('dosageUnit', [
          { value: 'ml', label: 'Millilitres' },
          { value: 'g', label: 'Grams' },
          { value: 'units', label: 'Units (tablets, capsules or pods)' },
        ]),
      }),
      f({
        id: 'dosage_soft',
        label: 'Dose for soft water (per standard load)',
        type: 'number',
        showWhen: when('product_type', 'laundry'),
        placeholder: 'e.g., 60',
      }),
      f({
        id: 'dosage_medium',
        label: 'Dose for medium water (per standard load)',
        type: 'number',
        showWhen: when('product_type', 'laundry'),
        placeholder: 'e.g., 75',
      }),
      f({
        id: 'dosage_hard',
        label: 'Dose for hard water (per standard load)',
        type: 'number',
        showWhen: when('product_type', 'laundry'),
        placeholder: 'e.g., 90',
      }),
      f({
        id: 'dosage_two_cycle_note',
        label: 'Dosage for one-cycle and two-cycle wash processes',
        type: 'textarea',
        ...PROSE,
        showWhen: when('product_type', 'laundry'),
        helpText: 'Annex V Part B point 1(a) asks for dosage for one or two cycle washing processes.',
      }),
      f({
        id: 'loads_per_pack',
        label: 'Standard loads per pack (medium water, 2.5 millimoles CaCO3 per litre)',
        type: 'number',
        showWhen: when('product_type', 'laundry'),
        helpText:
          'For refills, give the number of loads per 1 litre or 1 kg of product. Not needed for refills in units.',
      }),
      f({
        id: 'measuring_cup_ml',
        label: 'Measuring cup capacity',
        type: 'number',
        showWhen: when('product_type', 'laundry'),
        helpText:
          'Capacity of any measuring cup supplied, with clear markings for soft, medium and hard water doses.',
      }),
      f({
        id: 'dishwasher_dose',
        label: 'Standard dose for the main cycle',
        type: 'number',
        showWhen: when('product_type', 'machine_dishwashing'),
        helpText: 'For normally soiled tableware in a fully loaded 12 place-setting dishwasher.',
      }),
      f({
        id: 'dishwasher_dose_hardness_note',
        label: 'Adjustment of the dose for water hardness',
        type: 'textarea',
        ...PROSE,
        showWhen: when('product_type', 'machine_dishwashing'),
      }),
      f({
        id: 'surface_dilution',
        label: 'Recommended dilution and quantity per surface area',
        type: 'textarea',
        ...PROSE,
        showWhen: when('product_type', SURFACE_TYPES),
        helpText:
          'Annex V Part B point 4: give the recommended dilution and quantity per surface area, or other use instructions, so the product is not used in excess.',
      }),
      f({
        id: 'phosphorus_per_dose_g',
        label: 'Total phosphorus in the recommended dose (grams)',
        type: 'number',
        showWhen: when('product_type', DOSAGE_TYPES),
        helpText:
          'Annex III limits: below 0.5 g per standard laundry load in hard water, and below 0.3 g per standard dishwasher dose.',
      }),
      f({
        id: 'storage_disposal',
        label: 'Storage and disposal',
        type: 'textarea',
        ...PROSE,
        ...REQ,
      }),
    ]),

    section('packaging', 'Packaging and recycling', 'Packaging, recyclability and refills', [
      f({
        id: 'packaging_material',
        label: 'Primary packaging material',
        type: 'select',
        options: opts('packagingMaterial', [
          { value: 'hdpe', label: 'HDPE (02)' },
          { value: 'pet', label: 'PET (01)' },
          { value: 'pp', label: 'PP (05)' },
          { value: 'other_plastic', label: 'Other plastic' },
          { value: 'metal', label: 'Metal' },
          { value: 'glass', label: 'Glass' },
          { value: 'paper_cardboard', label: 'Paper or cardboard' },
          { value: 'composite', label: 'Composite material' },
          { value: 'water_soluble_film', label: 'Water-soluble film' },
          { value: 'other', label: 'Other' },
        ]),
      }),
      f({ id: 'packaging_recyclable', label: 'Packaging recyclable?', type: 'checkbox' }),
      f({
        id: 'recycling_instructions',
        label: 'Recycling instructions',
        type: 'textarea',
        translatable: true,
      }),
      f({
        id: 'recycled_packaging_content',
        label: 'Recycled content in packaging (%)',
        type: 'number',
        placeholder: 'e.g., 30',
      }),
      f({ id: 'refill_available', label: 'Refill available?', type: 'checkbox' }),
      f({
        id: 'refill_station',
        label: 'Sold through a refill station?',
        type: 'checkbox',
        showWhen: when('refill_available', true),
        helpText: 'Refill points carry their own data carrier duty under Article 21(4) of Regulation (EU) 2026/405.',
      }),
      f({
        id: 'epr_registration',
        label: 'Packaging producer responsibility registration per market',
        type: 'textarea',
        placeholder: 'FR: ...\nDE: ...',
        helpText: 'One line per market.',
      }),
    ]),

    section(
      'biocide',
      'Biocidal product assessment',
      'Applies when disinfecting or antimicrobial claims are made',
      [
        f({
          id: 'biocidal_authorisation',
          label: 'Applicable authorisation or lawful transitional basis',
          type: 'textarea',
          ...PROSE,
          ...REQ,
        }),
        f({
          id: 'biocidal_actives',
          label: 'Active substances and authorised uses',
          type: 'textarea',
          ...PROSE,
          ...REQ,
        }),
      ],
      when('biocidal_claims', 'yes'),
    ),

    section(
      'green_claims',
      'Environmental claims',
      'Supports Directive (EU) 2024/825, which applies since 27 September 2026',
      [
        f({
          id: 'environmental_claims',
          label: 'Environmental claims made on the product or packaging',
          type: 'textarea',
          translatable: true,
          placeholder: 'e.g., "Bottle made with 30% recycled plastic"',
        }),
        f({
          id: 'claims_evidence_reference',
          label: 'Substantiation evidence reference',
          type: 'textarea',
          placeholder: 'Study, certificate or verification body reference for each claim',
        }),
        f({
          id: 'claims_avoid_generic_terms',
          label: 'Claims avoid generic environmental terms?',
          type: 'checkbox',
          helpText:
            'Generic claims such as eco-friendly or biodegradable are restricted from 27 September 2026 under Directive (EU) 2024/825.',
        }),
        f({
          id: 'ecolabel_licence_number',
          label: 'EU Ecolabel licence number',
          type: 'text',
          helpText:
            'Enter the licence registration number only if the product holds an EU Ecolabel licence. The badge is shown on the public passport only when a number is entered.',
        }),
      ],
    ),

    section(
      'review',
      'Supplier review and passport preparation',
      'Checks the supplier completes. The app cannot verify them.',
      [
        f({
          id: 'reach_review',
          label: 'REACH restrictions and duties assessed',
          type: 'select',
          ...REQ,
          options: opts('reachReview', [
            { value: 'reviewed', label: 'Reviewed by the supplier' },
            { value: 'review', label: 'Assessment needed' },
          ]),
          helpText:
            'Review the restrictions in Annex XVII and the duties that apply to the constituent substances.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'physical_label_reviewed',
          label: 'I have checked the physical label and the supplied safety information',
          type: 'checkbox',
          ...REQ,
        }),
        f({
          id: 'label_professional_indicator',
          label: 'The label states that the product is for professional use only',
          type: 'checkbox',
          showWhen: when('use_sector', NON_DOMESTIC),
        }),
        f({
          id: 'previous_passport_url',
          label: 'Link to the preceding passport, when this record replaces one',
          type: 'text',
          placeholder: 'https://...',
        }),
        f({
          id: 'data_review_date',
          label: 'Product information review date',
          type: 'text',
          placeholder: 'YYYY-MM-DD',
        }),
        f({
          id: 'conformity_reference',
          label: 'Manufacturer conformity evidence reference',
          type: 'text',
        }),
      ],
    ),

    section(
      'annex_identity',
      'Annex VI: product identity and manufacturer statement',
      'Preparation for the digital product passport required from 23 September 2029. A complete dataset is not a certification, a verified identifier or a registry submission.',
      [
        f({
          id: 'model_content_reference',
          label: 'Product content revision reference',
          type: 'text',
          ...REQ,
        }),
        f({
          id: 'manufacturing_process_reference',
          label: 'Manufacturing process revision reference',
          type: 'text',
          ...REQ,
        }),
        f({
          id: 'persistent_product_id',
          label: 'Persistent product identifier',
          type: 'text',
          ...REQ,
          helpText:
            'Enter the real identifier. An internal record ID is not an identifier issued under the standards referred to in the ESPR.',
        }),
        f({ id: 'identifier_scheme', label: 'Identifier scheme and issuer', type: 'text', ...REQ }),
        f({
          id: 'manufacturer_operator_id',
          label: 'Manufacturer unique operator identifier',
          type: 'text',
          ...REQ,
        }),
        f({
          id: 'backup_provider_url',
          label: 'Passport service provider holding the backup copy (URL)',
          type: 'text',
          ...REQ,
          placeholder: 'https://...',
          helpText: 'Name a provider you have actually arranged. The app does not create a backup service.',
        }),
        f({ id: 'backup_reference', label: 'Backup service agreement reference', type: 'text', ...REQ }),
        f({
          id: 'commodity_code_status',
          label: 'Customs commodity code',
          type: 'select',
          ...REQ,
          options: opts('commodityCodeStatus', [
            { value: 'applicable', label: 'Applicable' },
            { value: 'not_applicable', label: 'Not applicable after assessment' },
          ]),
        }),
        f({
          id: 'commodity_code',
          label: 'Commodity code (Regulation (EEC) No 2658/87)',
          type: 'text',
          ...REQ,
          showWhen: when('commodity_code_status', 'applicable'),
        }),
        f({
          id: 'commodity_code_reason',
          label: 'Reason no commodity code applies',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('commodity_code_status', 'not_applicable'),
        }),
        f({
          id: 'manufacturer_responsibility',
          label: 'The manufacturer issues this passport under its sole responsibility',
          type: 'checkbox',
          ...REQ,
        }),
        f({
          id: 'compliance_statement',
          label: 'Statement that compliance with Regulation (EU) 2026/405 has been demonstrated',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          helpText:
            "Complete this only after the manufacturer's own assessment. The app never generates a conformity statement.",
        }),
        f({
          id: 'applicable_union_law',
          label: 'Other Union law that applies to the product',
          type: 'textarea',
        }),
        f({
          id: 'last_placed_on_market_date',
          label: 'Latest date the model was placed on the market',
          type: 'text',
          placeholder: 'YYYY-MM-DD',
          helpText: 'The starting point for the ten-year availability duty.',
        }),
        f({
          id: 'carrier_placement',
          label: 'Where the data carrier is placed',
          type: 'textarea',
          ...REQ,
          helpText:
            'Article 21(4): physically present, indelible, machine-readable and visible before purchase, with the statement "Please scan for more comprehensive information on the product". Also required at refill stations and in distance sales.',
        }),
        f({
          id: 'carrier_reviewed',
          label: 'The data carrier meets these requirements',
          type: 'checkbox',
          ...REQ,
        }),
        f({
          id: 'market_language_reviewed',
          label: 'Label and safety wording are reviewed in every target market language',
          type: 'checkbox',
          ...REQ,
        }),
      ],
      IF_ANNEX_VI,
    ),

    section(
      'annex_substances',
      'Annex VI: substances',
      'Full list of intentionally added substances (Annex VI Part A point (h))',
      [
        f({
          id: 'substance_list_route',
          label: 'Substance disclosure route',
          type: 'select',
          ...REQ,
          options: opts('substanceListRoute', [
            { value: 'full_list', label: 'Full list of substances' },
            {
              value: 'equivalent_sds',
              label: 'Equivalent safety data sheet (industrial and institutional use only)',
            },
            { value: 'no_added_substances', label: 'No substances to list after assessment' },
          ]),
          helpText:
            'The exemption applies only to industrial and institutional detergents and surfactants where an equivalent safety data sheet under REACH Article 31 supplies the information.',
        }),
        f({
          id: 'substances',
          label: 'All intentionally added substances and label-required carry-over preservatives',
          type: 'substances',
          ...REQ,
          showWhen: when('substance_list_route', 'full_list'),
          helpText:
            'Identify substances as required by Article 18(3) of Regulation (EC) No 1272/2008. Do not enter concentrations or confidential formulation data. Everything saved in this category is public.',
        }),
        f({
          id: 'no_substances_reason',
          label: 'Basis for the absence of substances to list',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('substance_list_route', 'no_added_substances'),
        }),
        f({
          id: 'substance_list_complete',
          label:
            'The list is complete, includes qualifying carry-over preservatives and uses identities assessed under CLP Article 18(3)',
          type: 'checkbox',
          ...REQ,
          showWhen: when('substance_list_route', ['full_list', 'no_added_substances']),
        }),
        f({
          id: 'industrial_institutional_use',
          label: 'Used only outside the domestic sphere by specialised personnel',
          type: 'checkbox',
          ...REQ,
          showWhen: when('substance_list_route', 'equivalent_sds'),
        }),
        f({
          id: 'equivalent_sds_supplied',
          label:
            'Equivalent substance information has actually been supplied in a safety data sheet under REACH Article 31',
          type: 'checkbox',
          ...REQ,
          showWhen: when('substance_list_route', 'equivalent_sds'),
        }),
        f({
          id: 'annex_sds_url',
          label: 'Equivalent safety data sheet URL',
          type: 'text',
          ...REQ,
          showWhen: when('substance_list_route', 'equivalent_sds'),
          placeholder: 'https://...',
        }),
        f({
          id: 'annex_sds_languages',
          label: 'Equivalent safety data sheet languages',
          type: 'text',
          ...REQ,
          showWhen: when('substance_list_route', 'equivalent_sds'),
        }),
        f({
          id: 'annex_sds_revision_date',
          label: 'Equivalent safety data sheet revision date',
          type: 'text',
          ...REQ,
          showWhen: when('substance_list_route', 'equivalent_sds'),
          placeholder: 'YYYY-MM-DD',
        }),
      ],
      IF_ANNEX_VI,
    ),

    section(
      'annex_microorganisms',
      'Annex VI: micro-organisms',
      'All intentionally added micro-organisms (Annex VI Part A point (i))',
      [
        f({
          id: 'microorganisms_added',
          label: 'Are micro-organisms intentionally added?',
          type: 'select',
          ...REQ,
          options: YES_NO_REVIEW,
          helpText: 'The equivalent safety data sheet route never removes the micro-organism list.',
          warnWhen: assessmentWarn,
        }),
        f({
          id: 'microorganisms',
          label: 'All intentionally added micro-organisms',
          type: 'microorganisms',
          ...REQ,
          showWhen: when('microorganisms_added', 'yes'),
          helpText: 'Give genus, species and strain name or code for each micro-organism.',
        }),
        f({
          id: 'microorganism_safety_reference',
          label: 'Safety assessment reference (Annex II)',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('microorganisms_added', 'yes'),
        }),
        f({
          id: 'microorganism_shelf_life',
          label: 'Shelf life and storage conditions',
          type: 'textarea',
          ...PROSE,
          ...REQ,
          showWhen: when('microorganisms_added', 'yes'),
          helpText: 'The label of a detergent containing micro-organisms shows the shelf life.',
        }),
        f({
          id: 'food_contact_use',
          label: 'Intended for use on surfaces in contact with food?',
          type: 'select',
          options: YES_NO_REVIEW,
          showWhen: when('microorganisms_added', 'yes'),
          helpText:
            'Unless the product has been risk-assessed as safe for this use, the label says it is not to be used on food-contact surfaces.',
        }),
        f({
          id: 'food_contact_instructions',
          label: 'Precautions and instructions for food-contact surfaces',
          type: 'textarea',
          ...PROSE,
          showWhen: {
            field: 'microorganisms_added',
            equals: 'yes',
            and: [when('food_contact_use', 'yes')],
          },
        }),
      ],
      IF_ANNEX_VI,
    ),
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    const licence = data.ecolabel_licence_number;
    if (typeof licence === 'string' && licence.trim() !== '') logos.push('eu-ecolabel');
    return logos;
  }

  getInlineWarnings(data: Record<string, unknown>): {
    fieldId: string;
    messageKey: string;
    params?: Record<string, string | number>;
    message: string;
  }[] {
    const warnings: {
      fieldId: string;
      messageKey: string;
      params?: Record<string, string | number>;
      message: string;
    }[] = [];

    const push = (
      fieldId: string,
      name: DetergentsWarningName,
      params?: Record<string, string | number>,
    ) => {
      let message: string = DETERGENTS_WARNING_MESSAGES[name];
      for (const [k, v] of Object.entries(params ?? {})) {
        message = message.split(`{{${k}}}`).join(String(v));
      }
      warnings.push({ fieldId, messageKey: warnKey(name), ...(params ? { params } : {}), message });
    };

    const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
    const toNumber = (v: unknown): number | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    // Phosphorus limits (Annex III)
    const phosphorus = toNumber(data.phosphorus_per_dose_g);
    if (phosphorus !== undefined) {
      if (data.product_type === 'laundry' && phosphorus >= 0.5) {
        push('phosphorus_per_dose_g', 'phosphorusLaundry', { value: phosphorus });
      } else if (data.product_type === 'machine_dishwashing' && phosphorus >= 0.3) {
        push('phosphorus_per_dose_g', 'phosphorusDishwasher', { value: phosphorus });
      }
    }

    // Percentage range
    const recycled = toNumber(data.recycled_packaging_content);
    if (recycled !== undefined && (recycled < 0 || recycled > 100)) {
      push('recycled_packaging_content', 'percentageRange', { value: recycled });
    }

    // Dosage values must be positive
    for (const id of [
      'dosage_soft',
      'dosage_medium',
      'dosage_hard',
      'loads_per_pack',
      'measuring_cup_ml',
      'dishwasher_dose',
    ]) {
      const n = toNumber(data[id]);
      if (n !== undefined && n <= 0) push(id, 'positiveNumber', { value: n });
    }
    if (phosphorus !== undefined && phosphorus < 0) {
      push('phosphorus_per_dose_g', 'positiveNumber', { value: phosphorus });
    }

    // Allergen list
    if (
      data.allergens_above_threshold === 'yes' &&
      !(Array.isArray(data.fragrance_allergens) && data.fragrance_allergens.length > 0)
    ) {
      push('fragrance_allergens', 'allergensMissing');
    }

    // Micro-organism safety reference
    if (data.microorganisms_added === 'yes' && text(data.microorganism_safety_reference) === '') {
      push('microorganism_safety_reference', 'microorganismSafety');
    }

    // Format checks (non-blocking)
    const ufi = text(data.ufi_code);
    if (ufi && !/^[0-9A-HJKMNP-TV-Y]{4}(?:-[0-9A-HJKMNP-TV-Y]{4}){3}$/.test(ufi)) {
      push('ufi_code', 'ufiFormat');
    }
    for (const id of [
      'ingredients_url',
      'sds_url',
      'annex_sds_url',
      'previous_passport_url',
      'backup_provider_url',
    ]) {
      const v = text(data[id]);
      if (v && !isHttpUrl(v)) push(id, 'urlFormat');
    }
    for (const id of ['manufacturer_email', 'importer_email', 'eu_operator_email']) {
      const v = text(data[id]);
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) push(id, 'emailFormat');
    }
    for (const id of [
      'sds_revision_date',
      'annex_sds_revision_date',
      'data_review_date',
      'last_placed_on_market_date',
    ]) {
      const v = text(data[id]);
      if (v && !isValidDate(v)) push(id, 'dateFormat');
    }

    return warnings;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password;
  } catch {
    return false;
  }
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export const detergentsTemplate = new DetergentsTemplate();
