import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@test.com' },
    loading: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/usePassports', () => ({
  usePassports: () => ({
    createPassport: { mutateAsync: vi.fn() },
    updatePassport: { mutateAsync: vi.fn() },
  }),
  usePassportById: () => ({ data: null, isLoading: false }),
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
  useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn(), isUserEdited: vi.fn() }),
}));

import PassportForm from './PassportForm';

describe('PassportForm page', () => {
  const renderForm = () =>
    render(
      <MemoryRouter initialEntries={['/passport/new']}>
        <Routes>
          <Route path="/passport/:id" element={<PassportForm />} />
        </Routes>
      </MemoryRouter>
    );

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
    // The label has "passport.category *" so use a partial match
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
});
