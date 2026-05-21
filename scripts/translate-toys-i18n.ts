/* eslint-disable @typescript-eslint/no-explicit-any */
// One-off generator: writes the complete toys.* i18n subtree into en.json
// and translates it into every other EU locale via the Lovable AI Gateway.
//
// Usage:
//   bun run scripts/translate-toys-i18n.ts            # translate all 23 langs
//   bun run scripts/translate-toys-i18n.ts fr de el   # translate subset
//
// Source of truth = the `toys` object below. Re-run after editing toys.ts /
// component strings to refresh translations.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');

const LANGUAGE_NAMES: Record<string, string> = {
  bg: 'Bulgarian', cs: 'Czech', da: 'Danish', de: 'German', el: 'Greek',
  es: 'Spanish', et: 'Estonian', fi: 'Finnish', fr: 'French', ga: 'Irish',
  hr: 'Croatian', hu: 'Hungarian', it: 'Italian', lt: 'Lithuanian',
  lv: 'Latvian', mt: 'Maltese', nl: 'Dutch', pl: 'Polish', pt: 'Portuguese',
  ro: 'Romanian', sk: 'Slovak', sl: 'Slovenian', sv: 'Swedish',
};

// -------------------------------------------------------------------------
// Source of truth: every toys.* string the app references, in English.
// -------------------------------------------------------------------------
const COMMON_ADDITIONS: Record<string, string> = {
  required: 'Required',
  whereApplicable: 'Where applicable',
  tbdImplementingAct: 'TBD — implementing act',
};

