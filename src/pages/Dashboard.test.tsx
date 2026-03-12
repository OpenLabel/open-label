import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockSignOut = vi.fn();
const mockDuplicateAsync = vi.fn();
const mockDeleteAsync = vi.fn();
const mockReorderMutate = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@test.com' },
    loading: false,
    signOut: mockSignOut,
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/usePassports', () => ({
  usePassports: () => ({
    passports: [],
    isLoading: false,
    error: null,
    duplicatePassport: { mutateAsync: mockDuplicateAsync },
    deletePassport: { mutateAsync: mockDeleteAsync },
    reorderPassports: { mutate: mockReorderMutate },
  }),
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test', setup_complete: true, short_url: 'https://open-label.eu' },
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
  SortablePassportCard: ({ passport, onShowQR, onDuplicate, onDelete }: any) => (
    <div data-testid="passport-card">
      <span>{passport.name}</span>
      <button data-testid="qr-btn" onClick={() => onShowQR(passport)}>QR</button>
      <button data-testid="dup-btn" onClick={() => onDuplicate(passport)}>Dup</button>
      <button data-testid="del-btn" onClick={() => onDelete(passport.id)}>Del</button>
    </div>
  ),
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
    expect(screen.getAllByText('nav.createNew').length).toBeGreaterThanOrEqual(1);
  });

  it('shows user email', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('shows OL branding', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('OL')).toBeInTheDocument();
  });

  it('shows language switcher', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const logoutBtn = document.querySelector('.lucide-log-out');
    expect(logoutBtn).toBeInTheDocument();
  });

  it('shows beta badge', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('calls signOut when logout button clicked', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const logoutBtn = document.querySelector('.lucide-log-out')!.closest('button')!;
    fireEvent.click(logoutBtn);
    expect(mockSignOut).toHaveBeenCalled();
  });
});

