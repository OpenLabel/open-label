/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n/config';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { company_name: 'Test', site_url: '' } }),
}));

import { ToyPublicPassport } from './ToyPublicPassport';

function renderToy(category_data: Record<string, unknown>) {
  return render(
    <MemoryRouter>
      <ToyPublicPassport
        isPreview
        previewLanguage="fr"
        passport={{
          name: 'Source toy name',
          image_url: '/toy.png',
          description: '<p>Source toy description.</p>',
          category_data,
          updated_at: '2026-11-03T00:00:00.000Z',
        }}
      />
    </MemoryRouter>,
  );
}

describe('Toys public supplier translations', () => {
  it('shows the French description and sanitizes supplier HTML', () => {
    const { container } = renderToy({
      description_translations: { fr: '<p>Description française.</p><script>alert("unsafe")</script>' },
    });
    expect(screen.getByText('Description française.')).toBeInTheDocument();
    expect(screen.queryByText('Source toy description.')).not.toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
  });

  it('falls back to the source description when the language is missing', () => {
    renderToy({ description_translations: { de: '<p>Deutsche Beschreibung.</p>' } });
    expect(screen.getByText('Source toy description.')).toBeInTheDocument();
    expect(screen.queryByText('Deutsche Beschreibung.')).not.toBeInTheDocument();
  });

  it('shows the translated product name while preserving the image alt', () => {
    renderToy({ product_name_translations: { fr: 'Nom français du jouet' } });
    expect(screen.getByRole('heading', { name: 'Nom français du jouet', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Source toy name' })).toBeInTheDocument();
  });

  it('falls back to the passport name without a product name translation or source field', () => {
    renderToy({ product_name_translations: { de: 'Deutscher Spielzeugname' } });
    expect(screen.getByRole('heading', { name: 'Source toy name', level: 1 })).toBeInTheDocument();
  });
});