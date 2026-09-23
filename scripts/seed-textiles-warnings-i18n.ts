/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

// Seeds the `textiles.warnings.*` i18n subtree into EVERY locale file using the
// ENGLISH source text. Step 2 (scripts/translate-textiles-i18n.ts) replaces the
// non-English values, because it translates any value still equal to English.
//
// Idempotent: existing values are preserved, English is always refreshed.
//
// Usage:
//   bun run scripts/seed-textiles-warnings-i18n.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOCALES_DIR = resolve(import.meta.dir, '../src/i18n/locales');

const LOCALES = [
  'en', 'bg', 'cs', 'da', 'de', 'el', 'es', 'et', 'fi', 'fr', 'ga', 'hr',
  'hu', 'it', 'lt', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'sk', 'sl', 'sv',
  'zh-CN',
];

export const WARNINGS: Record<string, string> = {
  compositionExceeds100:
    "Primary ({{primary}}%) and secondary ({{secondary}}%) fiber percentages sum to {{sum}}%, which exceeds 100%. EU Regulation 1007/2011 requires the declared fibre composition to reflect the item's actual make-up — check these figures.",
  primaryExceeds100:
    "The primary fiber percentage alone ({{primary}}%) exceeds 100%. EU Regulation 1007/2011 requires the declared fibre composition to reflect the item's actual make-up — check this figure.",
  incompleteSingleFibre:
    'Primary fiber is declared at {{primary}}% with no secondary fiber recorded. If this item is a blend, add the remaining fiber(s) via Secondary Fiber Type/Percentage or the Full Composition Statement so the declared composition accounts for the full 100%.',
  syntheticOver50:
    'This garment is {{percentage}}% synthetic fibre, which is more than 50%. It will shed microplastics during washing, and the consumer must be informed of this.',
};

function main() {
  for (const code of LOCALES) {
    const path = resolve(LOCALES_DIR, `${code}.json`);
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    data.textiles = data.textiles ?? {};
    const bag = (data.textiles.warnings = data.textiles.warnings ?? {});
    for (const [key, value] of Object.entries(WARNINGS)) {
      if (code === 'en' || bag[key] === undefined) bag[key] = value;
    }
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }
  console.log(
    `Seeded ${Object.keys(WARNINGS).length} textiles.warnings.* keys into ${LOCALES.length} locales.`,
  );
}

main();
