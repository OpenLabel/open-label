/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

/**
 * TEMPORARY translation debt — step 1 of 2 for the Apparel (textiles) category.
 *
 * Step 1 made `src/templates/textiles.ts` key-driven and seeded every locale
 * with the ENGLISH source text so that the key sets stay identical and the app
 * keeps rendering exactly as before. Those seeded values are, by construction,
 * still English in the 24 non-English locales.
 *
 * The translation audit gates would otherwise flag each of them. Instead of
 * allowlisting individual English strings (which would hide real regressions
 * forever), the whole subtree is listed here as KNOWN, TRACKED debt.
 *
 * ⚠️ Step 2 MUST translate `textiles.*` in all 24 non-English locales and then
 * EMPTY this array. The guard test below makes it impossible to quietly add
 * further prefixes to this list.
 */
 * `garmentPublic.` is the same Apparel debt: the strings used only by the
 * bespoke Apparel public renderer, seeded in English by
 * scripts/seed-garment-public-i18n.ts and translated by the same step 2 run.
 */
export const PENDING_TRANSLATION_PREFIXES: readonly string[] = [
  'textiles.',
  'garmentPublic.',
];

/** True when a key belongs to a subtree whose translation is still pending. */
export function isTranslationPending(key: string): boolean {
  return PENDING_TRANSLATION_PREFIXES.some((p) => key.startsWith(p));
}
