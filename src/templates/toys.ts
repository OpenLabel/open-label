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

import { BaseTemplate, TemplateOption, TemplateSection } from './base';

// Helper: build option lists with labelKey wired up to a namespace.
function opts(
  ns: string,
  entries: { value: string; label: string }[],
): TemplateOption[] {
  return entries.map((e) => ({
    value: e.value,
    label: e.label,
    labelKey: `toys.options.${ns}.${e.value}`,
  }));
}

export const TOY_OPERATOR_ID_TYPES = opts('operatorIdType', [
  { value: 'EORI', label: 'EORI' },
  { value: 'GLN', label: 'GLN' },
  { value: 'LEI', label: 'LEI' },
  { value: 'VAT', label: 'VAT number' },
  { value: 'NATIONAL', label: 'National company registration number' },
  { value: 'DUNS', label: 'DUNS' },
  { value: 'ESPR', label: 'ESPR / DPP operator identifier' },
  { value: 'other', label: 'Other' },
]);

export const TOY_CATEGORIES = opts('toyCategory', [
  { value: 'baby', label: 'Baby toy' },
  { value: 'plush', label: 'Plush toy' },
  { value: 'doll', label: 'Doll' },
  { value: 'action_figure', label: 'Action figure' },
  { value: 'construction', label: 'Construction toy / blocks' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'board_game', label: 'Board game' },
  { value: 'arts_crafts', label: 'Arts and crafts toy' },
  { value: 'slime', label: 'Slime / putty / modelling compound' },
  { value: 'chemical_set', label: 'Chemical toy set' },
  { value: 'cosmetic', label: 'Cosmetic toy / play make-up' },
  { value: 'olfactory', label: 'Olfactory board game' },
  { value: 'gustative', label: 'Gustative game' },
  { value: 'outdoor', label: 'Outdoor toy' },
  { value: 'activity', label: 'Activity toy' },
  { value: 'ride_on', label: 'Ride-on toy' },
  { value: 'wheeled', label: 'Scooter / skate / wheeled toy' },
  { value: 'aquatic', label: 'Aquatic toy' },
  { value: 'electronic', label: 'Electronic toy' },
  { value: 'radio', label: 'Radio-connected toy' },
  { value: 'internet', label: 'Internet-connected toy' },
  { value: 'ai', label: 'AI-enabled toy' },
  { value: 'battery', label: 'Toy with battery' },
  { value: 'magnets', label: 'Toy with magnets' },
  { value: 'drone', label: 'Toy drone' },
  { value: 'toy_in_food', label: 'Toy in food' },
  { value: 'other', label: 'Other' },
]);

/** Toy categories that should suggest extra EU legislation */
export const TOY_CATEGORY_LEGISLATION_HINTS: Record<string, string[]> = {
  electronic: ['LVD', 'EMC', 'RoHS'],
  radio: ['RED', 'EMC', 'RoHS'],
  internet: ['CRA', 'RED'],
  ai: ['AI_ACT'],
  battery: ['BATTERIES'],
  drone: ['DRONES', 'RED'],
  cosmetic: ['COSMETICS'],
};

/** Toy categories where age <= 36 months triggers warning */
export const YOUNG_CHILD_AGES = ['0_6m', '6_12m', '12_18m', '18_36m'];

export const TOY_AGE_GROUPS = opts('ageGroup', [
  { value: '0_6m', label: '0–6 months' },
  { value: '6_12m', label: '6–12 months' },
  { value: '12_18m', label: '12–18 months' },
  { value: '18_36m', label: '18–36 months' },
  { value: '3plus', label: '3+ years' },
  { value: '4plus', label: '4+ years' },
  { value: '5plus', label: '5+ years' },
  { value: '6plus', label: '6+ years' },
  { value: '7plus', label: '7+ years' },
  { value: '8plus', label: '8+ years' },
  { value: '10plus', label: '10+ years' },
  { value: '12plus', label: '12+ years' },
  { value: '14', label: '14 years' },
  { value: 'other', label: 'Other' },
]);

