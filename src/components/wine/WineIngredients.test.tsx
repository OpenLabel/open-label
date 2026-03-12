import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('./IngredientPickerDialog', () => ({
  IngredientPickerDialog: () => null,
}));

vi.mock('./CustomIngredientDialog', () => ({
  CustomIngredientDialog: () => null,
}));

vi.mock('@/data/wineIngredients', () => ({
  getIngredientById: (id: string) => ({ id, name: `Ingredient ${id}`, eNumber: 'E100', isAllergen: false }),
  getIngredientCategory: () => 'general',
}));

import { WineIngredients } from './WineIngredients';

describe('WineIngredients', () => {
  const onChange = vi.fn();

  beforeEach(() => onChange.mockClear());

  it('renders without crashing', () => {
    render(<WineIngredients data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.ingredients')).toBeInTheDocument();
  });

  it('shows add buttons', () => {
    render(<WineIngredients data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.selectFromList')).toBeInTheDocument();
    expect(screen.getByText('wine.defineCustom')).toBeInTheDocument();
  });

  it('renders ingredient list when ingredients exist', () => {
    const data = {
      ingredients: [
        { id: 'sulfites', name: 'Sulfites', isAllergen: true },
        { id: 'tartaric_acid', name: 'Tartaric acid', isAllergen: false },
      ],
    };
    render(<WineIngredients data={data} onChange={onChange} />);
    expect(screen.getByText('wine.sortIngredients')).toBeInTheDocument();
  });

  it('shows allergen warning when allergens present', () => {
    const data = {
      ingredients: [{ id: 'sulfites', name: 'Sulfites', isAllergen: true }],
    };
    render(<WineIngredients data={data} onChange={onChange} />);
    expect(screen.getByText('wine.allergenNotice')).toBeInTheDocument();
  });

  it('does not show allergen warning when no allergens', () => {
    const data = {
      ingredients: [{ id: 'tartaric_acid', name: 'Tartaric acid', isAllergen: false }],
    };
    render(<WineIngredients data={data} onChange={onChange} />);
    expect(screen.queryByText('wine.allergenNotice')).not.toBeInTheDocument();
  });

  it('removes ingredient when X clicked', () => {
    const data = {
      ingredients: [{ id: 'sulfites', name: 'Sulfites', isAllergen: true }],
    };
    const { container } = render(<WineIngredients data={data} onChange={onChange} />);
    // Find the remove button (last button with X icon)
    const removeButtons = container.querySelectorAll('button');
    const removeBtn = Array.from(removeButtons).find(btn => btn.querySelector('.lucide-x'));
    if (removeBtn) fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ ingredients: [] }));
  });

  it('shows custom badge for custom ingredients', () => {
    const data = {
      ingredients: [{ id: 'custom_test', name: 'My Ingredient', isCustom: true }],
    };
    render(<WineIngredients data={data} onChange={onChange} />);
    expect(screen.getByText('common.custom')).toBeInTheDocument();
  });
});
