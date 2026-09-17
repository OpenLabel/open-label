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

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { KNOWN_FIBER_IDS, SYNTHETIC_FIBER_IDS } from './knownFiberIds';
import { textilesTemplate } from '@/templates/textiles';

function templateFiberValues(): string[] {
  for (const section of textilesTemplate.sections) {
    const q = section.questions.find((question) => question.id === 'primary_fiber');
    if (q) return (q.options ?? []).map((o) => o.value);
  }
  throw new Error('primary_fiber question not found in the Apparel template');
}

function edgeFunctionList(name: string): string[] {
  const src = readFileSync(
    join(process.cwd(), 'supabase/functions/garment-label-ocr/index.ts'),
    'utf-8',
  );
  const match = src.match(new RegExp(`${name}[^[]*\\[([\\s\\S]*?)\\]`));
  if (!match) throw new Error(`${name} not found in the garment-label-ocr edge function`);
  return [...match[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
}

describe('KNOWN_FIBER_IDS', () => {
  it('matches the Apparel template primary_fiber option values exactly', () => {
    expect(KNOWN_FIBER_IDS).toEqual(templateFiberValues());
  });

  it('matches the garment-label-ocr edge function KNOWN_FIBERS list', () => {
    expect(edgeFunctionList('KNOWN_FIBERS')).toEqual(KNOWN_FIBER_IDS);
  });

  it('does not include leather (not a textile fibre)', () => {
    expect(KNOWN_FIBER_IDS).not.toContain('leather');
  });

  it('keeps modal and cashmere as distinct ids', () => {
    expect(KNOWN_FIBER_IDS).toContain('modal');
    expect(KNOWN_FIBER_IDS).toContain('cashmere');
    expect(KNOWN_FIBER_IDS).toContain('mohair');
    expect(KNOWN_FIBER_IDS).toContain('alpaca');
    expect(KNOWN_FIBER_IDS).toContain('angora');
    expect(KNOWN_FIBER_IDS).toContain('acrylic');
  });

  it('has no duplicates', () => {
    expect(new Set(KNOWN_FIBER_IDS).size).toBe(KNOWN_FIBER_IDS.length);
  });
});

describe('SYNTHETIC_FIBER_IDS', () => {
  it('contains only petro-based synthetics', () => {
    expect(SYNTHETIC_FIBER_IDS).toEqual([
      'polyester',
      'recycled_polyester',
      'nylon',
      'elastane',
      'acrylic',
      'polypropylene',
    ]);
  });

  it('contains no regenerated cellulosics', () => {
    for (const cellulosic of ['viscose', 'modal', 'lyocell', 'acetate', 'cupro']) {
      expect(SYNTHETIC_FIBER_IDS).not.toContain(cellulosic);
    }
  });

  it('is a subset of KNOWN_FIBER_IDS', () => {
    for (const id of SYNTHETIC_FIBER_IDS) {
      expect(KNOWN_FIBER_IDS).toContain(id);
    }
  });

  it('matches the garment-label-ocr edge function SYNTHETIC_FIBERS set', () => {
    expect(edgeFunctionList('SYNTHETIC_FIBERS')).toEqual(SYNTHETIC_FIBER_IDS);
  });
});
