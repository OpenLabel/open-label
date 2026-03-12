import { describe, it, expect } from 'vitest';
import {
  packagingMaterialTypes,
  materialCompositions,
  disposalMethods,
  getCompositionsByCategory,
} from './wineRecycling';

describe('getCompositionsByCategory', () => {
  it('returns individual and composite keys', () => {
    const result = getCompositionsByCategory();
    expect(result).toHaveProperty('individual');
    expect(result).toHaveProperty('composite');
    expect(Array.isArray(result.individual)).toBe(true);
    expect(Array.isArray(result.composite)).toBe(true);
  });

  it('individual categories have compositions', () => {
    const { individual } = getCompositionsByCategory();
    for (const cat of individual) {
      expect(cat.compositions.length).toBeGreaterThan(0);
    }
  });

  it('composite category exists', () => {
    const { composite } = getCompositionsByCategory();
    expect(composite.length).toBe(1);
    expect(composite[0].id).toBe('composite');
  });

  it('all materialCompositions appear in either individual or composite', () => {
    const { individual, composite } = getCompositionsByCategory();
    const allGrouped = [
      ...individual.flatMap(c => c.compositions),
      ...composite.flatMap(c => c.compositions),
    ];
    const groupedIds = new Set(allGrouped.map(c => c.id));
    for (const comp of materialCompositions) {
      expect(groupedIds.has(comp.id)).toBe(true);
    }
  });
});

describe('packagingMaterialTypes', () => {
  it('each has id, name, icon', () => {
    for (const mt of packagingMaterialTypes) {
      expect(mt.id).toBeTruthy();
      expect(mt.name).toBeTruthy();
      expect(mt.icon).toBeTruthy();
    }
  });
});

describe('disposalMethods', () => {
  it('each has id and name', () => {
    for (const dm of disposalMethods) {
      expect(dm.id).toBeTruthy();
      expect(dm.name).toBeTruthy();
    }
  });
});