export const TOY_IDENTIFIER_TYPES = opts('identifierType', [
  { value: 'GTIN', label: 'GTIN' },
  { value: 'GS1_DL', label: 'GS1 Digital Link' },
  { value: 'EPC', label: 'EPC' },
  { value: 'SGTIN', label: 'Serialised GTIN' },
  { value: 'SKU', label: 'SKU' },
  { value: 'MODEL', label: 'Model number' },
  { value: 'ISO_15459', label: 'ISO/IEC 15459-compatible identifier' },
  { value: 'other', label: 'Other' },
]);

export const TOY_CN_CHAPTERS = opts('cnChapter', [
  { value: '32', label: '32 — Paints, pigments, inks, dyes' },
  { value: '33', label: '33 — Essential oils, perfumes, cosmetics' },
  { value: '34', label: '34 — Soaps, waxes, modelling pastes' },
  { value: '39', label: '39 — Plastics and articles thereof' },
  { value: '40', label: '40 — Rubber and articles thereof' },
  { value: '42', label: '42 — Leather articles' },
  { value: '44', label: '44 — Wood and articles of wood' },
  { value: '48', label: '48 — Paper and paperboard' },
  { value: '49', label: '49 — Printed books, pictures, cards' },
  { value: '61', label: '61 — Knitted clothing / textile accessories' },
  { value: '62', label: '62 — Non-knitted clothing / textile accessories' },
  { value: '63', label: '63 — Other made-up textile articles' },
  { value: '69', label: '69 — Ceramic products' },
  { value: '70', label: '70 — Glass and glassware' },
  { value: '73', label: '73 — Articles of iron or steel' },
  { value: '76', label: '76 — Aluminium articles' },
  { value: '85', label: '85 — Electrical machinery and equipment' },
  { value: '87', label: '87 — Vehicles and parts' },
  { value: '90', label: '90 — Optical, measuring, checking instruments' },
  { value: '95', label: '95 — Toys, games and sports requisites' },
  { value: 'other', label: 'Other' },
]);

export const TOY_LEGISLATION = opts('legislation', [
  { value: 'TSR', label: 'Regulation (EU) 2025/2509 — Toy Safety Regulation' },
  { value: 'GPSR', label: 'Regulation (EU) 2023/988 — General Product Safety Regulation' },
  { value: 'MSR', label: 'Regulation (EU) 2019/1020 — Market surveillance' },
  { value: 'AI_ACT', label: 'Regulation (EU) 2024/1689 — Artificial Intelligence Act' },
  { value: 'CRA', label: 'Regulation (EU) 2024/2847 — Cyber Resilience Act' },
  { value: 'RED', label: 'Directive 2014/53/EU — Radio Equipment Directive' },
  { value: 'LVD', label: 'Directive 2014/35/EU — Low Voltage Directive' },
  { value: 'EMC', label: 'Directive 2014/30/EU — EMC Directive' },
  { value: 'RoHS', label: 'Directive 2011/65/EU — RoHS' },
  { value: 'BATTERIES', label: 'Regulation (EU) 2023/1542 — Batteries Regulation' },
  { value: 'DRONES', label: 'Delegated Regulation (EU) 2019/945 — UAS / drones' },
  { value: 'COSMETICS', label: 'Regulation (EC) No 1223/2009 — Cosmetic Products' },
  { value: 'REACH', label: 'Regulation (EC) No 1907/2006 — REACH' },
  { value: 'CLP', label: 'Regulation (EC) No 1272/2008 — CLP' },
  { value: 'other', label: 'Other' },
]);

export const TOY_STANDARDS = opts('standards', [
  { value: 'EN71_1', label: 'EN 71-1 — Mechanical and physical properties' },
  { value: 'EN71_2', label: 'EN 71-2 — Flammability' },
  { value: 'EN71_3', label: 'EN 71-3 — Migration of certain elements' },
  { value: 'EN71_4', label: 'EN 71-4 — Experimental sets for chemistry' },
  { value: 'EN71_5', label: 'EN 71-5 — Chemical toys other than experimental sets' },
  { value: 'EN71_7', label: 'EN 71-7 — Finger paints' },
  { value: 'EN71_8', label: 'EN 71-8 — Activity toys for domestic use' },
  { value: 'EN71_12', label: 'EN 71-12 — N-nitrosamines and N-nitrosatable substances' },
  { value: 'EN71_13', label: 'EN 71-13 — Olfactory board games, cosmetic kits and gustative games' },
  { value: 'EN71_14', label: 'EN 71-14 — Trampolines for domestic use' },
  { value: 'EN_IEC_62115', label: 'EN IEC 62115 — Electric toys' },
  { value: 'other', label: 'Other harmonised standard' },
  { value: 'common_spec', label: 'Common specification instead of harmonised standard' },
]);

