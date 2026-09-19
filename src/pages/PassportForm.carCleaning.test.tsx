import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { validCleaner } from '@/components/car-cleaning/testFixtures';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@test.com' },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

const { updatePassport, existing } = vi.hoisted(() => ({
  updatePassport: vi.fn().mockResolvedValue({ id: 'car-1', public_slug: 'aabbccdd' }),
  existing: { id: 'car-1', user_id: 'u1', name: 'Car record', category: 'car_cleaning',
    image_url: null, description: '', language: 'en', category_data: {}, updated_at: '2026-09-10' },
}));
vi.mock('@/hooks/usePassports', () => ({
  usePassports: () => ({ createPassport: { mutateAsync: vi.fn() }, updatePassport: { mutateAsync: updatePassport } }),
  usePassportById: () => ({ data: existing, isLoading: false }),
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
  RichTextEditor: ({ content, onChange }: { content: string; onChange: (value: string) => void }) => <textarea data-testid="rich-editor" value={content} onChange={event => onChange(event.target.value)} />,
}));

vi.mock('@/components/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
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

describe('Car cleaning save validation', () => {
  beforeEach(() => { vi.clearAllMocks(); existing.category = 'car_cleaning'; existing.category_data = {}; });
  const renderForm = (path = '/passport/car-1/edit') => render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/passport/new" element={<PassportForm />} />
    <Route path="/passport/:id/edit" element={<PassportForm />} />
  </Routes></MemoryRouter>);

  it('gives the icon-only header back action its translated accessible name', () => {
    renderForm();
    expect(screen.getByRole('button', { name: (name) => name === 'common.back' })).toBeEnabled();
  });

  it.each([
    ['/passport/new', 'common.create'],
    ['/passport/car-1/edit', 'passport.saveChanges'],
  ])('keeps the %s submit action named when narrow-screen labels are hidden', (path, name) => {
    renderForm(path);
    const submit = document.querySelector<HTMLButtonElement>('header button[type="submit"][form="passport-form"]')!;
    // Below the sm breakpoint the real stylesheet hides these responsive labels.
    // JSDOM has no media layout, so reproduce their resulting visibility state.
    submit.querySelectorAll('span').forEach(span => { span.hidden = true; });
    expect(submit).toHaveAccessibleName(name);
    expect(submit).toBeEnabled();
  });

  it('blocks saving an incomplete car cleaning record even when its internal name exists', () => {
    renderForm();
    fireEvent.submit(document.getElementById('passport-form')!);
    expect(updatePassport).not.toHaveBeenCalled();
  });

  it('links the required public product name to its real summary error and clears it after correction', () => {
    existing.category_data = { ...validCleaner, product_name: '' };
    renderForm();
    const input = screen.getByLabelText('passport.productName');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const errorIds = input.getAttribute('aria-describedby');
    expect(errorIds).toBeTruthy();
    for (const id of errorIds!.split(/\s+/)) {
      const error = document.getElementById(id)!;
      expect(document.getElementById('car-cleaning-validation')).toContainElement(error);
      expect(error).toHaveTextContent('carCleaning.validation.required');
      fireEvent.click(error.querySelector('button')!);
      expect(input).toHaveFocus();
    }
    expect(input).toHaveAccessibleDescription();
    fireEvent.change(input, { target: { value: 'QA corrected public name' } });
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(document.getElementById('car-cleaning-validation')).not.toBeInTheDocument();
  });

  it.each(['car_cleaning', 'other'])('leaves an assessed %s product name without car error attributes', (category) => {
    existing.category = category;
    existing.category_data = { ...validCleaner };
    renderForm();
    const input = screen.getByLabelText('passport.productName');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('preserves the existing nonblocking save behavior for other categories', async () => {
    existing.category = 'other';
    renderForm();
    await act(async () => { fireEvent.submit(document.getElementById('passport-form')!); });
    expect(updatePassport).toHaveBeenCalledWith(expect.objectContaining({ category: 'other', category_data: {} }));
  });
  it('persists a valid assessed car record with its conditional JSON data intact', async () => {
    existing.category_data = { ...validCleaner };
    renderForm();
    await act(async () => { fireEvent.submit(document.getElementById('passport-form')!); });
    expect(updatePassport).toHaveBeenCalledOnce();
    expect(updatePassport).toHaveBeenCalledWith(expect.objectContaining({ id: 'car-1', category: 'car_cleaning', category_data: validCleaner }));
  });

  it('blocks health hazard publication until the applicable information is supplied', () => {
    existing.category_data = { ...validCleaner, clp_classification: 'health_physical', pcn_applicability: 'required' };
    renderForm();
    fireEvent.submit(document.getElementById('passport-form')!);
    expect(updatePassport).not.toHaveBeenCalled();
  });

  it('does not expose wine or toy AI extractors for chemical products', () => {
    renderForm();
    expect(screen.queryByTestId('wine-ai')).not.toBeInTheDocument();
    expect(screen.queryByTestId('toy-ai')).not.toBeInTheDocument();
  });

});
