import { describe, it, expect } from 'vitest';
import { getIngredientCategory, getAllIngredients, getIngredientById, wineIngredientCategories } from './wineIngredients';

describe('getIngredientCategory', () => {
  it('returns category id for known ingredient', () => {
    expect(getIngredientCategory('grapes')).toBe('general');
  });

  it('returns category id for ingredient in gases', () => {
    expect(getIngredientCategory('argon')).toBe('gases');
  });

  it('returns category id for allergen in processing_aids', () => {
    expect(getIngredientCategory('egg')).toBe('processing_aids');
  });

  it('returns undefined for unknown ingredient', () => {
    expect(getIngredientCategory('nonexistent')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getIngredientCategory('')).toBeUndefined();
  });

  it('finds ingredients in every category', () => {
    for (const cat of wineIngredientCategories) {
      if (cat.ingredients.length > 0) {
        const result = getIngredientCategory(cat.ingredients[0].id);
        expect(result).toBe(cat.id);
      }
    }
  });
});

describe('getAllIngredients returns flat list', () => {
  it('contains ingredients from multiple categories', () => {
    const all = getAllIngredients();
    const grapes = all.find(i => i.id === 'grapes');
    const argon = all.find(i => i.id === 'argon');
    expect(grapes).toBeDefined();
    expect(argon).toBeDefined();
  });

  it('no duplicate ids', () => {
    const all = getAllIngredients();
    const ids = all.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getIngredientById edge cases', () => {
  it('returns undefined for empty string', () => {
    expect(getIngredientById('')).toBeUndefined();
  });

  it('is case sensitive', () => {
    expect(getIngredientById('Grapes')).toBeUndefined();
    expect(getIngredientById('grapes')).toBeDefined();
  });
});