export const TOY_SAFETY_CHANNELS = opts('safetyChannel', [
  { value: 'phone', label: 'Telephone' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Dedicated website' },
  { value: 'form', label: 'Contact form' },
]);

export const TOY_EU_OPERATOR_ROLES = opts('euOperatorRole', [
  { value: 'importer', label: 'Importer' },
  { value: 'auth_rep', label: 'Authorised representative' },
  { value: 'fulfilment', label: 'Fulfilment service provider' },
  { value: 'distributor', label: 'Distributor acting as responsible economic operator' },
  { value: 'other', label: 'Other EU-based responsible person (Reg. 2019/1020 Art. 4)' },
]);

const YES_NO = opts('yesNo', [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]);

const YES_NO_UNKNOWN = opts('yesNoUnknown', [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Unknown' },
]);

export const EU_SAFETY_GATE_URL =
  'https://ec.europa.eu/safety-gate-alerts/screen/webReport';

// Helper to attach standard labelKey/helpKey/placeholderKey to a question
type FieldDef = Omit<import('./base').TemplateQuestion, 'labelKey' | 'helpKey' | 'placeholderKey'>;
function f(q: FieldDef): import('./base').TemplateQuestion {
  const out: import('./base').TemplateQuestion = {
    ...q,
    labelKey: `toys.fields.${q.id}.label`,
  };
  if (q.helpText) out.helpKey = `toys.fields.${q.id}.help`;
  if (q.placeholder) out.placeholderKey = `toys.fields.${q.id}.placeholder`;
  return out;
}

function section(
  id: string,
  title: string,
  description: string | undefined,
  questions: import('./base').TemplateQuestion[],
): TemplateSection {
  return {
    id,
    title,
    titleKey: `toys.sections.${id}.title`,
    description,
    descriptionKey: description ? `toys.sections.${id}.description` : undefined,
    questions,
  };
}

export class ToysTemplate extends BaseTemplate {
  id = 'toys';
  name = 'Toys';
  description =
    'Digital Product Passport for toys per Regulation (EU) 2025/2509';
  icon = '🧸';

  sections: TemplateSection[] = [
    section(
      'manufacturer_responsibility',
      'Manufacturer responsibility',
      'This Digital Product Passport is issued under the sole responsibility of the manufacturer.',
      [
        f({
          id: 'manufacturer_responsibility_confirmed',
          label:
            'I confirm this DPP is issued under the sole responsibility of the manufacturer.',
          type: 'checkbox',
          required: true,
          badge: 'required',
        }),
      ],
    ),
    section(
      'product_identity',
      'Product identity',
      'Each toy model or variant needs its own DPP.',
      [
        f({ id: 'brand_name', label: 'Brand name', type: 'text', required: true, badge: 'required', translatable: true, autoTranslate: false }),
        f({ id: 'model_name', label: 'Model name or model number', type: 'text', required: true, badge: 'required' }),
        f({
          id: 'sku',
          label: 'SKU or variant ID',
          type: 'text',
          required: true,
          badge: 'required',
          helpText:
            'Use a separate DPP for each variant (colour, size, material, electronic version, bundled version).',
        }),
        f({ id: 'toy_category', label: 'Toy category', type: 'select', required: true, badge: 'required', options: TOY_CATEGORIES }),
        f({ id: 'toy_category_other', label: 'Toy category (specify)', type: 'text', showWhen: { field: 'toy_category', equals: 'other' } }),
        f({ id: 'age_group', label: 'Intended age group', type: 'select', required: true, badge: 'required', options: TOY_AGE_GROUPS }),
        f({ id: 'age_group_other', label: 'Age group (specify)', type: 'text', showWhen: { field: 'age_group', equals: 'other' } }),
        f({
          id: 'mouth_contact',
          label: 'Is this toy intended to be placed in the mouth?',
          type: 'select',
          required: true,
          badge: 'required',
          options: YES_NO,
          helpText:
            'Stricter allergenic fragrance and chemical restrictions apply for mouth-contact toys.',
        }),
        f({
          id: 'unique_product_identifier',
          label: 'Unique product identifier',
          type: 'text',
          required: true,
          badge: 'required',
          helpText:
            'Persistent identifier for this toy model/SKU/variant. Should be compatible with ESPR / ISO IEC 15459-style identification when final specs are confirmed.',
        }),
        f({ id: 'identifier_type', label: 'Identifier type', type: 'select', required: true, badge: 'required', options: TOY_IDENTIFIER_TYPES }),
        f({ id: 'identifier_type_other', label: 'Identifier type (specify)', type: 'text', showWhen: { field: 'identifier_type', equals: 'other' } }),
        f({
          id: 'has_instructions_warnings',
          label: 'Does this toy require instructions, warnings, or safety information?',
          type: 'select',
          required: true,
          badge: 'required',
          options: YES_NO,
        }),
        f({
          id: 'public_instructions_warnings',
          label: 'Public instructions and warnings',
          type: 'textarea',
          required: true,
          badge: 'required',
          translatable: true,
          helpText:
            'Add the warnings, instructions, and safety information that accompany the toy.',
          showWhen: { field: 'has_instructions_warnings', equals: 'yes' },
        }),
      ],
    ),
    section(
      'manufacturer',
      'Manufacturer',
      'Legal entity responsible for placing the toy on the market.',
      [
        f({ id: 'manufacturer_legal_name', label: 'Manufacturer legal name', type: 'text', required: true, badge: 'required' }),
        f({ id: 'manufacturer_street', label: 'Street address', type: 'text', required: true, badge: 'required' }),
        f({ id: 'manufacturer_city', label: 'City', type: 'text', required: true, badge: 'required' }),
        f({ id: 'manufacturer_postal_code', label: 'Postal code', type: 'text', required: true, badge: 'required' }),
        f({ id: 'manufacturer_country', label: 'Country', type: 'text', required: true, badge: 'required' }),
        f({ id: 'manufacturer_email', label: 'Electronic address (email)', type: 'text', required: true, badge: 'required', placeholder: 'name@company.com' }),
        f({ id: 'manufacturer_website', label: 'Website', type: 'text', placeholder: 'https://...', badge: 'where_applicable' }),
        f({
          id: 'manufacturer_operator_id',
          label: 'Unique operator identifier',
          type: 'text',
          required: true,
          badge: 'required',
          helpText:
            'Use the best available operator identifier now; final required format may be defined by the implementing act.',
        }),
        f({ id: 'manufacturer_operator_id_type', label: 'Operator identifier type', type: 'select', required: true, badge: 'required', options: TOY_OPERATOR_ID_TYPES }),
      ],
    ),
    section('auth_rep', 'Authorised representative', 'Where applicable.', [
      f({ id: 'has_auth_rep', label: 'Does the manufacturer have an authorised representative?', type: 'select', required: true, options: YES_NO, badge: 'required' }),
      f({ id: 'auth_rep_legal_name', label: 'Authorised representative legal name', type: 'text', badge: 'where_applicable', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_street', label: 'Street address', type: 'text', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_city', label: 'City', type: 'text', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_postal_code', label: 'Postal code', type: 'text', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_country', label: 'Country', type: 'text', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_email', label: 'Electronic address (email)', type: 'text', placeholder: 'name@company.com', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_operator_id', label: 'Unique operator identifier', type: 'text', showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
      f({ id: 'auth_rep_operator_id_type', label: 'Operator identifier type', type: 'select', options: TOY_OPERATOR_ID_TYPES, showWhen: { field: 'has_auth_rep', equals: 'yes' } }),
    ]),
    section(
      'eu_operator',
      'EU responsible economic operator',
      'Required when the manufacturer is established outside the EU.',
      [
        f({ id: 'manufacturer_non_eu', label: 'Is the manufacturer established outside the EU?', type: 'select', required: true, options: YES_NO, badge: 'required' }),
        f({ id: 'eu_op_legal_name', label: 'EU responsible operator legal name', type: 'text', badge: 'where_applicable', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_role', label: 'Role', type: 'select', options: TOY_EU_OPERATOR_ROLES, showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_street', label: 'Street address', type: 'text', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_city', label: 'City', type: 'text', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_postal_code', label: 'Postal code', type: 'text', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_country', label: 'Country', type: 'text', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_email', label: 'Electronic address (email)', type: 'text', placeholder: 'name@company.com', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_operator_id', label: 'Unique operator identifier', type: 'text', showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
        f({ id: 'eu_op_operator_id_type', label: 'Operator identifier type', type: 'select', options: TOY_OPERATOR_ID_TYPES, showWhen: { field: 'manufacturer_non_eu', equals: 'yes' } }),
      ],
    ),
    section(
      'compliance',
      'Compliance',
      'CE marking, applicable EU legislation and standards.',
      [
        f({
          id: 'ce_declaration_ack',
          label:
            'The manufacturer declares that this toy complies with the applicable EU safety requirements and bears or will bear the CE marking where required before being placed on the EU market.',
          type: 'checkbox',
          required: true,
          badge: 'required',
          helpText:
            'Only toys bearing CE marking can be placed on the EU market. This declaration should be consistent with the manufacturer\u2019s conformity assessment.',
        }),
        
        f({
          id: 'eu_doc_available',
          label: 'EU Declaration of Conformity available?',
          type: 'select',
          required: true,
          badge: 'required',
          options: YES_NO_UNKNOWN,
          warnWhen: {
            equals: ['no', 'unknown'],
            message:
              'The EU Declaration of Conformity is expected as part of the toy conformity framework. Complete this before relying on the DPP for market-facing use.',
            messageKey: 'toys.fields.eu_doc_available.warn',
          },
        }),
        f({
          id: 'eu_doc_reference',
          label: 'Declaration of Conformity reference',
          type: 'text',
          required: true,
          badge: 'required',
          showWhen: { field: 'eu_doc_available', equals: 'yes' },
        }),
        f({
          id: 'eu_doc_upload',
          label: 'Declaration of Conformity upload',
          type: 'file',
          badge: 'where_applicable',
          accept: 'application/pdf,image/*',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText:
            'Internal record only. The uploaded file is kept for the manufacturer and is not shown on the public DPP.',
          showWhen: { field: 'eu_doc_available', equals: 'yes' },
        }),
        f({
          id: 'safety_assessment_completed',
          label: 'Safety assessment completed?',
          type: 'select',
          required: true,
          badge: 'required',
          options: YES_NO_UNKNOWN,
          helpText:
            'Toy manufacturers must assess chemical, physical, mechanical, electrical, flammability, hygiene, radioactivity and exposure risks where relevant.',
          warnWhen: {
            equals: ['no', 'unknown'],
            message:
              'Safety assessment information should be completed before relying on this DPP.',
            messageKey: 'toys.fields.safety_assessment_completed.warn',
          },
        }),
        f({
          id: 'technical_documentation_available',
          label: 'Technical documentation available?',
          type: 'select',
          required: true,
          badge: 'required',
          options: YES_NO_UNKNOWN,
          helpText:
            'Technical documentation supports the demonstration that the toy complies with applicable safety requirements.',
          warnWhen: {
            equals: ['no', 'unknown'],
            message:
              'Technical documentation may be required by market surveillance authorities.',
            messageKey: 'toys.fields.technical_documentation_available.warn',
          },
        }),
        f({
          id: 'technical_documentation_upload',
          label: 'Technical documentation upload',
          type: 'file',
          badge: 'where_applicable',
          accept: 'application/pdf,image/*',
          maxBytes: 5 * 1024 * 1024,
          internal: true,
          helpText:
            'Internal record only. The uploaded file is kept for the manufacturer and is not shown on the public DPP.',
          showWhen: { field: 'technical_documentation_available', equals: 'yes' },
        }),
        f({ id: 'applicable_legislation', label: 'Applicable EU legislation', type: 'multi_select', required: true, badge: 'required', options: TOY_LEGISLATION, defaultValue: ['TSR'] }),
        f({ id: 'harmonised_standards', label: 'Harmonised standards used', type: 'multi_select', required: true, badge: 'required', options: TOY_STANDARDS }),
        f({ id: 'common_specifications', label: 'Common specifications used', type: 'textarea', badge: 'where_applicable', translatable: true, placeholder: 'Describe the common specifications applied.', showWhen: { field: 'harmonised_standards', equals: 'common_spec', includes: true } }),
        f({ id: 'other_standards', label: 'Other standards used (one per line)', type: 'textarea', badge: 'where_applicable', translatable: true, showWhen: { field: 'harmonised_standards', equals: 'other', includes: true } }),
      ],
    ),
    section(
      'notified_body',
      'Conformity assessment & notified body',
      'Where applicable.',
      [
        f({ id: 'notified_body_involved', label: 'Was a notified body involved?', type: 'select', required: true, options: YES_NO, badge: 'required' }),
        f({ id: 'notified_body_name', label: 'Notified body name', type: 'text', badge: 'where_applicable', showWhen: { field: 'notified_body_involved', equals: 'yes' } }),
        f({ id: 'notified_body_number', label: 'Notified body number', type: 'text', placeholder: 'e.g., 0123', showWhen: { field: 'notified_body_involved', equals: 'yes' } }),
        f({ id: 'certificate_reference', label: 'Certificate reference', type: 'text', showWhen: { field: 'notified_body_involved', equals: 'yes' } }),
        f({ id: 'certificate_issue_date', label: 'Certificate issue date (YYYY-MM-DD)', type: 'text', placeholder: 'YYYY-MM-DD', showWhen: { field: 'notified_body_involved', equals: 'yes' } }),
        f({
          id: 'notified_body_certificate_url',
          label: 'Conformity certificate (PDF or image)',
          type: 'file',
          badge: 'where_applicable',
          helpText: 'Optional. The uploaded file is publicly accessible from the DPP.',
          accept: 'application/pdf,image/*',
          maxBytes: 5 * 1024 * 1024,
          showWhen: { field: 'notified_body_involved', equals: 'yes' },
        }),
      ],
    ),
    section(
      'customs',
      'Customs commodity code',
      'Generated as 9880 + CN chapter + 00. Editable.',
      [
        f({ id: 'cn_chapter', label: 'CN chapter', type: 'select', required: true, badge: 'required', options: TOY_CN_CHAPTERS }),
        f({
          id: 'customs_code',
          label: 'Customs commodity code',
          type: 'text',
          placeholder: '98809500',
          helpText:
            'Auto-filled from CN chapter. Override if your customs classification differs.',
          badge: 'where_applicable',
        }),
      ],
    ),
    section(
      'allergenic_fragrances',
      'Allergenic fragrances',
      'Substances subject to labelling requirements at ≥10 mg/kg.',
      [
        f({
          id: 'has_allergenic_fragrances',
          label:
            'Does the toy or any component contain allergenic fragrances at ≥10 mg/kg?',
          type: 'select',
          required: true,
          options: YES_NO_UNKNOWN,
          badge: 'required',
        }),
        f({
          id: 'allergenic_fragrances',
          label: 'Allergenic fragrances present',
          type: 'multi_select',
          badge: 'where_applicable',
          options: [], // Rendered by FragrancePicker custom component
          showWhen: { field: 'has_allergenic_fragrances', equals: 'yes' },
        }),
        f({
          id: 'allergen_declaration_text',
          label: 'Allergen declaration (optional override)',
          helpText:
            'Leave empty to display the standard localized declaration automatically. Fill only to provide a custom wording; use the translation editor for per-language versions.',
          type: 'textarea',
          translatable: true,
          showWhen: { field: 'has_allergenic_fragrances', equals: 'yes' },
        }),
      ],
    ),
    section(
      'safety_reporting',
      'Safety incident reporting',
      'Channels available to consumers and authorities.',
      [
        f({ id: 'safety_channels', label: 'Public safety reporting channels', type: 'multi_select', required: true, badge: 'required', options: TOY_SAFETY_CHANNELS }),
        f({ id: 'safety_phone', label: 'Safety reporting telephone', type: 'text', placeholder: '+33 ...', showWhen: { field: 'safety_channels', equals: 'phone', includes: true } }),
        f({ id: 'safety_email', label: 'Safety reporting email', type: 'text', placeholder: 'safety@company.com', showWhen: { field: 'safety_channels', equals: 'email', includes: true } }),
        f({ id: 'safety_website', label: 'Safety reporting website / contact form URL', type: 'text', placeholder: 'https://...', showWhen: { field: 'safety_channels', equals: ['website', 'form'], includes: true } }),
      ],
    ),
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.ce_declaration_ack || data.ce_marked) logos.push('ce');
    return logos;
  }
}

export const toysTemplate = new ToysTemplate();
