/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// Step 1 of 2 for Detergents translations.
//
// Walks the Detergents template and seeds the `detergents.*` i18n subtree into
// EVERY locale file using the inline ENGLISH text as the value. No translation
// happens here. Step 2 is scripts/translate-detergents-i18n.ts.
//
// Idempotent: existing keys are preserved. Keys outside the `detergents.`
// namespace (for example the shared `passport.productName` keys) are never
// written, so nothing shared can be overwritten.
//
// Usage:
//   bun run scripts/seed-detergents-i18n.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { detergentsTemplate, DETERGENTS_WARNING_MESSAGES } from '../src/templates/detergents';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');

const LOCALES = [
  'en', 'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr',
  'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
  'zh-CN',
];

/** Text shown by the Detergents compliance disclaimer in the form. */
export const DETERGENTS_DISCLAIMER = {
  title: 'Detergents DPP: compliance disclaimer',
  text: 'Regulation (EU) 2026/405 on detergents and surfactants applies from 23 September 2029. Its digital product passport rules, access rights and data carrier details are still to be set by an implementing act, and until then Regulation (EC) No 648/2004 applies. This tool collects product information and prepares passport data. It is not a certification or an approval and should not be treated as final legal advice. Everything saved in this category is public.',
} as const;

function setPath(tree: Record<string, any>, path: string, value: string) {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (!node[part] || typeof node[part] !== 'object') node[part] = {};
    node = node[part];
  }
  node[parts[parts.length - 1]] = value;
}

/** Build the full `detergents.*` subtree from the template, in English. */
export function buildDetergentsTree(): Record<string, any> {
  const tree: Record<string, any> = {};
  const add = (key: string | undefined, value: string | undefined) => {
    if (!key || !value) return;
    if (!key.startsWith('detergents.')) return; // never touch shared keys
    setPath(tree, key, value);
  };

  for (const section of detergentsTemplate.sections) {
    add(section.titleKey, section.title);
    add(section.descriptionKey, section.description);
    for (const q of section.questions) {
      add(q.labelKey, q.label);
      add(q.helpKey, q.helpText);
      add(q.placeholderKey, q.placeholder);
      add(q.warnWhen?.messageKey, q.warnWhen?.message);
      for (const opt of q.options ?? []) {
        if (!opt.labelKey) throw new Error(`Option "${q.id}.${opt.value}" has no labelKey`);
        add(opt.labelKey, opt.label);
      }
    }
  }
  for (const [name, message] of Object.entries(DETERGENTS_WARNING_MESSAGES)) {
    add(`detergents.warnings.${name}`, message);
  }
  add('detergents.disclaimer.title', DETERGENTS_DISCLAIMER.title);
  add('detergents.disclaimer.text', DETERGENTS_DISCLAIMER.text);
  return tree;
}

function deepMerge(target: Record<string, any>, source: Record<string, any>, overwrite: boolean) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      deepMerge(target[key], value, overwrite);
    } else if (overwrite || target[key] === undefined) {
      // English is the source of truth. Other locales are only SEEDED with the
      // English text where a value is missing, so real translations are never
      // clobbered by re-running this script.
      target[key] = value;
    }
  }
  return target;
}

function main() {
  const tree = buildDetergentsTree();
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
    // Only the `detergents` subtree is merged. Everything else is left untouched.
    data.detergents = deepMerge(data.detergents ?? {}, tree.detergents, code === 'en');
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  console.log(`Seeded ${totalKeys} detergents.* keys into ${LOCALES.length} locales.`);
}

if (import.meta.main) main();
