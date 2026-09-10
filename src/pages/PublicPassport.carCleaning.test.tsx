import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const { passport } = vi.hoisted(() => ({ passport: {
  id: 'car-1', name: 'Internal formula trial', category: 'car_cleaning', image_url: null,
  description: '<p>Car shampoo</p>', updated_at: '2026-09-10T12:00:00Z',
  category_data: { product_name: 'Clean car', product_type: 'shampoo', internal_notes: 'Confidential formulation' },
} }));
vi.mock('@/hooks/usePassports', () => ({ usePassportBySlug: () => ({ data: passport, isLoading: false, error: null }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({
  t: (key: string, fallback?: string) => fallback || key,
  i18n: { language: 'en', getFixedT: () => (key: string, fallback?: string) => fallback || key, changeLanguage: vi.fn() },
}) }));
vi.mock('@/components/DPPLanguagePicker', () => ({ DPPLanguagePicker: () => <div data-testid="passport-language-picker" /> }));
import PublicPassport from './PublicPassport';
import { PassportPreview } from '@/components/PassportPreview';

function page() {
  return render(<MemoryRouter initialEntries={['/p/aabbccdd']}><Routes><Route path="/p/:slug" element={<PublicPassport />} /></Routes></MemoryRouter>);
}

describe('Car cleaning public routing', () => {
  it('routes public car passports to the consumer view with localizable language selection and JSON export', () => {
    page();
    expect(screen.getByTestId('passport-language-picker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /json/i })).toBeInTheDocument();
    expect(screen.getByText('Clean car')).toBeInTheDocument();
    expect(screen.queryByText('Internal formula trial')).not.toBeInTheDocument();
    expect(screen.queryByText('Confidential formulation')).not.toBeInTheDocument();
  });

  it('uses the same consumer view in preview without live export controls', () => {
    render(<MemoryRouter><PassportPreview formData={{ ...passport, category: 'car_cleaning' }} /></MemoryRouter>);
    expect(screen.getByTestId('passport-language-picker')).toBeInTheDocument();
    expect(screen.getByText('Clean car')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /json/i })).not.toBeInTheDocument();
  });
});
