import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/hooks/usePassports', () => ({
  usePassportBySlug: () => ({
    data: {
      id: 'p1',
      name: 'Test Product',
      category: 'other',
      image_url: null,
      description: 'A test product',
      category_data: { product_name: 'Widget' },
      updated_at: '2024-01-01',
    },
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/components/wine/WinePublicPassport', () => ({
  WinePublicPassport: () => <div data-testid="wine-passport" />,
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html },
}));

import PublicPassport from './PublicPassport';

describe('PublicPassport page', () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={['/p/test-slug']}>
        <Routes>
          <Route path="/p/:slug" element={<PublicPassport />} />
        </Routes>
      </MemoryRouter>
    );

  it('renders without crashing', () => {
    renderPage();
    expect(screen.getByText('Widget')).toBeInTheDocument();
  });

  it('shows description', () => {
    renderPage();
    expect(screen.getByText('A test product')).toBeInTheDocument();
  });

  it('shows legal mentions link', () => {
    renderPage();
    expect(screen.getByText('legal.legalMentions')).toBeInTheDocument();
  });

  it('shows powered by section', () => {
    renderPage();
    expect(screen.getByText('passport.poweredBy')).toBeInTheDocument();
  });

  it('shows product name from category_data', () => {
    renderPage();
    expect(screen.getByText('Widget')).toBeInTheDocument();
  });
});
