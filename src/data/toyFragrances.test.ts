import { describe, it, expect } from 'vitest';
import {
  TOY_FRAGRANCES,
  getFragranceById,
  isLegacyAllergenDeclaration,
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

  it('detects legacy English allergen declarations', () => {
    expect(
      isLegacyAllergenDeclaration(
        'No allergenic fragrances subject to labelling requirements are declared as present at or above 10 mg/kg.',
      ),
    ).toBe(true);
    expect(
      isLegacyAllergenDeclaration(
        'The following allergenic fragrances subject to labelling requirements are present at or above 10 mg/kg: Linalool.',
      ),
    ).toBe(true);
    expect(isLegacyAllergenDeclaration('A custom user-written declaration.')).toBe(false);
    expect(isLegacyAllergenDeclaration('')).toBe(false);
    expect(isLegacyAllergenDeclaration(undefined)).toBe(false);
  });
});
