/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '@/i18n/config';
import { buildSampleDetergentsPassport } from '@/data/samples/detergents';
import { detergentsTemplate } from '@/templates/detergents';

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

import { DetergentPublicPassport, SUPPLIER_REVIEW_FIELD_IDS } from './DetergentPublicPassport';

const sample = buildSampleDetergentsPassport();

function passportWith(data: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
  return {
    name: sample.name,
    image_url: null,
    description: sample.description,
    category_data: { ...(sample.category_data as Record<string, unknown>), ...data },
    updated_at: '2026-10-13T00:00:00.000Z',
    ...extra,
  };
}

function renderPassport(
  data: Record<string, unknown> = {},
  props: Partial<Parameters<typeof DetergentPublicPassport>[0]> = {},
  extra: Record<string, unknown> = {},
) {
  return render(
    <MemoryRouter>
      <DetergentPublicPassport passport={passportWith(data, extra)} {...props} />
    </MemoryRouter>,
  );
}

describe('DetergentPublicPassport', () => {
  describe('page frame', () => {
    it('renders the header with product name, brand, type and net content', () => {
      renderPassport();
      expect(screen.getByRole('heading', { level: 1, name: 'Sample Laundry Liquid' })).toBeInTheDocument();
      expect(screen.getByText('Detergents: Digital Product Passport', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Example Clean · Laundry detergent · 1.5 L')).toBeInTheDocument();
    });

    it('states honestly that the page is not a certification', () => {
      renderPassport();
      expect(screen.getByText(/It is not a certification or an approval/)).toBeInTheDocument();
    });

    it('renders the DPP language picker and the last updated date', () => {
      renderPassport();
      expect(screen.getByRole('combobox', { name: i18n.getFixedT('en')('common.language') })).toBeInTheDocument();
      expect(screen.getByText(new Date('2026-10-13T00:00:00.000Z').toLocaleDateString('en'))).toBeInTheDocument();
    });

    it('renders the reader-order sections that have data', () => {
      renderPassport();
      for (const id of ['product', 'hazard', 'use', 'ingredients', 'environment']) {
        expect(screen.getByTestId(`section-${id}`)).toBeInTheDocument();
      }
      expect(screen.queryByTestId('section-biocide')).not.toBeInTheDocument();
      expect(screen.queryByTestId('section-annex')).not.toBeInTheDocument();
      expect(screen.getByText('Who is responsible')).toBeInTheDocument();
      expect(screen.getByText('DPP infrastructure')).toBeInTheDocument();
    });

    it('hides a section that has no data', () => {
      renderPassport({ packaging_material: undefined, packaging_recyclable: undefined, recycled_packaging_content: undefined, environmental_claims: undefined, claims_evidence_reference: undefined });
      expect(screen.queryByTestId('section-environment')).not.toBeInTheDocument();
    });

    it('shows the powered-by attribution and the legal link, but no legal link in preview', () => {
      const { unmount } = renderPassport();
      expect(screen.getByText('Open Label', { exact: false })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Legal mentions|legal/i })).toBeInTheDocument();
      unmount();
      renderPassport({}, { isPreview: true });
      expect(screen.queryByRole('link', { name: /Legal mentions/i })).not.toBeInTheDocument();
    });

    it('uses no forced upper-case styling on labels', () => {
      const { container } = renderPassport();
      for (const dt of container.querySelectorAll('dt')) {
        expect(dt.className).not.toMatch(/uppercase/);
      }
    });
  });

  describe('Apparel lessons: claims and parent-gating', () => {
    it('shows a ticked fact as "Yes" and never shows an unticked box', () => {
      renderPassport({ packaging_recyclable: true, refill_available: false });
      const section = screen.getByTestId('section-environment');
      expect(within(section).getByText('Packaging recyclable?')).toBeInTheDocument();
      expect(within(section).queryByText('Refill available?')).not.toBeInTheDocument();
      expect(within(section).queryByText(/Confirmed/)).not.toBeInTheDocument();
    });

    it('never shows the supplier self-review answers', () => {
      renderPassport();
      for (const id of SUPPLIER_REVIEW_FIELD_IDS) {
        const q = detergentsTemplate.sections.flatMap((s) => s.questions).find((x) => x.id === id)!;
        expect(screen.queryByText(q.label), id).not.toBeInTheDocument();
      }
      expect(screen.queryByText(/I have checked the physical label/)).not.toBeInTheDocument();
    });

    it('does not show an unfinished assessment as an answer', () => {
      renderPassport({ clp_classification: 'review', preservatives_present: 'review' });
      expect(screen.queryByText('Assessment needed')).not.toBeInTheDocument();
    });

    it('hides laundry dosage when the product type changed, even with stale saved values', () => {
      renderPassport({ product_type: 'glass', surface_dilution: 'Dilute 1 part in 10 parts of water.' });
      expect(screen.queryByText('Dose for hard water (per standard load)')).not.toBeInTheDocument();
      expect(screen.queryByText('Laundry detergent type')).not.toBeInTheDocument();
      expect(screen.getByText('Recommended dilution and quantity per surface area')).toBeInTheDocument();
      expect(screen.getByText('Dilute 1 part in 10 parts of water.')).toBeInTheDocument();
    });

    it('shows laundry dosage with its unit for a laundry detergent', () => {
      renderPassport();
      expect(screen.getByText('90 ml')).toBeInTheDocument();
      expect(screen.getByText('Laundry detergent type')).toBeInTheDocument();
    });

    it('hides hazard wording for an unclassified product even with stale saved values', () => {
      renderPassport({ clp_classification: 'none', hazard_statements: 'H319 stale' });
      expect(screen.queryByText('H319 stale')).not.toBeInTheDocument();
    });

    it('hides the ingredients page link for professional products and shows the equivalent information', () => {
      renderPassport({ use_sector: 'professional', professional_ingredient_info: 'Supplied with the technical data sheet.' });
      expect(screen.queryByText('Public ingredients web page')).not.toBeInTheDocument();
      expect(screen.getByText('Supplied with the technical data sheet.')).toBeInTheDocument();
    });

    it('shows the EU Ecolabel badge only when a licence number is entered', () => {
      const { unmount } = renderPassport();
      expect(screen.queryByText('EU Ecolabel')).not.toBeInTheDocument();
      unmount();
      const second = renderPassport({ ecolabel_licence_number: '   ' });
      expect(screen.queryByText('EU Ecolabel')).not.toBeInTheDocument();
      second.unmount();
      renderPassport({ ecolabel_licence_number: 'FR/044/001' });
      expect(screen.getAllByText('EU Ecolabel').length).toBeGreaterThan(0);
      expect(screen.getByText(/FR\/044\/001/)).toBeInTheDocument();
    });
  });

  describe('ingredients and allergens', () => {
    it('shows each ticked constituent class with its weight range', () => {
      renderPassport();
      const section = screen.getByTestId('section-ingredients');
      expect(within(section).getByText('Anionic surfactants')).toBeInTheDocument();
      expect(within(section).getByText(/5% or over but less than 15%/)).toBeInTheDocument();
      expect(within(section).getByText('Soap')).toBeInTheDocument();
    });

    it('does not show a class that is not ticked, even with a stale weight range', () => {
      renderPassport({ constituent_classes: ['anionic_surfactants'], band_soap: 'gte30' });
      const section = screen.getByTestId('section-ingredients');
      expect(within(section).queryByText('Soap')).not.toBeInTheDocument();
      expect(within(section).queryByText(/30% and more/)).not.toBeInTheDocument();
    });

    it('lists the declared allergens with their CAS number', () => {
      renderPassport({
        allergens_above_threshold: 'yes',
        fragrance_allergens: [
          { id: 'linalool', name: 'Linalool', cas: '78-70-6' },
          { id: 'coumarin', name: 'Coumarin', cas: '91-64-5' },
        ],
      });
      expect(screen.getByText('Linalool')).toBeInTheDocument();
      expect(screen.getByText('(CAS 78-70-6)')).toBeInTheDocument();
      expect(screen.getByText('Coumarin')).toBeInTheDocument();
    });

    it('does not list allergens when none are declared above the threshold', () => {
      renderPassport({
        allergens_above_threshold: 'no',
        fragrance_allergens: [{ id: 'linalool', name: 'Linalool', cas: '78-70-6' }],
      });
      expect(screen.queryByText('Linalool')).not.toBeInTheDocument();
    });

    it('lists classes added at any concentration', () => {
      renderPassport();
      expect(screen.getByText('Enzymes')).toBeInTheDocument();
      expect(screen.getByText('Perfumes')).toBeInTheDocument();
    });
  });

  describe('translation', () => {
    it('shows the supplier translation of hazard wording for the chosen language and falls back to the source', () => {
      const data = { hazard_statements_translations: { fr: 'H319 Provoque une sévère irritation des yeux.' } };
      const fr = renderPassport(data, { previewLanguage: 'fr' });
      expect(screen.getByText('H319 Provoque une sévère irritation des yeux.')).toBeInTheDocument();
      fr.unmount();
      renderPassport(data, { previewLanguage: 'es' });
      expect(screen.getByText(/H319 Causes serious eye irritation/)).toBeInTheDocument();
    });

    it('uses the translated product name for the chosen language', () => {
      renderPassport({ product_name_translations: { de: 'Beispiel Vollwaschmittel' } }, { previewLanguage: 'de' });
      expect(screen.getByRole('heading', { level: 1, name: 'Beispiel Vollwaschmittel' })).toBeInTheDocument();
    });

    it('renders template labels and option labels from the locale of the chosen language', () => {
      i18n.addResourceBundle(
        'fr',
        'translation',
        {
          detergents: {
            options: { productType: { laundry: 'Lessive' } },
            fields: { dosage_hard: { label: 'Dose pour eau dure (par charge standard)' } },
          },
          detergentsPublic: { sections: { hazard: 'Danger et sécurité' } },
        },
        true,
        true,
      );
      renderPassport({}, { previewLanguage: 'fr' });
      expect(screen.getByText('Example Clean · Lessive · 1.5 L')).toBeInTheDocument();
      expect(screen.getByText('Dose pour eau dure (par charge standard)')).toBeInTheDocument();
      expect(screen.getByText('Danger et sécurité')).toBeInTheDocument();
    });
  });

  describe('operators', () => {
    it('shows the manufacturer and hides importer and representative for an EU manufacturer', () => {
      renderPassport({ importer_legal_name: 'Stale Importer', eu_operator_name: 'Stale Rep' });
      expect(screen.getByText('Example Clean SAS')).toBeInTheDocument();
      expect(screen.queryByText('Stale Importer')).not.toBeInTheDocument();
      expect(screen.queryByText('Stale Rep')).not.toBeInTheDocument();
    });

    it('shows importer and authorised representative for a non-EU manufacturer', () => {
      renderPassport({
        manufacturer_non_eu: 'yes',
        importer_legal_name: 'Import Co',
        importer_city: 'Lyon',
        eu_operator_name: 'Rep Co',
        eu_operator_address: '1 Rue Exemple, Lyon',
      });
      expect(screen.getByText('Import Co')).toBeInTheDocument();
      expect(screen.getByText('Rep Co')).toBeInTheDocument();
      expect(screen.getByText('EU authorised representative')).toBeInTheDocument();
    });
  });

  describe('Annex VI dataset', () => {
    const annex = {
      detergent_scope: 'yes',
      dpp_profile: 'annex_vi',
      substance_list_route: 'full_list',
      substances: [{ chemical_name: 'Sodium laureth sulfate', addition: 'intentional', identifier_type: 'cas', identifier: '68585-34-2' }],
      microorganisms_added: 'yes',
      microorganisms: [{ genus: 'Bacillus', species: 'subtilis', strain: 'EX-1' }],
      persistent_product_id: 'https://id.example/p/123',
    };

    it('shows the Annex VI section, substances and micro-organisms on the Annex VI profile', () => {
      renderPassport(annex);
      const section = screen.getByTestId('section-annex');
      expect(within(section).getByText(/Sodium laureth sulfate/)).toBeInTheDocument();
      expect(within(section).getByText(/Bacillus/)).toBeInTheDocument();
      expect(within(section).getByText('Persistent product identifier')).toBeInTheDocument();
    });

    it('hides the Annex VI section on the current profile or for an out-of-scope product', () => {
      const current = renderPassport({ ...annex, dpp_profile: 'current' });
      expect(screen.queryByTestId('section-annex')).not.toBeInTheDocument();
      current.unmount();
      renderPassport({ ...annex, detergent_scope: 'no' });
      expect(screen.queryByTestId('section-annex')).not.toBeInTheDocument();
    });

    it('does not show the substance list when the equivalent safety data sheet route is chosen', () => {
      renderPassport({ ...annex, substance_list_route: 'equivalent_sds' });
      expect(screen.queryByText(/Sodium laureth sulfate/)).not.toBeInTheDocument();
    });
  });

  describe('safety of the output', () => {
    it('renders only safe web addresses as links', () => {
      renderPassport({ ingredients_url: 'javascript:alert(1)', sds_url: 'https://example-clean.example/sds' });
      expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
      expect(screen.getByRole('link', { name: /example-clean\.example\/sds/ })).toHaveAttribute(
        'href',
        'https://example-clean.example/sds',
      );
    });

    it('sanitises the description and strips images and scripts', () => {
      const { container } = renderPassport({}, {}, {
        description: '<p>Safe text</p><img src="x" onerror="alert(1)"><script>alert(2)</script>',
      });
      expect(screen.getByText('Safe text')).toBeInTheDocument();
      expect(container.querySelector('img[onerror]')).toBeNull();
      expect(container.querySelector('script')).toBeNull();
    });

    it('never renders an internal or file field', () => {
      expect(detergentsTemplate.sections.flatMap((s) => s.questions).some((q) => q.internal || q.type === 'file')).toBe(false);
    });
  });
});