const TOYS: Record<string, any> = {
  sections: {
    manufacturer_responsibility: {
      title: 'Manufacturer responsibility',
      description:
        'This Digital Product Passport is issued under the sole responsibility of the manufacturer.',
    },
    product_identity: {
      title: 'Product identity',
      description: 'Each toy model or variant needs its own DPP.',
    },
    manufacturer: {
      title: 'Manufacturer',
      description: 'Legal entity responsible for placing the toy on the market.',
    },
    auth_rep: { title: 'Authorised representative', description: 'Where applicable.' },
    eu_operator: {
      title: 'EU responsible economic operator',
      description: 'Required when the manufacturer is established outside the EU.',
    },
    compliance: {
      title: 'Compliance',
      description: 'CE marking, applicable EU legislation and standards.',
    },
    notified_body: {
      title: 'Conformity assessment & notified body',
      description: 'Where applicable.',
    },
    customs: {
      title: 'Customs commodity code',
      description: 'Generated as 9880 + CN chapter + 00. Editable.',
    },
    allergenic_fragrances: {
      title: 'Allergenic fragrances',
      description: 'Substances subject to labelling requirements at ≥10 mg/kg.',
    },
    safety_reporting: {
      title: 'Safety incident reporting',
      description: 'Channels available to consumers and authorities.',
    },
  },
  fields: {
    manufacturer_responsibility_confirmed: {
      label: 'I confirm this DPP is issued under the sole responsibility of the manufacturer.',
    },
    brand_name: { label: 'Brand name' },
    model_name: { label: 'Model name or model number' },
    sku: {
      label: 'SKU or variant ID',
      help: 'Use a separate DPP for each variant (colour, size, material, electronic version, bundled version).',
    },
    toy_category: { label: 'Toy category' },
    toy_category_other: { label: 'Toy category (specify)' },
    age_group: { label: 'Intended age group' },
    age_group_other: { label: 'Age group (specify)' },
    mouth_contact: {
      label: 'Is this toy intended to be placed in the mouth?',
      help: 'Stricter allergenic fragrance and chemical restrictions apply for mouth-contact toys.',
    },
    unique_product_identifier: {
      label: 'Unique product identifier',
      help: 'Persistent identifier for this toy model/SKU/variant. Should be compatible with ESPR / ISO IEC 15459-style identification when final specs are confirmed.',
    },
    identifier_type: { label: 'Identifier type' },
    identifier_type_other: { label: 'Identifier type (specify)' },
    manufacturer_legal_name: { label: 'Manufacturer legal name' },
    manufacturer_street: { label: 'Street address' },
    manufacturer_city: { label: 'City' },
    manufacturer_postal_code: { label: 'Postal code' },
    manufacturer_country: { label: 'Country' },
    manufacturer_email: { label: 'Electronic address (email)', placeholder: 'name@company.com' },
    manufacturer_website: { label: 'Website', placeholder: 'https://...' },
    manufacturer_operator_id: {
      label: 'Unique operator identifier',
      help: 'Use the best available operator identifier now; final required format may be defined by the implementing act.',
    },
    manufacturer_operator_id_type: { label: 'Operator identifier type' },
    has_auth_rep: { label: 'Does the manufacturer have an authorised representative?' },
    auth_rep_legal_name: { label: 'Authorised representative legal name' },
    auth_rep_street: { label: 'Street address' },
    auth_rep_city: { label: 'City' },
    auth_rep_postal_code: { label: 'Postal code' },
    auth_rep_country: { label: 'Country' },
    auth_rep_email: { label: 'Electronic address (email)', placeholder: 'name@company.com' },
    auth_rep_operator_id: { label: 'Unique operator identifier' },
    auth_rep_operator_id_type: { label: 'Operator identifier type' },
    manufacturer_non_eu: { label: 'Is the manufacturer established outside the EU?' },
    eu_op_legal_name: { label: 'EU responsible operator legal name' },
    eu_op_role: { label: 'Role' },
    eu_op_street: { label: 'Street address' },
    eu_op_city: { label: 'City' },
    eu_op_postal_code: { label: 'Postal code' },
    eu_op_country: { label: 'Country' },
    eu_op_email: { label: 'Electronic address (email)', placeholder: 'name@company.com' },
    eu_op_operator_id: { label: 'Unique operator identifier' },
    eu_op_operator_id_type: { label: 'Operator identifier type' },
    ce_marked: { label: 'CE marked (mandatory for toys sold in the EU)' },
    applicable_legislation: { label: 'Applicable EU legislation' },
    harmonised_standards: { label: 'Harmonised standards used' },
    common_specifications: {
      label: 'Common specifications used',
      placeholder: 'Describe the common specifications applied.',
    },
    other_standards: { label: 'Other standards used (one per line)' },
    notified_body_involved: { label: 'Was a notified body involved?' },
    notified_body_name: { label: 'Notified body name' },
    notified_body_number: { label: 'Notified body number', placeholder: 'e.g., 0123' },
    certificate_reference: { label: 'Certificate reference' },
    certificate_issue_date: {
      label: 'Certificate issue date (YYYY-MM-DD)',
      placeholder: 'YYYY-MM-DD',
    },
    notified_body_certificate_url: {
      label: 'Conformity certificate (PDF or image)',
      help: 'Optional. The uploaded file is publicly accessible from the DPP.',
    },
    cn_chapter: { label: 'CN chapter' },
    customs_code: {
      label: 'Customs commodity code',
      placeholder: '98809500',
      help: 'Auto-filled from CN chapter. Override if your customs classification differs.',
    },
    has_allergenic_fragrances: {
      label: 'Does the toy or any component contain allergenic fragrances at ≥10 mg/kg?',
    },
    allergenic_fragrances: { label: 'Allergenic fragrances present' },
    allergen_declaration_text: { label: 'Allergen declaration (auto-generated, editable)' },
    safety_channels: { label: 'Public safety reporting channels' },
    safety_phone: { label: 'Safety reporting telephone', placeholder: '+33 ...' },
    safety_email: { label: 'Safety reporting email', placeholder: 'safety@company.com' },
    safety_website: {
      label: 'Safety reporting website / contact form URL',
      placeholder: 'https://...',
    },
  },
  options: {
    operatorIdType: {
      EORI: 'EORI', GLN: 'GLN', LEI: 'LEI', VAT: 'VAT number',
      NATIONAL: 'National company registration number', DUNS: 'DUNS',
      ESPR: 'ESPR / DPP operator identifier', other: 'Other',
    },
    toyCategory: {
      baby: 'Baby toy', plush: 'Plush toy', doll: 'Doll', action_figure: 'Action figure',
      construction: 'Construction toy / blocks', puzzle: 'Puzzle', board_game: 'Board game',
      arts_crafts: 'Arts and crafts toy', slime: 'Slime / putty / modelling compound',
      chemical_set: 'Chemical toy set', cosmetic: 'Cosmetic toy / play make-up',
      olfactory: 'Olfactory board game', gustative: 'Gustative game', outdoor: 'Outdoor toy',
      activity: 'Activity toy', ride_on: 'Ride-on toy', wheeled: 'Scooter / skate / wheeled toy',
      aquatic: 'Aquatic toy', electronic: 'Electronic toy', radio: 'Radio-connected toy',
      internet: 'Internet-connected toy', ai: 'AI-enabled toy', battery: 'Toy with battery',
      magnets: 'Toy with magnets', drone: 'Toy drone', toy_in_food: 'Toy in food', other: 'Other',
    },
    ageGroup: {
      '0_6m': '0–6 months', '6_12m': '6–12 months', '12_18m': '12–18 months',
      '18_36m': '18–36 months', '3plus': '3+ years', '4plus': '4+ years',
      '5plus': '5+ years', '6plus': '6+ years', '7plus': '7+ years', '8plus': '8+ years',
      '10plus': '10+ years', '12plus': '12+ years', '14': '14 years', other: 'Other',
    },
    identifierType: {
      GTIN: 'GTIN', GS1_DL: 'GS1 Digital Link', EPC: 'EPC', SGTIN: 'Serialised GTIN',
      SKU: 'SKU', MODEL: 'Model number', ISO_15459: 'ISO/IEC 15459-compatible identifier',
      other: 'Other',
    },
    cnChapter: {
      '32': '32 — Paints, pigments, inks, dyes',
      '33': '33 — Essential oils, perfumes, cosmetics',
      '34': '34 — Soaps, waxes, modelling pastes',
      '39': '39 — Plastics and articles thereof',
      '40': '40 — Rubber and articles thereof',
      '42': '42 — Leather articles',
      '44': '44 — Wood and articles of wood',
      '48': '48 — Paper and paperboard',
      '49': '49 — Printed books, pictures, cards',
      '61': '61 — Knitted clothing / textile accessories',
      '62': '62 — Non-knitted clothing / textile accessories',
      '63': '63 — Other made-up textile articles',
      '69': '69 — Ceramic products',
      '70': '70 — Glass and glassware',
      '73': '73 — Articles of iron or steel',
      '76': '76 — Aluminium articles',
      '85': '85 — Electrical machinery and equipment',
      '87': '87 — Vehicles and parts',
      '90': '90 — Optical, measuring, checking instruments',
      '95': '95 — Toys, games and sports requisites',
      other: 'Other',
    },
    legislation: {
      TSR: 'Regulation (EU) 2025/2509 — Toy Safety Regulation',
      GPSR: 'Regulation (EU) 2023/988 — General Product Safety Regulation',
      MSR: 'Regulation (EU) 2019/1020 — Market surveillance',
      AI_ACT: 'Regulation (EU) 2024/1689 — Artificial Intelligence Act',
      CRA: 'Regulation (EU) 2024/2847 — Cyber Resilience Act',
      RED: 'Directive 2014/53/EU — Radio Equipment Directive',
      LVD: 'Directive 2014/35/EU — Low Voltage Directive',
      EMC: 'Directive 2014/30/EU — EMC Directive',
      RoHS: 'Directive 2011/65/EU — RoHS',
      BATTERIES: 'Regulation (EU) 2023/1542 — Batteries Regulation',
      DRONES: 'Delegated Regulation (EU) 2019/945 — UAS / drones',
      COSMETICS: 'Regulation (EC) No 1223/2009 — Cosmetic Products',
      REACH: 'Regulation (EC) No 1907/2006 — REACH',
      CLP: 'Regulation (EC) No 1272/2008 — CLP',
      other: 'Other',
    },
    standards: {
      EN71_1: 'EN 71-1 — Mechanical and physical properties',
      EN71_2: 'EN 71-2 — Flammability',
      EN71_3: 'EN 71-3 — Migration of certain elements',
      EN71_4: 'EN 71-4 — Experimental sets for chemistry',
      EN71_5: 'EN 71-5 — Chemical toys other than experimental sets',
      EN71_7: 'EN 71-7 — Finger paints',
      EN71_8: 'EN 71-8 — Activity toys for domestic use',
      EN71_12: 'EN 71-12 — N-nitrosamines and N-nitrosatable substances',
      EN71_13: 'EN 71-13 — Olfactory board games, cosmetic kits and gustative games',
      EN71_14: 'EN 71-14 — Trampolines for domestic use',
      EN_IEC_62115: 'EN IEC 62115 — Electric toys',
      other: 'Other harmonised standard',
      common_spec: 'Common specification instead of harmonised standard',
    },
    safetyChannel: {
      phone: 'Telephone', email: 'Email', website: 'Dedicated website', form: 'Contact form',
    },
    euOperatorRole: {
      importer: 'Importer', auth_rep: 'Authorised representative',
      fulfilment: 'Fulfilment service provider',
      distributor: 'Distributor acting as responsible economic operator',
      other: 'Other EU-based responsible person (Reg. 2019/1020 Art. 4)',
    },
    yesNo: { yes: 'Yes', no: 'No' },
    yesNoUnknown: { yes: 'Yes', no: 'No', unknown: 'Unknown' },
  },
  ai: {
    scannerTitle: 'AI Toy Label Scanner',
    scannerDescription:
      'Snap or upload a picture of the toy packaging — the AI will read the CE mark, age warnings, manufacturer block, barcode, and listed allergenic fragrances.',
    dropHere: '↓ Drop here',
    dragOrClick: 'Drag & drop or click',
  },
  warnings: {
    youngChild:
      'This toy is intended for children under 36 months. Stricter allergenic fragrance restrictions apply, and any small parts must be assessed against choking hazards.',
    mouthContact:
      'This toy is intended to be placed in the mouth. Stricter allergenic fragrance and chemical migration restrictions apply.',
    unknownAllergens:
      'This DPP may be incomplete because allergenic fragrance information is mandatory when applicable. Replace "Unknown" with Yes or No before publishing.',
    suggestLegislation:
      'Based on the selected toy category, also consider ticking: {{list}}.',
  },
  disclaimer: {
    title: 'Toys DPP — compliance disclaimer',
    body: 'The exact EU Digital Product Passport data model and API specifications for toys are still TBD and are expected to be defined in the implementing act due by the end of 2026. This tool is a first version based on Regulation (EU) 2025/2509 and should not be treated as final legal advice.',
  },
  safetyGate: {
    title: 'EU Safety Gate',
    body: 'Report unsafe products through the EU Safety Gate Portal:',
    alwaysShown: 'This link is always shown on the public passport.',
  },
  certificate: {
    viewFile: 'View uploaded file',
    remove: 'Remove file',
    uploading: 'Uploading...',
    uploadButton: 'Upload certificate',
    errors: {
      loginRequired: 'You must be signed in to upload files.',
      tooLarge: 'File is too large. Maximum size is 5 MB.',
      uploadFailed: 'Upload failed.',
    },
  },
  fragrancePicker: {
    empty: 'No allergenic fragrances added yet.',
    summary: '{{count}} fragrance(s) declared.',
    addButton: 'Add fragrance',
    cas: 'CAS',
    removeAria: 'Remove {{name}}',
    concentrationLabel: 'Concentration (mg/kg)',
    componentLabel: 'Component / material',
    componentPlaceholder: 'e.g., plush filling',
    aboveThreshold: 'Concentration ≥10 mg/kg',
    supplierDeclaration: 'Supplier declaration on file',
    testReport: 'Test report on file',
    dialogTitle: 'Select allergenic fragrances',
    searchPlaceholder: 'Search by name, CAS, or id...',
    clearSearch: 'Clear search',
    noResults: 'No fragrances match "{{q}}".',
    done: 'Done',
  },
  validation: {
    imageRequired: 'A colour image of the toy is required.',
    descriptionRequired: 'A product description is required for toys.',
  },
  public: {
    badge: '🧸 Toy — Digital Product Passport',
    otherFallback: 'Other',
    notDeclared: 'Not declared',
    ceMarked: '✓ CE marked',
    statusPublished: 'Published',
    noAllergens:
      'No allergenic fragrances subject to labelling requirements are declared as present at or above 10 mg/kg.',
    certificateDownload: 'Download conformity certificate',
    reportUnsafe: 'Report an unsafe product',
    mirroredAt: 'Mirrored at {{url}}',
    mirroredDefault: 'Mirrored on Open-Label.eu infrastructure',
    nbNumber: 'Number {{n}}',
    nbCertificate: 'Certificate: {{ref}}',
    nbIssued: '(issued {{date}})',
    sections: {
      identity: 'Product identity',
      manufacturer: 'Manufacturer responsibility',
      manufacturerNote:
        'This Digital Product Passport is issued under the sole responsibility of the manufacturer.',
      euOperator: 'EU operator information',
      authRep: 'Authorised representative',
      euResponsible: 'EU responsible economic operator',
      compliance: 'Compliance',
      safety: 'Safety & chemical information',
      safetyReporting: 'Safety incident reporting',
      infrastructure: 'DPP infrastructure',
    },
    rows: {
      brand: 'Brand',
      model: 'Model',
      sku: 'SKU / variant',
      toyCategory: 'Toy category',
      age: 'Intended age group',
      uid: 'Unique identifier',
      manufacturer: 'Manufacturer',
      address: 'Address',
      email: 'Email',
      website: 'Website',
      operatorId: 'Operator identifier',
      legalName: 'Legal name',
      role: 'Role',
      ce: 'CE marking',
      applicableLeg: 'Applicable legislation',
      standards: 'Harmonised standards',
      commonSpecs: 'Common specifications',
      otherStandards: 'Other standards',
      notifiedBody: 'Notified body',
      customs: 'Customs code',
      dppProvider: 'DPP service provider',
      backup: 'Backup copy reference',
      dppVersion: 'DPP version',
      lastUpdated: 'Last updated',
      status: 'Status',
    },
    table: {
      substance: 'Substance',
      cas: 'CAS',
      concentration: 'Concentration',
      component: 'Component',
    },
    safety: {
      telephone: 'Telephone',
      emailLabel: 'Email',
      web: 'Web',
      gatePortal: 'EU Safety Gate Portal',
    },
  },
};

