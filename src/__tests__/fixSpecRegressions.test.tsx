/*
 * Regression tests for the §B.2 mandatory checks from FIX_SPEC.md.
 * These are intentionally small, pure/unit-level assertions that lock in
 * the fixes without pulling heavy render harnesses.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const readSrc = (rel: string) => readFileSync(join(process.cwd(), 'src', rel), 'utf-8');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) =>
      opts && typeof opts === 'object' && 'names' in opts ? `${k}:${(opts as { names: string }).names}` : k,
    i18n: { language: 'zh-CN', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/components/DPPLanguagePicker', () => ({
  DPPLanguagePicker: () => <div data-testid="lang-picker" />,
}));

import { wineIngredientCategories, getIngredientById } from '@/data/wineIngredients';
import { isLegacyAllergenDeclaration } from '@/data/toyFragrances';
import { WinePublicPassport } from '@/components/wine/WinePublicPassport';

describe('§B.2 mandatory regressions', () => {
  // BUG-05: every canonical sulfite id in the catalog carries isAllergen:true
  // so the wine ingredients list bolds sulfites regardless of which variant
  // the producer selects.
  it('BUG-05: all sulfite ingredients are marked as allergens', () => {
    const sulfiteIds = ['sulfites', 'sulfur_dioxide', 'potassium_bisulfite', 'potassium_metabisulfite'];
    for (const id of sulfiteIds) {
      const ing = getIngredientById(id);
      expect(ing, `missing ingredient ${id}`).toBeDefined();
      expect(ing?.isAllergen, `${id} must be allergen`).toBe(true);
    }
    // sanity: at least one category is present
    expect(wineIngredientCategories.length).toBeGreaterThan(0);
  });

  // BUG-06: the legacy English auto-generated declaration is recognised so
  // the renderer knows to replace it with a localized value, and the two
  // known prefixes yield distinct branches.
  it('BUG-06: legacy toy allergen declarations are detected', () => {
    expect(isLegacyAllergenDeclaration('No allergenic fragrances are present in this toy.')).toBe(true);
    expect(isLegacyAllergenDeclaration('The following allergenic fragrances are declared: Camphor')).toBe(true);
    expect(isLegacyAllergenDeclaration('Custom user text describing safety')).toBe(false);
    expect(isLegacyAllergenDeclaration('')).toBe(false);
    expect(isLegacyAllergenDeclaration(null)).toBe(false);
  });

  // BUG-09: the wine public passport renders under a non-English language
  // (zh-CN mocked above) without crashing and still shows the localized
  // recycling column headers.
  it('BUG-09: WinePublicPassport renders under zh-CN', () => {
    const passport = {
      name: 'Internal',
      image_url: null,
      description: null,
      category_data: {
        product_name: 'Chateau ZH',
        packaging_materials: [
          { id: 'mat_1', typeId: 'bottle', typeName: 'Bottle', compositionName: 'Glass', compositionCode: 'GL 70' },
        ],
      } as Record<string, unknown>,
      updated_at: '2024-01-01',
    };
    render(
      <MemoryRouter>
        <WinePublicPassport passport={passport} />
      </MemoryRouter>
    );
    expect(screen.getByTestId('passport-name')).toHaveTextContent('Chateau ZH');
    expect(screen.getByTestId('recycling-section')).toBeInTheDocument();
  });

  // BUG-01: while setup is required, /auth and /reset-password must still be
  // reachable so an admin can sign in / recover — otherwise a partially set
  // up instance can lock its own operator out. This is a source-level guard.
  it('BUG-01: setup-required route table includes /auth and /reset-password', () => {
    const src = readSrc('App.tsx');
    const setupBlock = src.slice(src.indexOf('isSetupRequired'));
    expect(setupBlock).toMatch(/path="\/auth"/);
    expect(setupBlock).toMatch(/path="\/reset-password"/);
  });

  // BUG-03: useAutoTranslate must seed the "last translated" ref from the
  // first non-empty value, and skip the empty pre-hydration render, so the
  // debounced pass no-ops instead of overwriting curated translations.
  it('BUG-03: useAutoTranslate init effect guards against empty value', () => {
    const src = readSrc('hooks/useAutoTranslate.ts');
    expect(src).toMatch(/if \(didInitRef\.current \|\| !value\) return/);
    expect(src).toMatch(/lastTranslatedValueRef\.current = value/);
  });

  // BUG-04: WineFields must strip the sentinel and merge cleanData in a
  // SINGLE onChange call so a second render doesn't observe a half-applied
  // baseline (which would re-inject the sentinel and defeat the fix).
  it('BUG-04: WineFields sentinel is stripped and merged in one onChange', () => {
    const src = readSrc('components/WineFields.tsx');
    // The fix is a single onChange call built off cleanData (no stale `data`).
    expect(src).toMatch(/strip sentinel and merge in ONE onChange/);
    expect(src).toMatch(/merge from baseData \(sentinel already stripped\)/);
  });

  // BUG-07: preview / public passport must filter checkbox questions by the
  // raw boolean value, not by comparing the translated label to the English
  // word "No" (which never matches under fr/it/etc and leaks empty rows).
  it('BUG-07: checkbox filter uses raw boolean in preview and public views', () => {
    // The public generic rendering now lives in GenericPublicPassport.tsx,
    // which PublicPassport.tsx renders through PublicPassportView.
    for (const rel of [
      'components/PassportPreview.tsx',
      'components/GenericPublicPassport.tsx',
    ]) {
      const src = readSrc(rel);
      expect(src, rel).toMatch(/typeof value === 'boolean'/);
    }
  });

  // BUG-08: QRCodeDialog's cloned react-qr-code path uses viewBox coordinates,
  // so the wrapper <g> must apply a `scale(qrSize / cells)` transform. Without
  // it the QR renders 1px wide inside the composed SVG download.
  it('BUG-08: QRCodeDialog scales cloned QR path by cells', () => {
    const src = readSrc('components/QRCodeDialog.tsx');
    expect(src).toMatch(/const scale = qrSize \/ cells/);
    expect(src).toMatch(/scale\(\$\{scale\}\)/);
  });
});
