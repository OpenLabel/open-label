import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/DPPLanguagePicker', () => ({
  DPPLanguagePicker: () => <div data-testid="lang-picker" />,
}));

import { WinePublicPassport } from './WinePublicPassport';

describe('WinePublicPassport render', () => {
  const basePassport = {
    name: 'Test Wine',
    image_url: null,
    description: null,
    category_data: {
      product_name: 'Château Test',
    },
    updated_at: '2024-01-01',
  };

  const renderComp = (passport = basePassport, props = {}) =>
    render(
      <MemoryRouter>
        <WinePublicPassport passport={passport} {...props} />
      </MemoryRouter>
    );

  it('renders product name', () => {
    renderComp();
    expect(screen.getByTestId('passport-name')).toHaveTextContent('Château Test');
  });

  it('renders language picker', () => {
    renderComp();
    expect(screen.getByTestId('lang-picker')).toBeInTheDocument();
  });

  it('renders legal mentions link', () => {
    renderComp();
    expect(screen.getByText('legal.legalMentions')).toBeInTheDocument();
  });

  it('renders powered by section', () => {
    renderComp();
    expect(screen.getByText('passport.poweredBy')).toBeInTheDocument();
  });

  it('shows volume when provided', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, volume: 750, volume_unit: 'ml' },
    });
    expect(screen.getByText('750 ml')).toBeInTheDocument();
  });

  it('shows vintage when provided', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, vintage: '2020' },
    });
    expect(screen.getByText('2020')).toBeInTheDocument();
  });

  it('shows grape variety when provided', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, grape_variety: 'Merlot' },
    });
    expect(screen.getByText('Merlot')).toBeInTheDocument();
  });

  it('shows product image when provided', () => {
    renderComp({
      ...basePassport,
      image_url: 'https://example.com/wine.jpg',
    });
    expect(screen.getByTestId('product-image')).toBeInTheDocument();
  });

  it('does not show image when null', () => {
    renderComp();
    expect(screen.queryByTestId('product-image')).not.toBeInTheDocument();
  });

  it('shows nutritional section when data present', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, energy_kcal: 70, energy_kj: 293 },
    });
    expect(screen.getByTestId('nutritional-section')).toBeInTheDocument();
  });

  it('does not show nutritional section when no data', () => {
    renderComp();
    expect(screen.queryByTestId('nutritional-section')).not.toBeInTheDocument();
  });

  it('shows ingredients when provided', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        ingredients: [{ id: 'grapes', name: 'Grapes', isAllergen: false, category: 'general' }],
      },
    });
    expect(screen.getByTestId('ingredients-section')).toBeInTheDocument();
  });

  it('renders allergen names in bold', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        ingredients: [{ id: 'sulfites', name: 'Sulfites', isAllergen: true, category: 'general' }],
      },
    });
    const list = screen.getByTestId('ingredients-list');
    const bold = list.querySelector('strong');
    expect(bold).toBeInTheDocument();
  });

  it('shows recycling section when materials provided', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        packaging_materials: [
          { id: 'mat_1', typeId: 'bottle', typeName: 'Bottle', compositionName: 'Glass', compositionCode: 'GL 70' },
        ],
      },
    });
    expect(screen.getByTestId('recycling-section')).toBeInTheDocument();
  });

  it('shows producer info when provided', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, producer_name: 'Domaine Test' },
    });
    expect(screen.getByTestId('producer-section')).toBeInTheDocument();
    expect(screen.getByText('Domaine Test')).toBeInTheDocument();
  });

  it('shows check authenticity button when counterfeit protection enabled', () => {
    renderComp({
      ...basePassport,
      category_data: { ...basePassport.category_data, counterfeit_protection_enabled: true },
    });
    expect(screen.getByText('passport.checkAuthenticity')).toBeInTheDocument();
  });

  it('shows negligible amounts notice when all small quantities are zero', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        energy_kcal: 70,
        energy_kj: 293,
        fat: 0,
        saturated_fat: 0,
        proteins: 0,
        salt: 0,
      },
    });
    expect(screen.getByText('wine.negligibleAmounts')).toBeInTheDocument();
  });

  it('shows wine attributes when display options are set', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        alcohol_percent: 13.5,
        show_alcohol_on_label: true,
        residual_sugar: 2.0,
        show_residual_sugar_on_label: true,
        total_acidity: 5.5,
        show_total_acidity_on_label: true,
      },
    });
    expect(screen.getByText('13.5% vol')).toBeInTheDocument();
    expect(screen.getByText('2 g/l')).toBeInTheDocument();
    expect(screen.getByText('5.5 g/l')).toBeInTheDocument();
  });

  it('groups gas ingredients as protective atmosphere', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        ingredients: [
          { id: 'nitrogen', name: 'Nitrogen', isAllergen: false, category: 'gases' },
        ],
      },
    });
    expect(screen.getByText('wine.bottledProtectiveAtmosphere')).toBeInTheDocument();
  });

  it('uses preview mode correctly', () => {
    renderComp(basePassport, { isPreview: true });
    // In preview, legal mentions should be a span not a link
    const legal = screen.getByText('legal.legalMentions');
    expect(legal.tagName).toBe('SPAN');
  });

  it('uses translated denomination when available', () => {
    renderComp({
      ...basePassport,
      category_data: {
        ...basePassport.category_data,
        denomination: 'AOP Original',
        denomination_translations: { en: 'PDO Translated' },
      },
    });
    expect(screen.getByText('PDO Translated')).toBeInTheDocument();
  });

  it('falls back to passport name if no product_name', () => {
    renderComp({
      ...basePassport,
      category_data: {},
    });
    expect(screen.getByTestId('passport-name')).toHaveTextContent('Test Wine');
  });
});
