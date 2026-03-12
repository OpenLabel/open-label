import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/data/wineIngredients', () => ({
  getAllIngredients: () => [
    { id: 'sulfites', name: 'Sulfites', isAllergen: true },
    { id: 'tartaric_acid', name: 'Tartaric acid', eNumber: 'E334', isAllergen: false },
  ],
  getIngredientCategory: () => 'general',
}));

vi.mock('@/data/wineRecycling', () => ({
  packagingMaterialTypes: [{ id: 'bottle', name: 'Bottle', icon: '🍾' }],
  materialCompositions: [{ id: 'gl70', name: 'Clear glass', code: 'GL 70' }],
  disposalMethods: [{ id: 'glass_bin', name: 'Glass recycling bin' }],
  getCompositionsByCategory: () => ({ individual: [], composite: [] }),
}));

vi.mock('@/templates/wine', () => ({
  volumeUnits: [{ value: 'ml', label: 'ml' }, { value: 'cl', label: 'cl' }, { value: 'l', label: 'l' }],
  wineCountries: ['France', 'Italy', 'Spain'],
}));

vi.mock('@/components/wine/WineIngredients', () => ({
  WineIngredients: () => <div data-testid="wine-ingredients" />,
}));

vi.mock('@/components/wine/WineRecycling', () => ({
  WineRecycling: () => <div data-testid="wine-recycling" />,
}));

vi.mock('@/components/TranslationButton', () => ({
  TranslationButton: () => null,
  Translations: {},
}));

vi.mock('@/hooks/useAutoTranslate', () => ({
  useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn(), isUserEdited: vi.fn() }),
}));

vi.mock('@/lib/wineCalculations', () => ({
  calculateWineNutrition: () => ({
    energyKcal: 70,
    energyKj: 293,
    carbohydrates: 2.5,
    sugar: 1.0,
  }),
}));

vi.mock('@/components/ui/field-hint', () => ({
  LabelWithHint: ({ label, required }: any) => <label>{label}{required ? ' *' : ''}</label>,
  FieldHint: ({ hint }: any) => <span className="field-hint">{hint}</span>,
}));

import { WineFields } from './WineFields';

describe('WineFields', () => {
  const onChange = vi.fn();

  beforeEach(() => onChange.mockClear());

  it('renders product identity card', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.productIdentity')).toBeInTheDocument();
  });

  it('renders product name input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.productName *')).toBeInTheDocument();
  });

  it('renders grape variety input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.grapeVariety')).toBeInTheDocument();
  });

  it('renders vintage input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.vintage')).toBeInTheDocument();
  });

  it('renders volume input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.volume')).toBeInTheDocument();
  });

  it('renders country selector', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.country')).toBeInTheDocument();
  });

  it('renders region input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.region')).toBeInTheDocument();
  });

  it('renders denomination input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.denomination')).toBeInTheDocument();
  });

  it('renders ingredients section', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByTestId('wine-ingredients')).toBeInTheDocument();
  });

  it('renders recycling section', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByTestId('wine-recycling')).toBeInTheDocument();
  });

  it('updates product name on change', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    const input = screen.getByPlaceholderText('wine.placeholders.productName');
    fireEvent.change(input, { target: { value: 'Château Test' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ product_name: 'Château Test' }));
  });

  it('renders with existing data', () => {
    const data = {
      product_name: 'My Wine',
      grape_variety: 'Merlot',
      vintage: '2020',
      volume: 750,
      volume_unit: 'ml',
      country: 'France',
      region: 'Bordeaux',
    };
    render(<WineFields data={data} onChange={onChange} />);
    expect(screen.getByDisplayValue('My Wine')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Merlot')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2020')).toBeInTheDocument();
  });

  it('renders nutritional values section', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.nutritionalValues')).toBeInTheDocument();
  });

  it('renders alcohol percent input', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.alcohol')).toBeInTheDocument();
  });

  it('renders producer info section', () => {
    render(<WineFields data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.producerInfo')).toBeInTheDocument();
  });
});
