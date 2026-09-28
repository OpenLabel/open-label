import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@test.com' },
    loading: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

const { existingPassport, useAutoTranslateMock } = vi.hoisted(() => ({
  existingPassport: { current: null as null | {
    id: string;
    name: string;
    category: 'textiles' | 'toys' | 'car_cleaning';
    image_url: null;
    description: string;
    language: string;
    category_data: Record<string, unknown>;
  } },
  useAutoTranslateMock: vi.fn(() => ({
    isTranslating: false,
    markAsUserEdited: vi.fn(),
    isUserEdited: vi.fn(),
  })),
}));

vi.mock('@/hooks/usePassports', () => ({
  usePassports: () => ({
    createPassport: { mutateAsync: vi.fn().mockResolvedValue({ id: 'new-id' }) },
    updatePassport: { mutateAsync: vi.fn() },
  }),
  usePassportById: () => ({ data: existingPassport.current, isLoading: false }),
  useLatestPassportDefaults: () => ({ data: null, isLoading: false }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: { from: () => ({ upload: vi.fn(), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    functions: { invoke: vi.fn() },
  },
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock('@/components/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange }: any) => <textarea data-testid="rich-editor" value={value} onChange={(e: any) => onChange(e.target.value)} />,
}));

vi.mock('@/components/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}));

vi.mock('@/components/CategoryQuestions', () => ({
  CategoryQuestions: () => <div data-testid="category-questions" />,
}));

vi.mock('@/components/WineFields', () => ({
  WineFields: () => <div data-testid="wine-fields" />,
}));

vi.mock('@/components/wine/WineAIAutofill', () => ({
  WineAIAutofill: () => <div data-testid="wine-ai" />,
}));

vi.mock('@/components/toys/ToyAIAutofill', () => ({
  ToyAIAutofill: () => <div data-testid="toy-ai" />,
}));

vi.mock('@/components/apparel/GarmentAIAutofill', () => ({
  GarmentAIAutofill: () => <div data-testid="garment-ai" />,
}));

vi.mock('@/components/PassportPreview', () => ({
  PassportPreview: () => <div data-testid="preview" />,
}));

vi.mock('@/components/CounterfeitProtection', () => ({
  CounterfeitProtection: () => <div data-testid="counterfeit" />,
}));

vi.mock('@/components/TranslationButton', () => ({
  TranslationButton: () => <button data-testid="translate-btn" />,
  EU_LANGUAGES: [{ code: 'en', name: 'English', nativeName: 'English' }],
}));

vi.mock('@/hooks/useAutoTranslate', () => ({
  useAutoTranslate: useAutoTranslateMock,
}));

import PassportForm from './PassportForm';

describe('PassportForm page', () => {
  beforeEach(() => {
    existingPassport.current = null;
    useAutoTranslateMock.mockClear();
  });

  const renderForm = (path = '/passport/new') =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/passport/:id" element={<PassportForm />} />
          <Route path="/passport/:id/edit" element={<PassportForm />} />
        </Routes>
      </MemoryRouter>
    );

  const renderExistingCategory = (category: 'textiles' | 'toys' | 'car_cleaning') => {
    existingPassport.current = {
      id: `${category}-1`,
      name: `${category} DPP`,
      category,
      image_url: null,
      description: '',
      language: 'en',
      category_data: { product_name: `${category} product` },
    };
    return renderForm(`/passport/${category}-1/edit`);
  };

  it('renders without crashing', () => {
    renderForm();
    expect(screen.getByText('passport.createTitle')).toBeInTheDocument();
  });

  it('shows basic info card', () => {
    renderForm();
    expect(screen.getByText('passport.basicInfo')).toBeInTheDocument();
  });

  it('shows DPP name field', () => {
    renderForm();
    expect(screen.getByPlaceholderText('passport.dppNamePlaceholder')).toBeInTheDocument();
  });

  it('shows category selector', () => {
    renderForm();
    expect(screen.getByText(/passport\.category/)).toBeInTheDocument();
  });

  it('shows save button', () => {
    renderForm();
    expect(screen.getAllByText('common.create').length).toBeGreaterThanOrEqual(1);
  });

  it('shows image upload', () => {
    renderForm();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  it('shows preview', () => {
    renderForm();
    expect(screen.getByTestId('preview')).toBeInTheDocument();
  });

  it('allows typing in the DPP name field', async () => {
    renderForm();
    const nameInput = screen.getByPlaceholderText('passport.dppNamePlaceholder');
    await userEvent.type(nameInput, 'My Product');
    expect(nameInput).toHaveValue('My Product');
  });

  it('shows back button', () => {
    renderForm();
    const backBtn = document.querySelector('.lucide-arrow-left')?.closest('button');
    expect(backBtn).toBeInTheDocument();
  });

  it('shows wine fields for wine category (default)', () => {
    renderForm();
    expect(screen.getByTestId('wine-fields')).toBeInTheDocument();
  });

  it('does not render the standalone Product Name card for Apparel', () => {
    renderExistingCategory('textiles');
    expect(screen.queryByLabelText('passport.productName')).not.toBeInTheDocument();
    expect(screen.getByTestId('category-questions')).toBeInTheDocument();
  });

  it.each(['toys', 'car_cleaning'] as const)(
    'keeps the standalone Product Name card for %s',
    (category) => {
      renderExistingCategory(category);
      expect(screen.getByLabelText('passport.productName')).toHaveValue(`${category} product`);
    },
  );

  it.each([
    ['textiles', false],
    ['toys', true],
    ['car_cleaning', true],
  ] as const)('sets page-level Product Name auto-translation for %s to %s', (category, enabled) => {
    renderExistingCategory(category);
    expect(useAutoTranslateMock).toHaveBeenCalledWith(
      expect.objectContaining({ value: `${category} product`, enabled }),
    );
  });
});
