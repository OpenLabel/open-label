/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// Seeds the `garmentPublic.*` i18n subtree into EVERY locale file using the
// ENGLISH source text. The resumable translator picks these up on its next run,
// because it translates any value still equal to its English source.
//
// Idempotent: existing values are preserved, English is always refreshed.
//
// Usage:
//   bun run scripts/seed-garment-public-i18n.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');

const LOCALES = [
  'en', 'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr',
  'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
  'zh-CN',
];

export const GARMENT_PUBLIC: Record<string, Record<string, string>> = {
  _root: {
    headerBadge: 'Apparel — Digital Product Passport',
    madeInEu: 'Made in EU',
  },
  sections: {
    substances: 'Substances',
    care: 'Care',
    metadata: 'DPP infrastructure',
  },
  subsections: {
    manufacturer: 'Manufacturer',
    importer: 'Importer',
    euResponsiblePerson: 'EU responsible person',
  },
  rows: {
    address: 'Address',
    dppServiceProvider: 'DPP service provider',
    dppVersion: 'DPP version',
    lastUpdated: 'Last updated',
    status: 'Status',
  },
  values: {
    published: 'Published',
  },
};

function main() {
  let count = 0;
  for (const code of LOCALES) {
    const path = resolve(LOCALES_DIR, `${code}.json`);
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    const root = (data.garmentPublic = data.garmentPublic ?? {});
    count = 0;
    for (const [group, entries] of Object.entries(GARMENT_PUBLIC)) {
      const bag = group === '_root' ? root : (root[group] = root[group] ?? {});
      for (const [key, value] of Object.entries(entries)) {
        if (code === 'en' || bag[key] === undefined) bag[key] = value;
        count += 1;
      }
    }
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
  console.log(`Seeded ${count} garmentPublic.* keys into ${LOCALES.length} locales.`);
}

main();
