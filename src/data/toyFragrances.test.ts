import { describe, it, expect } from 'vitest';
import {
  TOY_FRAGRANCES,
  getFragranceById,
  generateAllergenDeclaration,
} from './toyFragrances';

describe('toyFragrances', () => {
  it('has a non-trivial number of entries', () => {
    expect(TOY_FRAGRANCES.length).toBeGreaterThan(40);
  });

  it('has unique ids', () => {
    const ids = TOY_FRAGRANCES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each fragrance has name and cas', () => {
    for (const f of TOY_FRAGRANCES) {
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.cas.length).toBeGreaterThan(0);
    }
  });

  it('getFragranceById returns the matching entry', () => {
    expect(getFragranceById('linalool')?.cas).toBe('78-70-6');
    expect(getFragranceById('does-not-exist')).toBeUndefined();
  });

  it('generates a "no fragrances" declaration when none', () => {
    expect(generateAllergenDeclaration('no', [])).toContain('No allergenic');
    expect(generateAllergenDeclaration('unknown', [])).toContain('No allergenic');
    expect(generateAllergenDeclaration(undefined, [])).toContain('No allergenic');
  });

  it('generates a list declaration when yes + selections', () => {
    const text = generateAllergenDeclaration('yes', [
      { id: 'linalool', name: 'Linalool', cas: '78-70-6' },
      { id: 'vanillin', name: 'Vanillin', cas: '121-33-5' },
    ]);
    expect(text).toContain('Linalool');
    expect(text).toContain('Vanillin');
    expect(text).toContain('10 mg/kg');
  });
});
