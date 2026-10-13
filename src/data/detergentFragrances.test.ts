import { describe, it, expect } from 'vitest';
import { DETERGENT_FRAGRANCES, getDetergentFragranceById } from './detergentFragrances';

describe('detergentFragrances', () => {
  it('has exactly the 105 entries of Annex V Part D', () => {
    expect(DETERGENT_FRAGRANCES).toHaveLength(105);
  });

  it('uses the official reference numbers 1 to 105 in order', () => {
    expect(DETERGENT_FRAGRANCES.map((f) => f.ref)).toEqual(
      Array.from({ length: 105 }, (_, i) => i + 1),
    );
  });

  it('has unique ids', () => {
    const ids = DETERGENT_FRAGRANCES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each fragrance has id, name, chemical name and cas', () => {
    for (const f of DETERGENT_FRAGRANCES) {
      expect(f.id.trim().length).toBeGreaterThan(0);
      expect(f.name.trim().length).toBeGreaterThan(0);
      expect(f.chemical_name.trim().length).toBeGreaterThan(0);
      expect(f.cas.trim().length).toBeGreaterThan(0);
      expect(f.name).toBe(f.name.trim());
    }
  });

  it('uses readable snake_case ids', () => {
    for (const f of DETERGENT_FRAGRANCES) {
      expect(f.id).toMatch(/^[a-z0-9]+(_[a-z0-9]+)*$/);
    }
  });

  it('getDetergentFragranceById returns the matching entry', () => {
    expect(getDetergentFragranceById('linalool')?.cas).toBe('78-70-6');
    expect(getDetergentFragranceById('does-not-exist')).toBeUndefined();
  });

  it('matches the Official Journal on spot checks', () => {
    const byRef = (n: number) => DETERGENT_FRAGRANCES.find((f) => f.ref === n)!;
    expect(byRef(1)).toMatchObject({ chemical_name: 'Benzyl alcohol', cas: '100-51-6', ec: '202-859-9' });
    expect(byRef(3)).toMatchObject({ name: 'Amyl cinnamal', cas: '122-40-7' });
    expect(byRef(19).cas).toBe('106-22-9; 26489-01-0; 1117-61-9; 7540-51-4');
    expect(byRef(102).cas).toBe('51414-25-6; 31906-04-4');
    expect(byRef(103)).toMatchObject({ cas: '526-37-4', ec: '' });
    expect(byRef(105)).toMatchObject({ cas: '80-54-6', ec: '201-289-8' });
  });

  it('keeps every substance of the multi-line entries in Part D', () => {
    const byRef = (n: number) => DETERGENT_FRAGRANCES.find((f) => f.ref === n)!;
    // Entries 5, 8, 19, 21, 33, 61, 62, 65, 66, 67, 71, 74 and 77 span several table rows.
    expect(byRef(5).cas).toBe('5392-40-5; 141-27-5; 106-26-3');
    expect(byRef(8).cas).toBe('97-54-1; 5932-68-3; 5912-86-7');
    expect(byRef(21).cas).toContain('5989-27-5');
    expect(byRef(21).cas).toContain('5989-54-8');
    expect(byRef(33).cas).toContain('23696-85-7');
    expect(byRef(61).cas).toContain('8016-38-4');
    expect(byRef(62).cas).toContain('8008-57-9');
    expect(byRef(65).cas).toContain('91844-92-7');
    expect(byRef(71).cas).toContain('90063-37-9');
    expect(byRef(74).cas).toContain('90064-25-8');
    expect(byRef(77).cas).toContain('92347-25-6');
  });
});
