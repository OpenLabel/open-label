import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'test@test.com' }, loading: false }),
  AuthProvider: ({ children }: any) => children,
}));

const { existingPassport, useAutoTranslateMock } = vi.hoisted(() => ({
  existingPassport: { current: null as null | Record<string, unknown> },
  useAutoTranslateMock: vi.fn(() => ({ isTranslating: false, markAsUserEdited: vi.fn(), isUserEdited: vi.fn() })),
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
vi.mock('@/components/LanguageSwitcher', () => ({ LanguageSwitcher: () => <div /> }));
vi.mock('@/components/RichTextEditor', () => ({ RichTextEditor: () => <textarea data-testid="rich-editor" /> }));
vi.mock('@/components/ImageUpload', () => ({ ImageUpload: () => <div data-testid="image-upload" /> }));
vi.mock('@/components/CategoryQuestions', () => ({ CategoryQuestions: () => <div data-testid="category-questions" /> }));
vi.mock('@/components/WineFields', () => ({ WineFields: () => <div data-testid="wine-fields" /> }));
vi.mock('@/components/wine/WineAIAutofill', () => ({ WineAIAutofill: () => <div data-testid="wine-ai" /> }));
vi.mock('@/components/toys/ToyAIAutofill', () => ({ ToyAIAutofill: () => <div data-testid="toy-ai" /> }));
vi.mock('@/components/apparel/GarmentAIAutofill', () => ({ GarmentAIAutofill: () => <div data-testid="garment-ai" /> }));
vi.mock('@/components/PassportPreview', () => ({ PassportPreview: () => <div data-testid="preview" /> }));
vi.mock('@/components/CounterfeitProtection', () => ({ CounterfeitProtection: () => <div data-testid="counterfeit" /> }));
vi.mock('@/components/TranslationButton', () => ({
  TranslationButton: () => <button data-testid="translate-btn" />,
  EU_LANGUAGES: [{ code: 'en', name: 'English', nativeName: 'English' }],
}));
vi.mock('@/hooks/useAutoTranslate', () => ({ useAutoTranslate: useAutoTranslateMock }));

// The category dropdown only lists registered categories. Detergents is added
// to the real list when the category goes live, so list it here.
vi.mock('@/templates', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/templates')>();
  return {
    ...actual,
    categoryList: [
      ...actual.categoryList,
      { value: 'detergents' as const, label: 'Detergents', icon: '🧴', status: 'active' as const, regulation: 'EC 648/2004 · EU 2026/405' },
    ],
  };
});

import PassportForm from './PassportForm';

describe('PassportForm for Detergents', () => {
  beforeEach(() => {
    existingPassport.current = {
      id: 'detergents-1',
      name: 'Detergents DPP',
      category: 'detergents',
      image_url: null,
      description: '',
      language: 'en',
      category_data: { product_name: 'Sample Laundry Liquid' },
    };
    useAutoTranslateMock.mockClear();
  });

  const renderForm = () =>
    render(
      <MemoryRouter initialEntries={['/passport/detergents-1/edit']}>
        <Routes>
          <Route path="/passport/:id/edit" element={<PassportForm />} />
        </Routes>
      </MemoryRouter>,
    );

  it('does not render the standalone Product Name card, as for Apparel', () => {
    renderForm();
    expect(screen.queryByLabelText('passport.productName')).not.toBeInTheDocument();
    expect(screen.getByTestId('category-questions')).toBeInTheDocument();
  });

  it('turns off page-level Product Name auto-translation', () => {
    renderForm();
    expect(useAutoTranslateMock).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'Sample Laundry Liquid', enabled: false }),
    );
  });

  it('does not offer an AI label scanner', () => {
    renderForm();
    expect(screen.queryByTestId('wine-ai')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toy-ai')).not.toBeInTheDocument();
    expect(screen.queryByTestId('garment-ai')).not.toBeInTheDocument();
  });

  it('keeps the description, image and preview', () => {
    renderForm();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    expect(screen.getByTestId('preview')).toBeInTheDocument();
    expect(screen.getByTestId('rich-editor')).toBeInTheDocument();
  });
});
