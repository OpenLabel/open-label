import { describe, it, expect } from 'vitest';
import {
  packagingMaterialTypes,
  materialCompositions,
  materialCategories,
  disposalMethods,
  getCompositionsByCategory,
} from './wineRecycling';

describe('packagingMaterialTypes', () => {
  it('has no duplicate IDs', () => {
    const ids = packagingMaterialTypes.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each entry has id, name, icon', () => {
    for (const m of packagingMaterialTypes) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.icon).toBeTruthy();
    }
  });

  it('includes common packaging types', () => {
    const ids = packagingMaterialTypes.map(m => m.id);
    expect(ids).toContain('bottle');
    expect(ids).toContain('cork');
  });
});

describe('materialCompositions', () => {
  it('has no duplicate IDs', () => {
    const ids = materialCompositions.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each entry has id, name, code, categoryId', () => {
    for (const m of materialCompositions) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.code).toBeTruthy();
      expect(m.categoryId).toBeTruthy();
    }
  });
});

describe('disposalMethods', () => {
  it('has no duplicate IDs', () => {
    const ids = disposalMethods.map(d => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each entry has id and name', () => {
    for (const d of disposalMethods) {
      expect(d.id).toBeTruthy();
      expect(d.name).toBeTruthy();
    }
  });
});

describe('materialCategories', () => {
  it('has entries', () => {
    expect(materialCategories.length).toBeGreaterThan(0);
  });

  it('each entry has id and name', () => {
    for (const c of materialCategories) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
    }
  });
});

describe('getCompositionsByCategory', () => {
  it('returns individual and composite groups', () => {
    const result = getCompositionsByCategory();
    expect(result.individual).toBeDefined();
    expect(result.composite).toBeDefined();
    expect(Array.isArray(result.individual)).toBe(true);
    expect(Array.isArray(result.composite)).toBe(true);
  });

  it('individual groups have compositions', () => {
    const result = getCompositionsByCategory();
    for (const group of result.individual) {
      expect(group.id).toBeTruthy();
      expect(group.name).toBeTruthy();
      expect(group.compositions.length).toBeGreaterThan(0);
    }
  });

  it('composite group has compositions', () => {
    const result = getCompositionsByCategory();
    expect(result.composite).toHaveLength(1);
    expect(result.composite[0].compositions.length).toBeGreaterThan(0);
  });

  it('includes glass category with multiple types', () => {
    const result = getCompositionsByCategory();
    const glass = result.individual.find(g => g.id === 'glass');
    expect(glass).toBeDefined();
    expect(glass!.compositions.length).toBeGreaterThanOrEqual(4);
  });
});
