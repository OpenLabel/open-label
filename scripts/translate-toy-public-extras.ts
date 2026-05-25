/* eslint-disable @typescript-eslint/no-explicit-any */
// One-off: adds missing toyPublic.* keys and the toys.options.* labelKey tree
// to en.json and translates them into every other EU locale via Lovable AI.

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

// --- New strings to add (English source of truth) ---
const SOURCE = {
  toyPublic: {
    values: {
      other: 'Other',
      reference: 'Reference',
      certificateDownload: 'Download conformity certificate',
      ceDeclarationStatement:
        'The manufacturer declares that this toy complies with the applicable EU safety requirements and bears or will bear the CE marking where required before being placed on the EU market.',
      yesNoUnknown: { yes: 'Yes', no: 'No', unknown: 'Unknown' },
    },
    rows: {
      euDoc: 'EU Declaration of Conformity',
      safetyAssessment: 'Safety assessment',
      technicalDocumentation: 'Technical documentation',
    },
  },
  toys: {
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
  },
};

function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') (target as any)[key] = {};
      deepMerge((target as any)[key], source[key]);
    } else {
      (target as any)[key] = source[key];
    }
  }
  return target;
}

function loadLocale(code: string) {
  return JSON.parse(readFileSync(resolve(LOCALES_DIR, `${code}.json`), 'utf-8'));
}
function saveLocale(code: string, data: any) {
  writeFileSync(resolve(LOCALES_DIR, `${code}.json`), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

async function translateTree(code: string, sourceJson: any): Promise<any> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error('LOVABLE_API_KEY is not set');
  const langName = LANGUAGE_NAMES[code] ?? code;

  const prompt = `You are a professional translator for EU regulatory product compliance content (Digital Product Passports for toys).

TASK: Translate every string VALUE in the JSON object below from English to ${langName} (${code}).

STRICT RULES:
- Return ONLY a valid JSON object with the EXACT same structure and the EXACT same keys.
- Translate only the string values; leave keys untouched.
- Preserve all i18next interpolation placeholders verbatim (e.g. {{url}}, {{date}}, {{n}}, {{ref}}, {{value}}).
- Preserve technical identifiers exactly: EORI, GLN, LEI, VAT, DUNS, ESPR, GTIN, EPC, SGTIN, SKU, GS1, ISO/IEC, CN, EN 71-x, EN IEC 62115, TSR, GPSR, MSR, AI Act, CRA, RED, LVD, EMC, RoHS, REACH, CLP, CE.
- Keep regulatory references like "Regulation (EU) 2025/2509" in their official ${langName} form when one exists (e.g. "Règlement (UE)" in French, "Reglamento (UE)" in Spanish, "Verordnung (EU)" in German). Always preserve the year/number.
- Keep "Open-Label.eu" and "DPP" unchanged.
- For CN-chapter labels starting with a number ("32 — Paints…"), keep the leading number and " — " separator.
- Do NOT include markdown, code fences, comments, or extra text — only raw JSON.

INPUT:
${JSON.stringify(sourceJson)}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data: any = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  if (first < 0 || last < 0) throw new Error(`No JSON in response for ${code}`);
  return JSON.parse(stripped.slice(first, last + 1));
}

async function main() {
  const argLangs = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const targets = argLangs.length > 0 ? argLangs : Object.keys(LANGUAGE_NAMES);

  console.log('📝 Updating en.json...');
  const en = loadLocale('en');
  deepMerge(en, SOURCE);
  saveLocale('en', en);
  console.log('  ✓ en.json');

  const BATCH = 4;
  for (let i = 0; i < targets.length; i += BATCH) {
    const slice = targets.slice(i, i + BATCH);
    await Promise.all(slice.map(async (code) => {
      try {
        console.log(`🌐 ${code}…`);
        const translated = await translateTree(code, SOURCE);
        const locale = loadLocale(code);
        deepMerge(locale, translated);
        saveLocale(code, locale);
        console.log(`  ✓ ${code}`);
      } catch (e) {
        console.error(`  ✗ ${code}:`, (e as Error).message);
      }
    }));
  }
  console.log('✅ done');
}

main().catch((e) => { console.error(e); process.exit(1); });
