import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/data/wineIngredients', () => ({
  wineIngredientCategories: [
    {
      id: 'general',
      name: 'General',
      ingredients: [
        { id: 'grapes', name: 'Grapes', isAllergen: false },
        { id: 'sulfites', name: 'Sulfites', isAllergen: true, eNumber: 'E220' },
      ],
    },
    {
      id: 'acids',
      name: 'Acids',
      ingredients: [
        { id: 'tartaric_acid', name: 'Tartaric acid', eNumber: 'E334', isAllergen: false },
      ],
    },
  ],
}));

import { IngredientPickerDialog } from './IngredientPickerDialog';

describe('IngredientPickerDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    selectedIds: [] as string[],
    onApply: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders dialog when open', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    expect(screen.getByText('wine.selectIngredientsTitle')).toBeInTheDocument();
  });

  it('shows ingredient categories', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    expect(screen.getByText('Grapes')).toBeInTheDocument();
    expect(screen.getByText('Sulfites')).toBeInTheDocument();
    expect(screen.getByText('Tartaric acid')).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText('common.search')).toBeInTheDocument();
  });

  it('filters ingredients by search', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('common.search');
    fireEvent.change(input, { target: { value: 'Sulfites' } });
    expect(screen.getByText('Sulfites')).toBeInTheDocument();
    expect(screen.queryByText('Grapes')).not.toBeInTheDocument();
  });

  it('shows no results message', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    const input = screen.getByPlaceholderText('common.search');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    expect(screen.getByText(/wine.noIngredientsFound/)).toBeInTheDocument();
  });

  it('has apply button', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    expect(screen.getByText('common.apply')).toBeInTheDocument();
  });

  it('calls onApply when apply clicked', () => {
    render(<IngredientPickerDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('common.apply'));
    expect(defaultProps.onApply).toHaveBeenCalled();
  });
});
