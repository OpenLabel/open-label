import { describe, it, expect } from 'vitest';
import {
  getAllIngredients,
  getIngredientById,
  getIngredientCategory,
  wineProductTypes,
  wineIngredientCategories,
} from './wineIngredients';

describe('getAllIngredients', () => {
  it('returns a flat list of all ingredients', () => {
    const all = getAllIngredients();
    expect(all.length).toBeGreaterThan(30);
  });

  it('every ingredient has id and name', () => {
    for (const ing of getAllIngredients()) {
      expect(ing.id).toBeTruthy();
      expect(ing.name).toBeTruthy();
    }
  });

  it('no duplicate IDs', () => {
    const ids = getAllIngredients().map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getIngredientById', () => {
  it('finds known ingredients', () => {
    expect(getIngredientById('grapes')).toBeDefined();
    expect(getIngredientById('grapes')!.name).toBe('Grapes');
    expect(getIngredientById('sulfites')).toBeDefined();
  });

  it('returns undefined for unknown', () => {
    expect(getIngredientById('nonexistent')).toBeUndefined();
  });
});

describe('getIngredientCategory', () => {
  it('maps ingredients to correct categories', () => {
    expect(getIngredientCategory('grapes')).toBe('general');
    expect(getIngredientCategory('argon')).toBe('gases');
    expect(getIngredientCategory('tartaric_acid')).toBe('acidity_regulators');
    expect(getIngredientCategory('sulfites')).toBe('preservatives');
    expect(getIngredientCategory('egg')).toBe('processing_aids');
  });

  it('returns undefined for unknown', () => {
    expect(getIngredientCategory('unknown')).toBeUndefined();
  });
});

describe('wineProductTypes', () => {
  it('has expected entries', () => {
    expect(wineProductTypes.length).toBeGreaterThanOrEqual(3);
    const ids = wineProductTypes.map(p => p.id);
    expect(ids).toContain('wine');
    expect(ids).toContain('spirits');
  });

  it('each entry has id, label, description', () => {
    for (const pt of wineProductTypes) {
      expect(pt.id).toBeTruthy();
      expect(pt.label).toBeTruthy();
      expect(pt.description).toBeTruthy();
    }
  });
});

describe('wineIngredientCategories', () => {
  it('has 6 categories', () => {
    expect(wineIngredientCategories).toHaveLength(6);
  });

  it('each category has id, name, and ingredients', () => {
    for (const cat of wineIngredientCategories) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.ingredients.length).toBeGreaterThan(0);
    }
  });

  it('allergens are marked in processing_aids', () => {
    const processingAids = wineIngredientCategories.find(c => c.id === 'processing_aids');
    expect(processingAids).toBeDefined();
    const allergens = processingAids!.ingredients.filter(i => i.isAllergen);
    expect(allergens.length).toBeGreaterThan(0);
    expect(allergens.map(a => a.id)).toContain('egg');
    expect(allergens.map(a => a.id)).toContain('milk');
  });
});