// ----- helpers -----------------------------------------------------------

function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== 'object') (target as any)[key] = {};
      deepMerge((target as any)[key], source[key]);
    } else {
      (target as any)[key] = source[key];
    }
  }
  return target;
}

function loadLocale(code: string): Record<string, any> {
  const path = resolve(LOCALES_DIR, `${code}.json`);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveLocale(code: string, data: Record<string, any>) {
  const path = resolve(LOCALES_DIR, `${code}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// Build placeholder-preserving prompt and ask the gateway to translate the
// entire toys JSON structure into one target language.
async function translateTree(code: string, sourceJson: any): Promise<any> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not set');
  const langName = LANGUAGE_NAMES[code] ?? code;

  const prompt = `You are a professional translator for EU regulatory product compliance content (Digital Product Passports for toys).

TASK: Translate every string VALUE in the JSON object below from English to ${langName} (${code}).

STRICT RULES:
- Return ONLY a valid JSON object with the EXACT same structure and the EXACT same keys.
- Translate only the string values; leave keys untouched.
- Preserve all i18next interpolation placeholders verbatim, including {{count}}, {{name}}, {{q}}, {{list}}, {{n}}, {{ref}}, {{date}}, {{url}}.
- Preserve technical identifiers exactly: EORI, GLN, LEI, VAT, DUNS, ESPR, GTIN, EPC, SGTIN, SKU, GS1, ISO/IEC, CN, EN 71-x, EN IEC 62115, TSR, GPSR, MSR, AI Act, CRA, RED, LVD, EMC, RoHS, REACH, CLP, CE.
- Keep regulatory references like "Regulation (EU) 2025/2509" in their official ${langName} form when one exists, otherwise keep the EU-original format (e.g. "Règlement (UE)" in French, "Reglamento (UE)" in Spanish).
- Keep "Open-Label.eu", "ESPR", "DPP" unchanged.
- Keep numeric ranges (e.g. "0–6 months") and units (mg/kg, kg) translated only for the unit name if standard in the language.
- For category labels that start with a CN chapter number ("32 — Paints…"), keep the leading number and dash separator.
- Do NOT include any markdown, code fences, comments, or extra text — only the raw JSON.

INPUT:
${JSON.stringify(sourceJson)}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body.slice(0, 400)}`);
  }
  const data: any = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace < 0) {
    throw new Error(`No JSON in response for ${code}: ${raw.slice(0, 200)}`);
  }
  return JSON.parse(stripped.slice(firstBrace, lastBrace + 1));
}

// ----- main --------------------------------------------------------------

async function main() {
  const argLangs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const targets =
    argLangs.length > 0 ? argLangs : Object.keys(LANGUAGE_NAMES);

  console.log(`📝 Updating en.json with toys + common additions...`);
  const en = loadLocale('en');
  if (!en.common) en.common = {};
  deepMerge(en.common, COMMON_ADDITIONS);
  en.toys = TOYS;
  saveLocale('en', en);
  console.log(`  ✓ en.json written`);

  const sourceForLLM = { toys: TOYS, common: COMMON_ADDITIONS };

  // Translate in parallel batches of 4 to avoid rate-limits
  const BATCH = 4;
  for (let i = 0; i < targets.length; i += BATCH) {
    const slice = targets.slice(i, i + BATCH);
    await Promise.all(
      slice.map(async (code) => {
        try {
          console.log(`🌐 ${code}: translating…`);
          const translated = await translateTree(code, sourceForLLM);
          const locale = loadLocale(code);
          if (!locale.common) locale.common = {};
          deepMerge(locale.common, translated.common ?? {});
          locale.toys = translated.toys ?? {};
          saveLocale(code, locale);
          console.log(`  ✓ ${code}.json written`);
        } catch (err) {
          console.error(`  ✗ ${code} failed:`, (err as Error).message);
        }
      }),
    );
  }
  console.log('✅ done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
