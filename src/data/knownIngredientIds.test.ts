import { describe, it, expect } from 'vitest';
import { KNOWN_INGREDIENT_IDS } from './knownIngredientIds';

describe('KNOWN_INGREDIENT_IDS', () => {
  it('has entries', () => {
    expect(KNOWN_INGREDIENT_IDS.length).toBeGreaterThan(30);
  });

  it('all IDs are unique', () => {
    expect(new Set(KNOWN_INGREDIENT_IDS).size).toBe(KNOWN_INGREDIENT_IDS.length);
  });

  it('all IDs are snake_case (lowercase with underscores)', () => {
    for (const id of KNOWN_INGREDIENT_IDS) {
      expect(id).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it('no empty strings', () => {
    for (const id of KNOWN_INGREDIENT_IDS) {
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it('includes key allergens', () => {
    expect(KNOWN_INGREDIENT_IDS).toContain('egg');
    expect(KNOWN_INGREDIENT_IDS).toContain('milk');
    expect(KNOWN_INGREDIENT_IDS).toContain('sulfites');
  });

  it('includes key ingredients', () => {
    expect(KNOWN_INGREDIENT_IDS).toContain('grapes');
    expect(KNOWN_INGREDIENT_IDS).toContain('tartaric_acid');
  });
});
