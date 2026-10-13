import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mimics i18next: an unknown key falls back to `defaultValue` and the
// remaining options are interpolated into it, like the real runtime does.
const translate = (
  k: string,
  opts?: Record<string, unknown> | string,
  extra?: Record<string, unknown>,
): string => {
  if (typeof opts === 'string') {
    return opts.replace(/\{\{(\w+)\}\}/g, (m, name) => (extra?.[name] === undefined ? m : String(extra[name])));
  }
  const def = opts?.defaultValue;
  if (typeof def !== 'string') return k;
  return def.replace(/\{\{(\w+)\}\}/g, (m, name) => (opts?.[name] === undefined ? m : String(opts[name])));
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: translate, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));
vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { ai_enabled: false }, loading: false, error: false }),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'test-owner' } }) }));

import { CategoryQuestions } from '@/components/CategoryQuestions';

const renderDetergents = (data: Record<string, unknown> = {}, onChange = vi.fn()) =>
  render(<CategoryQuestions category="detergents" data={data} onChange={onChange} />);

describe('CategoryQuestions for Detergents', () => {
  it('shows the Detergents disclaimer instead of the generic alpha warning', () => {
    renderDetergents();
    expect(screen.getByText('Detergents DPP: compliance disclaimer')).toBeInTheDocument();
    expect(screen.getByText(/Everything saved in this category is public/)).toBeInTheDocument();
    expect(screen.queryByText('passport.earlyAlpha')).not.toBeInTheDocument();
  });

  it('does not show the Detergents disclaimer for other categories, which keep their alpha warning', () => {
    render(<CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />);
    expect(screen.queryByText('Detergents DPP: compliance disclaimer')).not.toBeInTheDocument();
    expect(screen.getByText('passport.earlyAlpha')).toBeInTheDocument();
  });

  it('starts with Product Name inside Product identity and shows the required fields', () => {
    renderDetergents();
    expect(screen.getAllByText('Product identity').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getAllByText('Who is responsible').length).toBeGreaterThan(0);
  });

  it('lists the missing mandatory fields without blocking', () => {
    renderDetergents();
    expect(screen.getByText('Some mandatory fields are not filled')).toBeInTheDocument();
    expect(screen.getByText(/You can still save and publish this DPP/)).toBeInTheDocument();
  });

  describe('conditional sections and fields', () => {
    it('hides hazard wording until the product is classified, then shows it', () => {
      const { rerender } = renderDetergents({ clp_classification: 'none' });
      expect(screen.queryByText('Hazard statements')).not.toBeInTheDocument();
      expect(screen.getByText('Supplemental label statements')).toBeInTheDocument();
      rerender(
        <CategoryQuestions category="detergents" data={{ clp_classification: 'health_physical' }} onChange={vi.fn()} />,
      );
      expect(screen.getByText('Hazard statements')).toBeInTheDocument();
      expect(screen.getByText('Precautionary statements')).toBeInTheDocument();
      expect(screen.getByText('Signal word')).toBeInTheDocument();
      expect(screen.getByText('Poison centre notification (CLP Annex VIII)')).toBeInTheDocument();
    });

    it('asks for a weight range only for the classes that are ticked', () => {
      renderDetergents({ constituent_classes: ['soap', 'edta'] });
      expect(screen.getByText('Soap: weight range')).toBeInTheDocument();
      expect(screen.getByText('EDTA and salts thereof: weight range')).toBeInTheDocument();
      expect(screen.queryByText('Zeolites: weight range')).not.toBeInTheDocument();
    });

    it('shows laundry dosage fields only for a laundry detergent', () => {
      const { rerender } = renderDetergents({ product_type: 'laundry' });
      expect(screen.getByText('Dose for hard water (per standard load)')).toBeInTheDocument();
      expect(screen.getByText('Laundry detergent type')).toBeInTheDocument();
      rerender(<CategoryQuestions category="detergents" data={{ product_type: 'glass' }} onChange={vi.fn()} />);
      expect(screen.queryByText('Dose for hard water (per standard load)')).not.toBeInTheDocument();
      expect(screen.getByText('Recommended dilution and quantity per surface area')).toBeInTheDocument();
    });

    it('shows importer and authorised representative only for a non-EU manufacturer', () => {
      const { rerender } = renderDetergents({ manufacturer_non_eu: 'no' });
      expect(screen.queryByText('Importer legal name')).not.toBeInTheDocument();
      rerender(<CategoryQuestions category="detergents" data={{ manufacturer_non_eu: 'yes' }} onChange={vi.fn()} />);
      expect(screen.getByText('Importer legal name')).toBeInTheDocument();
      expect(screen.getByText('EU authorised representative: legal name')).toBeInTheDocument();
    });

    it('keeps the Annex VI sections hidden until the Annex VI profile is chosen for an in-scope product', () => {
      const { rerender } = renderDetergents({ detergent_scope: 'yes', dpp_profile: 'current' });
      expect(screen.queryAllByText('Annex VI: substances')).toHaveLength(0);
      rerender(
        <CategoryQuestions
          category="detergents"
          data={{ detergent_scope: 'yes', dpp_profile: 'annex_vi', substance_list_route: 'full_list', microorganisms_added: 'yes' }}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getAllByText('Annex VI: substances').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Annex VI: micro-organisms').length).toBeGreaterThan(0);
      // The shared substance and micro-organism list editors render their add buttons.
      expect(screen.getAllByRole('button', { name: 'Add entry' })).toHaveLength(2);
    });

    it('hides the Annex VI sections when the product is out of scope even if the profile was saved', () => {
      renderDetergents({ detergent_scope: 'no', dpp_profile: 'annex_vi' });
      expect(screen.queryAllByText('Annex VI: substances')).toHaveLength(0);
    });
  });

  describe('fragrance allergen picker', () => {
    it('appears only when allergens above the threshold are declared', () => {
      const { rerender } = renderDetergents({ allergens_above_threshold: 'no' });
      expect(screen.queryByRole('button', { name: /Add allergen/ })).not.toBeInTheDocument();
      rerender(<CategoryQuestions category="detergents" data={{ allergens_above_threshold: 'yes' }} onChange={vi.fn()} />);
      expect(screen.getByRole('button', { name: /Add allergen/ })).toBeInTheDocument();
    });

    it('stores the selected allergens as id, name and CAS objects', async () => {
      const onChange = vi.fn();
      renderDetergents({ allergens_above_threshold: 'yes' }, onChange);
      await userEvent.click(screen.getByRole('button', { name: /Add allergen/ }));
      const dialog = await screen.findByRole('dialog');
      await userEvent.type(within(dialog).getByPlaceholderText(/Search by name/), '78-70-6');
      await userEvent.click(within(dialog).getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          allergens_above_threshold: 'yes',
          fragrance_allergens: [{ id: 'linalool', name: 'Linalool', cas: '78-70-6' }],
        }),
      );
    });

    it('warns when allergens are declared but none is selected', () => {
      renderDetergents({ allergens_above_threshold: 'yes', fragrance_allergens: [] });
      expect(screen.getByText(/no allergen is selected/)).toBeInTheDocument();
    });
  });

  describe('inline warnings', () => {
    it('warns when the phosphorus content reaches the laundry limit', () => {
      renderDetergents({ product_type: 'laundry', phosphorus_per_dose_g: 0.6 });
      expect(screen.getByText(/0\.6 g is not below the 0\.5 g limit/)).toBeInTheDocument();
    });

    it('warns about the UFI format without blocking', () => {
      renderDetergents({
        clp_classification: 'health_physical',
        pcn_applicability: 'required',
        ufi_code: 'N1QV-R02N',
      });
      expect(screen.getByText(/A UFI has four groups of four characters/)).toBeInTheDocument();
    });
  });

  it('never renders a file upload, so nothing needs private storage', () => {
    const { container } = renderDetergents({ detergent_scope: 'yes', dpp_profile: 'annex_vi' });
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
