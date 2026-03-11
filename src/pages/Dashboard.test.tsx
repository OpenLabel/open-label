import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@test.com' },
    loading: false,
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/usePassports', () => ({
  usePassports: () => ({
    passports: [],
    isLoading: false,
    error: null,
    duplicatePassport: { mutateAsync: vi.fn() },
    deletePassport: { mutateAsync: vi.fn() },
    reorderPassports: { mutate: vi.fn() },
  }),
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test', setup_complete: true, short_url: '' },
    loading: false,
    isSetupRequired: false,
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock('@/components/QRCodeDialog', () => ({
  QRCodeDialog: () => null,
}));

vi.mock('@/components/SortablePassportCard', () => ({
  SortablePassportCard: () => <div data-testid="passport-card" />,
}));

import Dashboard from './Dashboard';

describe('Dashboard page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('dashboard.title')).toBeInTheDocument();
  });

  it('shows empty state when no passports', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('dashboard.noPassports')).toBeInTheDocument();
  });

  it('shows create button', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('nav.createNew')).toBeInTheDocument();
  });

  it('shows user email', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });
});
