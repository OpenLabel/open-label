import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/TranslationButton', () => ({
  TranslationButton: () => null,
}));

vi.mock('@/hooks/useAutoTranslate', () => ({
  useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn() }),
}));

import { CustomIngredientDialog } from './CustomIngredientDialog';

describe('CustomIngredientDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog when open', () => {
    render(<CustomIngredientDialog {...defaultProps} />);
    expect(screen.getByText('customIngredient.title')).toBeInTheDocument();
  });

  it('shows name input', () => {
    render(<CustomIngredientDialog {...defaultProps} />);
    expect(screen.getByLabelText(/customIngredient.ingredientName/)).toBeInTheDocument();
  });

  it('shows E-number input', () => {
    render(<CustomIngredientDialog {...defaultProps} />);
    expect(screen.getByLabelText('customIngredient.eNumber')).toBeInTheDocument();
  });

  it('shows allergen checkbox', () => {
    render(<CustomIngredientDialog {...defaultProps} />);
    expect(screen.getByLabelText('customIngredient.isAllergen')).toBeInTheDocument();
  });

  it('disables submit button when name is empty', () => {
    render(<CustomIngredientDialog {...defaultProps} />);
    const submitBtn = screen.getByText('customIngredient.addButton');
    expect(submitBtn).toBeDisabled();
  });

  it('shows edit title in edit mode', () => {
    render(
      <CustomIngredientDialog
        {...defaultProps}
        editIngredient={{ id: 'custom_1', name: 'Test', isCustom: true as const }}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByText('customIngredient.editTitle')).toBeInTheDocument();
  });

  it('pre-fills form in edit mode', () => {
    render(
      <CustomIngredientDialog
        {...defaultProps}
        editIngredient={{ id: 'custom_1', name: 'My Ingredient', eNumber: 'E999', isAllergen: true, isCustom: true as const }}
        onUpdate={vi.fn()}
      />
    );
    expect(screen.getByDisplayValue('My Ingredient')).toBeInTheDocument();
    expect(screen.getByDisplayValue('E999')).toBeInTheDocument();
  });
});
