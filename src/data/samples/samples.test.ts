/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

/**
 * Self-maintaining demo passports: these tests go red whenever a template
 * changes in a way the in-code samples no longer satisfy, or when a new
 * category becomes active without a sample.
 */
import { describe, it, expect } from 'vitest';
import { SAMPLE_PASSPORTS, getSamplePassport } from './index';
import { categoryList, getTemplate, evaluateShowWhen } from '@/templates';
import { WINE_PASSPORT_FIELDS } from '@/components/wine/WinePublicPassport';
import { getIngredientById } from '@/data/wineIngredients';
import { materialCompositions, packagingMaterialTypes } from '@/data/wineRecycling';
import { calculateWineNutrition } from '@/lib/wineCalculations';
import type { ProductCategory } from '@/types/passport';

const activeSampledCategories = categoryList.filter(
  (c) => c.status === 'active' && c.value !== 'other',
);

/** Keys that are generic to every passport, not template questions. */
const GENERIC_KEYS = ['product_name', 'product_name_translations', 'description_translations'];

describe('(a) every active category has a demo sample', () => {
  for (const category of activeSampledCategories) {
    it(`${category.value} has a sample`, () => {
      expect(
        typeof SAMPLE_PASSPORTS[category.value],
        `Category ${category.value} is active but has no demo sample in src/data/samples`,
      ).toBe('function');
    });
  }
});

describe('(b) samples match their template', () => {
  for (const category of activeSampledCategories) {
    const build = SAMPLE_PASSPORTS[category.value];
    if (!build) continue;
    const template = getTemplate(category.value);
    if (template.sections.length === 0) continue;

    describe(`${category.value}`, () => {
      const sample = build();
      const data = sample.category_data as Record<string, unknown>;
      const questions = template.sections.flatMap((s) => s.questions);

      it('fills every visible required question', () => {
        for (const section of template.sections) {
          if (!evaluateShowWhen(section.showWhen, data)) continue;
          for (const q of section.questions) {
            if (!q.required) continue;
            if (!evaluateShowWhen(q.showWhen, data)) continue;
            const value = data[q.id];
            const empty =
              value === undefined ||
              value === null ||
              value === '' ||
              (Array.isArray(value) && value.length === 0);
            expect(empty, `required question "${q.id}" is empty in the ${category.value} sample`).toBe(false);
          }
        }
      });

      it('only uses option values declared by the template', () => {
        for (const q of questions) {
          const value = data[q.id];
          if (value === undefined || value === null) continue;
          const allowed = (q.options || []).map((o) => o.value);
          if (q.type === 'select') {
            expect(allowed, `"${q.id}" value "${String(value)}" is not a template option`).toContain(value);
          }
          if (q.type === 'multi_select') {
            expect(Array.isArray(value), `"${q.id}" must be an array`).toBe(true);
            for (const v of value as unknown[]) {
              expect(allowed, `"${q.id}" value "${String(v)}" is not a template option`).toContain(v);
            }
          }
        }
      });

      it('contains no unknown category_data keys', () => {
        const ids = new Set(questions.map((q) => q.id));
        for (const key of Object.keys(data)) {
          const base = key.endsWith('_translations') ? key.slice(0, -'_translations'.length) : key;
          const known = ids.has(key) || ids.has(base) || GENERIC_KEYS.includes(key);
          expect(known, `unknown key "${key}" in the ${category.value} sample`).toBe(true);
        }
      });
    });
  }
});

describe('(c) wine sample integrity', () => {
  const sample = getSamplePassport('wine' as ProductCategory)!();
  const data = sample.category_data as Record<string, unknown>;
  const allowedWineKeys = [...Object.values(WINE_PASSPORT_FIELDS).flat(), ...GENERIC_KEYS];

  it('only uses wine passport fields', () => {
    for (const key of Object.keys(data)) {
      expect(allowedWineKeys, `unexpected wine key "${key}"`).toContain(key);
    }
  });

  it('uses ingredient ids that resolve', () => {
    const ingredients = data.ingredients as { id: string; isAllergen?: boolean }[];
    expect(ingredients.length).toBeGreaterThan(0);
    for (const ing of ingredients) {
      expect(getIngredientById(ing.id), `ingredient "${ing.id}" does not resolve`).toBeTruthy();
    }
    expect(getIngredientById('sulfites')?.isAllergen).toBe(true);
  });

  it('uses packaging ids that resolve', () => {
    const materials = data.packaging_materials as {
      typeId: string;
      compositionId?: string;
      compositionCode?: string;
    }[];
    expect(materials.length).toBeGreaterThan(0);
    for (const m of materials) {
      expect(
        packagingMaterialTypes.some((t) => t.id === m.typeId),
        `packaging type "${m.typeId}" does not resolve`,
      ).toBe(true);
      const composition = materialCompositions.find((c) => c.id === m.compositionId);
      expect(composition, `composition "${m.compositionId}" does not resolve`).toBeTruthy();
      expect(composition!.code).toBe(m.compositionCode);
    }
  });

  it('nutrition matches wineCalculations output', () => {
    const expected = calculateWineNutrition({
      alcoholPercent: data.alcohol_percent as number,
      residualSugar: data.residual_sugar as number,
      totalAcidity: data.total_acidity as number,
      glycerine: (data.glycerine as number) ?? 0,
    });
    expect(data.energy_kcal).toBe(expected.energyKcal);
    expect(data.energy_kj).toBe(expected.energyKj);
    expect(data.carbohydrates).toBe(expected.carbohydrates);
    expect(data.sugar).toBe(expected.sugar);
  });
});

describe('sample hygiene', () => {
  it('uses only .example domains and states the data is fictitious', () => {
    for (const [category, build] of Object.entries(SAMPLE_PASSPORTS)) {
      const sample = build!();
      expect(sample.description.toLowerCase(), `${category} description`).toContain('fictitious');
      const serialized = JSON.stringify(sample);
      for (const match of serialized.match(/https?:\/\/[^"\s]+|[\w.+-]+@[\w.-]+/g) || []) {
        const host = match.startsWith('http')
          ? new URL(match).hostname
          : match.split('@')[1];
        expect(
          host.endsWith('.example'),
          `${category} sample uses a non-.example host: ${host}`,
        ).toBe(true);
      }
    }
  });
});
