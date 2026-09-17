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
  // Natural plant fibres
  'cotton',
  'organic_cotton',
  'linen',
  'hemp',
  // Animal fibres
  'wool',
  'cashmere',
  'mohair',
  'alpaca',
  'angora',
  'silk',
  // Man-made cellulosics
  'viscose',
  'modal',
  'lyocell',
  'acetate',
  'cupro',
  // Synthetics
  'polyester',
  'recycled_polyester',
  'nylon',
  'acrylic',
  'elastane',
  'polypropylene',
  'other',
];

/**
 * Fibres that shed microplastics when washed (petro-based synthetics only).
 * Regenerated cellulosics (viscose, modal, lyocell, acetate, cupro) are NOT
 * synthetics and must never be listed here.
 */
export const SYNTHETIC_FIBER_IDS: string[] = [
  'polyester',
  'recycled_polyester',
  'nylon',
  'elastane',
  'acrylic',
  'polypropylene',
];
