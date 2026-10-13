import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DETERGENTS_PUBLIC_COPY } from './publicCopy';
import { DETERGENT_ALLERGEN_PICKER_COPY } from '@/data/detergentFragrances';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('Detergents translation keys used in code are all defined', () => {
  it('every detergentsPublic key used by the public page has English copy, and the reverse', () => {
    const source = read('src/components/detergents/DetergentPublicPassport.tsx');
    const used = new Set([...source.matchAll(/detergentsPublic\.([A-Za-z.]+)'/g)].map((m) => m[1]));
    expect([...used].sort()).toEqual(Object.keys(DETERGENTS_PUBLIC_COPY).sort());
  });

  it('every allergenPicker key used by the picker has English copy, and the reverse', () => {
    const source = read('src/components/detergents/DetergentAllergenPicker.tsx');
    const used = new Set([...source.matchAll(/detergents\.allergenPicker\.([A-Za-z]+)'/g)].map((m) => m[1]));
    expect([...used].sort()).toEqual(Object.keys(DETERGENT_ALLERGEN_PICKER_COPY).sort());
  });

  it('keeps the disclaimer keys used by the form', () => {
    const source = read('src/components/CategoryQuestions.tsx');
    expect(source).toContain("'detergents.disclaimer.title'");
    expect(source).toContain("'detergents.disclaimer.text'");
  });
});
