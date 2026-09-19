/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// Step 1 of 2 for Apparel translations.
//
// Walks the Apparel (textiles) template and seeds the `textiles.*` i18n
// subtree into EVERY locale file using the inline ENGLISH text as the value.
// No translation happens here — step 2 replaces the non-English values.
//
// Idempotent: existing keys are preserved and never removed or overwritten
// with different content unless the template English text itself changed.
//
// Usage:
//   bun run scripts/seed-textiles-i18n.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { textilesTemplate } from '../src/templates/textiles';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');

const LOCALES = [
  'en', 'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr',
  'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
  'zh-CN',
];

/** Option namespaces, keyed by the question id that owns the option list. */
const OPTION_NAMESPACES: Record<string, string> = {
  primary_fiber: 'primaryFiber',
  rsl_compliance_status: 'rslCompliance',
  certifications_held: 'certificationsHeld',
  audit_status: 'auditStatus',
  footprint_method: 'footprintMethod',
  washing_temp: 'washingTemp',
  iron_temp: 'ironTemp',
  care_symbols: 'careSymbols',
  recyclability_class: 'recyclabilityClass',
  disposition_status: 'dispositionStatus',
  disposition_reason_code: 'dispositionReason',
  authentication_method: 'authenticationMethod',
  manufacturer_non_eu: 'manufacturerNonEu',
  pfas_present: 'pfasPresent',
};

function setPath(tree: Record<string, any>, path: string, value: string) {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (!node[part] || typeof node[part] !== 'object') node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

/** Build the full `textiles.*` subtree from the template, in English. */
export function buildTextilesTree(): Record<string, any> {
  const tree: Record<string, any> = {};

  for (const section of textilesTemplate.sections) {
    if (section.titleKey) setPath(tree, section.titleKey, section.title);
    if (section.descriptionKey && section.description) {
      setPath(tree, section.descriptionKey, section.description);
    }

    for (const q of section.questions) {
      if (q.labelKey) setPath(tree, q.labelKey, q.label);
      if (q.helpKey && q.helpText) setPath(tree, q.helpKey, q.helpText);
      if (q.placeholderKey && q.placeholder) {
        setPath(tree, q.placeholderKey, q.placeholder);
      }
      if (q.warnWhen?.messageKey) {
        setPath(tree, q.warnWhen.messageKey, q.warnWhen.message);
      }
      if (Array.isArray(q.options)) {
        const ns = OPTION_NAMESPACES[q.id];
        if (!ns) {
          throw new Error(`No option namespace declared for question "${q.id}"`);
        }
        for (const opt of q.options) {
          const key = opt.labelKey ?? `textiles.options.${ns}.${opt.value}`;
          setPath(tree, key, opt.label);
        }
      }
    }
  }

  return tree;
}

function deepMerge(
  target: Record<string, any>,
  source: Record<string, any>,
  overwrite: boolean,
) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], value, overwrite);
    } else if (overwrite || target[key] === undefined) {
      // English is the source of truth. Other locales are only SEEDED with the
      // English text where a value is missing, so real translations added in
      // step 2 are never clobbered by re-running this script.
      target[key] = value;
    }
  }
  return target;
}

function main() {
  const tree = buildTextilesTree();
  let totalKeys = 0;
  const count = (obj: Record<string, any>) => {
    for (const v of Object.values(obj)) {
      if (v && typeof v === 'object') count(v);
      else totalKeys += 1;
    }
  };
  count(tree);

  for (const code of LOCALES) {
    const path = resolve(LOCALES_DIR, `${code}.json`);
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    deepMerge(data, tree, code === 'en');
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  console.log(`Seeded ${totalKeys} textiles.* keys into ${LOCALES.length} locales.`);
}

main();
