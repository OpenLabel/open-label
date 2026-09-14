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

/**
 * Canonical list of known fibre IDs used by the garment-label-ocr edge function.
 * These MUST match the `primary_fiber` select option values in
 * src/templates/textiles.ts — sync enforced by src/data/knownFiberIds.test.ts.
 */
export const KNOWN_FIBER_IDS: string[] = [
  'cotton',
  'organic_cotton',
  'polyester',
  'recycled_polyester',
  'wool',
  'linen',
  'silk',
  'viscose',
  'lyocell',
  'nylon',
  'elastane',
  'hemp',
  'leather',
  'other',
];

/** Fibres that shed microplastics when washed (synthetic / petro-based). */
export const SYNTHETIC_FIBER_IDS: string[] = [
  'polyester',
  'recycled_polyester',
  'nylon',
  'elastane',
];
