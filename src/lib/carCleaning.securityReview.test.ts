import { describe, expect, it } from 'vitest';
import { carCleaningSections, exportCarCleaningPassport, publicCarCleaningData, publicHttpUrl, validateCarCleaning } from './carCleaning';
import { validCleaner } from '@/components/car-cleaning/testFixtures';

describe('Independent car cleaning boundary review', () => {
  it('never accepts a name that the public boundary drops for length', () => {
    const oversized = { ...validCleaner, product_name: 'A'.repeat(10001) };
    expect(validateCarCleaning(oversized)).toContainEqual({ field: 'product_name', code: 'length' });
    expect(publicCarCleaningData(oversized)).not.toHaveProperty('product_name');
  });

  it.each([{}, ['wrong'], 42])('reports malformed product names as type errors: %j', product_name => {
    expect(validateCarCleaning({ ...validCleaner, product_name })).toContainEqual({ field: 'product_name', code: 'type' });
  });

  it('uses distinct translation keys when option meanings differ between fields', () => {
    const meanings = new Map<string, string>();
    const collisions: string[] = [];
    for (const field of carCleaningSections.flatMap(section => section.questions)) {
      for (const option of field.options ?? []) {
        const previous = meanings.get(option.labelKey);
        if (previous && previous !== option.label) collisions.push(`${option.labelKey}: ${previous} / ${option.label}`);
        meanings.set(option.labelKey, option.label);
      }
    }
    expect(collisions).toEqual([]);
  });

  it.each([null, undefined, true, 17, 'not an object', [], [{ product_name: 'Array' }]])('returns an empty public projection for malformed category data %j', input => {
    expect(publicCarCleaningData(input)).toEqual({});
  });

  it('does not let hidden translation values or nested private keys escape', () => {
    const input = JSON.parse(JSON.stringify({
      ...validCleaner,
      hazard_statements: 'HIDDEN', hazard_statements_translations: { fr: 'HIDDEN TRANSLATION' },
      __ai_autofill: { secret: 'NESTED SECRET' }, internal_notes: 'PRIVATE',
      manufacturer_name: { private: 'WRONG TYPE' },
      product_name_translations: { '__proto__': 'bad', en: ['WRONG ARRAY'], fr: 'Public name', zz: 'UNKNOWN LANGUAGE' },
    }));
    const text = JSON.stringify(publicCarCleaningData(input));
    for (const value of ['HIDDEN', 'NESTED SECRET', 'PRIVATE', 'WRONG TYPE', 'WRONG ARRAY', 'UNKNOWN LANGUAGE']) expect(text).not.toContain(value);
    expect(text).toContain('Public name');
  });

  it.each(['javascript:alert(1)', 'data:text/html,private', 'file:///etc/hosts', '//example.test', 'https://user:secret@example.test', 'https://example.test\n/private'])('rejects unsafe or credential-bearing public URLs: %s', value => {
    expect(publicHttpUrl(value)).toBeNull();
  });

  it('keeps zero percentages while omitting invalid numbers and inactive operator data', () => {
    expect(publicCarCleaningData({ ...validCleaner, recycled_content: 0 }).recycled_content).toBe(0);
    for (const value of [Infinity, NaN, -1, 101, '50', {}, []]) expect(publicCarCleaningData({ ...validCleaner, recycled_content: value })).not.toHaveProperty('recycled_content');
    expect(publicCarCleaningData({ ...validCleaner, eu_operator_name: 'INACTIVE' })).not.toHaveProperty('eu_operator_name');
  });

  it('exports a stable schema without internal record names or owner identity', () => {
    const exported = exportCarCleaningPassport({ name: 'PRIVATE RECORD', user_id: 'PRIVATE USER', category_data: validCleaner });
    expect(exported.name).toBe('QA Car shampoo');
    expect(JSON.stringify(exported)).not.toContain('PRIVATE');
  });
});
