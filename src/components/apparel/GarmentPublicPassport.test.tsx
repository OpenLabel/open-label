/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/config';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test Operator', setup_complete: true, site_url: '' },
    loading: false,
    isSetupRequired: false,
    refetch: vi.fn(),
    saveConfig: vi.fn(),
  }),
  SiteConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { GarmentPublicPassport } from './GarmentPublicPassport';

const basePassport = {
  name: 'Demo T-Shirt',
  image_url: null,
  description: '<p>A fictitious garment</p>',
  category_data: {
    brand_name: 'Example Brand',
    product_type: 'T-shirt',
  } as Record<string, unknown>,
  updated_at: '2026-09-23T00:00:00.000Z',
};

function renderPassport(
  props: Partial<Parameters<typeof GarmentPublicPassport>[0]> = {},
) {
  return render(
    <MemoryRouter>
      <GarmentPublicPassport passport={basePassport} {...props} />
    </MemoryRouter>,
  );
}

describe('GarmentPublicPassport', () => {
  it('renders the DPP language picker', () => {
    renderPassport();
    expect(
      screen.getByRole('combobox', { name: i18n.getFixedT('en')('common.language') }),
    ).toBeInTheDocument();
  });

  it('renders the last updated date', () => {
    renderPassport();
    const expected = new Date(basePassport.updated_at).toLocaleDateString('en');
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  describe('internal evidence documents', () => {
    it('never renders the four internal document fields or their values', () => {
      renderPassport({
        passport: {
          ...basePassport,
          category_data: {
            ...basePassport.category_data,
            audit_certificate_file: 'INTERNALAUDITDOC',
            lca_report_file: 'INTERNALLCADOC',
            test_report_file: 'INTERNALTESTDOC',
            claims_evidence_file: 'INTERNALCLAIMSDOC',
            test_report_reference: 'Lab ABC report 42',
            claims_evidence_reference: 'Study reference 7',
          },
        },
      });

      const html = document.body.innerHTML;
      for (const secret of [
        'INTERNALAUDITDOC',
        'INTERNALLCADOC',
        'INTERNALTESTDOC',
        'INTERNALCLAIMSDOC',
      ]) {
        expect(html).not.toContain(secret);
      }
      // The public text references are still shown.
      expect(screen.getByText('Lab ABC report 42')).toBeInTheDocument();
      expect(screen.getByText('Study reference 7')).toBeInTheDocument();
    });
  });

  describe('translatable fields', () => {
    const passportWithClaims = {
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        environmental_claims: 'Made with 50% recycled polyester',
        environmental_claims_translations: {
          fr: 'Fabriqué avec 50% de polyester recyclé',
        },
      },
    };

    it('renders the translation when previewLanguage is set', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
        passport: passportWithClaims,
      });
      expect(
        screen.getByText('Fabriqué avec 50% de polyester recyclé'),
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Made with 50% recycled polyester'),
      ).not.toBeInTheDocument();
    });

    it('falls back to the source value when no translation exists', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
        passport: {
          ...passportWithClaims,
          category_data: {
            ...basePassport.category_data,
            environmental_claims: 'Made with 50% recycled polyester',
          },
        },
      });
      expect(
        screen.getByText('Made with 50% recycled polyester'),
      ).toBeInTheDocument();
    });
  });

  describe('structured composition', () => {
    it('renders the generated composition from translated fibre labels', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
        passport: {
          ...basePassport,
          category_data: {
            ...basePassport.category_data,
            primary_fiber: 'cotton',
            primary_fiber_percentage: 80,
            secondary_fiber: 'recycled_polyester',
            secondary_fiber_percentage: 20,
          },
        },
      });
      expect(screen.getByText('80% Coton, 20% Polyester recyclé')).toBeInTheDocument();
    });

    it('omits None and shows full composition as a supplementary note', () => {
      renderPassport({
        passport: {
          ...basePassport,
          category_data: {
            ...basePassport.category_data,
            primary_fiber: 'cotton',
            primary_fiber_percentage: 100,
            secondary_fiber: 'none',
            full_composition: 'Trim: 100% recycled polyester',
          },
        },
      });
      expect(screen.getByText('100% Cotton')).toBeInTheDocument();
      expect(screen.queryByText(/None \(single-fibre product\)/)).not.toBeInTheDocument();
      expect(screen.getByText('Additional composition details')).toBeInTheDocument();
      expect(screen.getByText('Trim: 100% recycled polyester')).toBeInTheDocument();
    });
  });

  describe('product name heading', () => {
    it('renders the translated product name when previewLanguage is set', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
        passport: {
          ...basePassport,
          name: 'Demo T-Shirt',
          category_data: {
            ...basePassport.category_data,
            product_name: 'Demo T-Shirt',
            product_name_translations: { fr: 'T-shirt de démonstration' },
          },
        },
      });
      expect(
        screen.getByRole('heading', { level: 1, name: 'T-shirt de démonstration' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', { level: 1, name: 'Demo T-Shirt' }),
      ).not.toBeInTheDocument();
    });

    it('falls back to category_data.product_name when no translation exists', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
        passport: {
          ...basePassport,
          name: 'Demo T-Shirt',
          category_data: {
            ...basePassport.category_data,
            product_name: 'Product Name Fallback',
          },
        },
      });
      expect(
        screen.getByRole('heading', { level: 1, name: 'Product Name Fallback' }),
      ).toBeInTheDocument();
    });

    it('falls back to passport.name when neither translation nor product_name exists', () => {
      renderPassport({
        isPreview: true,
        previewLanguage: 'fr',
        onPreviewLanguageChange: () => {},
      });
      expect(
        screen.getByRole('heading', { level: 1, name: 'Demo T-Shirt' }),
      ).toBeInTheDocument();
    });
  });

  describe('certifications', () => {
    it('renders full certification names, never title-cased slugs', () => {
      renderPassport({
        passport: {
          ...basePassport,
          category_data: {
            ...basePassport.category_data,
            certifications_held: ['gots', 'oeko_tex'],
            certificate_references: 'GOTS — CU 123456',
            made_in_eu: true,
          },
        },
      });

      expect(
        screen.getByText('GOTS (Global Organic Textile Standard)'),
      ).toBeInTheDocument();
      expect(screen.getByText('OEKO-TEX Standard 100')).toBeInTheDocument();
      expect(screen.getByText('Made in EU')).toBeInTheDocument();

      const html = document.body.innerHTML;
      expect(html).not.toContain('Oeko Tex');
      expect(html).not.toContain('Made In Eu');
    });

    const withCerts = (extra: Record<string, unknown>) => ({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        certifications_held: ['gots', 'oeko_tex'],
        ...extra,
      },
    });

    it('shows an uploaded logo image instead of the text badge, falling back to text otherwise', () => {
      renderPassport({
        passport: withCerts({
          certificate_references: 'GOTS — CU 123456',
          cert_logo_gots: 'https://example.com/gots.png',
        }),
      });
      const img = screen.getByRole('img', { name: 'GOTS (Global Organic Textile Standard)' });
      expect(img).toHaveAttribute('src', 'https://example.com/gots.png');
      expect(screen.getByText('OEKO-TEX Standard 100')).toBeInTheDocument();
    });

    it('shows no logo or badge when certificate references are empty', () => {
      renderPassport({
        passport: withCerts({ cert_logo_gots: 'https://example.com/gots.png' }),
      });
      expect(screen.queryByRole('img', { name: /GOTS/ })).not.toBeInTheDocument();
      expect(screen.queryByText('OEKO-TEX Standard 100')).not.toBeInTheDocument();
    });

    it('never renders a non-http(s) logo URL', () => {
      renderPassport({
        passport: withCerts({
          certificate_references: 'GOTS — CU 123456',
          cert_logo_gots: 'javascript:alert(1)',
        }),
      });
      expect(screen.queryByRole('img', { name: /GOTS/ })).not.toBeInTheDocument();
      expect(screen.getByText('GOTS (Global Organic Textile Standard)')).toBeInTheDocument();
    });
  });
});
