/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/config';
import { GenericPublicPassport } from './GenericPublicPassport';

const basePassport = {
  name: 'Fallback Name',
  image_url: null,
  description: '<p>A fictitious garment</p>',
  category_data: { product_name: 'Demo T-Shirt' },
  updated_at: '2026-09-23T00:00:00.000Z',
};

function renderPassport(props: Partial<Parameters<typeof GenericPublicPassport>[0]> = {}) {
  return render(
    <MemoryRouter>
      <GenericPublicPassport category="textiles" passport={basePassport} {...props} />
    </MemoryRouter>
  );
}

describe('GenericPublicPassport language behaviour', () => {
  it('renders the DPP language picker', () => {
    renderPassport();
    expect(screen.getByRole('combobox', { name: i18n.getFixedT('en')('common.language') })).toBeInTheDocument();
  });

  it('renders content in previewLanguage instead of the app language', () => {
    expect(i18n.language.startsWith('en')).toBe(true);
    renderPassport({ isPreview: true, previewLanguage: 'fr', onPreviewLanguageChange: () => {} });
    // Section heading comes from the fixed French translator, not the app language
    expect(screen.getByText('Description du produit')).toBeInTheDocument();
    expect(screen.queryByText('Product Description')).not.toBeInTheDocument();
    // App language must be untouched in preview (localOnly) mode
    expect(i18n.language.startsWith('en')).toBe(true);
  });

  it('defaults to English content when no previewLanguage is supplied', () => {
    renderPassport();
    expect(screen.getByText('Product Description')).toBeInTheDocument();
  });
});
