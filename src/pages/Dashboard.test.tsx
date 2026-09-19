import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Passport } from '@/types/passport';

const mockSignOut = vi.fn();
const mockDuplicateAsync = vi.fn();
const mockDeleteAsync = vi.fn();
const mockReorderMutate = vi.fn();

// Stable reference — returning a new [] on every render would infinite-loop
// against the sync-effect in Dashboard.tsx (BUG-14 regression).
const mockPassports: Passport[] = [];

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
    passports: mockPassports,
    isLoading: false,
    error: null,
    createPassport: { mutateAsync: vi.fn(), isPending: false },
    duplicatePassport: { mutateAsync: mockDuplicateAsync },
    deletePassport: { mutateAsync: mockDeleteAsync },
    reorderPassports: { mutate: mockReorderMutate },
  }),
}));


vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test', setup_complete: true, site_url: 'https://open-label.eu' },
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
  QRCodeDialog: ({ open, productName }: { open: boolean; productName: string }) => open ? <output data-testid="qr-product-name">{productName}</output> : null,
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

  // BUG-14: rendering with empty passports must show the empty state,
  // not stale cards, and must not infinite-loop.
  it('renders empty state when passports array is empty (BUG-14)', () => {
    const { container } = render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText('dashboard.noPassports')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="passport-card"]').length).toBe(0);
  });
});




describe('Car cleaning QR export privacy', () => {
  afterEach(() => { mockPassports.splice(0); });

  it.each([
    [{ product_name: 'Public shampoo' }, 'Public shampoo'],
    [{}, 'categories.car_cleaning'],
    [{ product_name: { confidential: 'Private supplier object' } }, 'categories.car_cleaning'],
  ])('uses public car product identity in the share dialog and download filename', (category_data, expected) => {
    mockPassports.push({
      id: 'car-qa', user_id: 'u1', name: 'INTERNAL DO NOT PUBLISH', category: 'car_cleaning',
      image_url: null, description: '', language: 'en', category_data,
      public_slug: 'aabbccdd', created_at: '2026-09-10', updated_at: '2026-09-10',
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('qr-btn'));
    expect(screen.getByTestId('qr-product-name')).toHaveTextContent(expected);
    expect(screen.getByTestId('qr-product-name')).not.toHaveTextContent('INTERNAL DO NOT PUBLISH');
  });
});
