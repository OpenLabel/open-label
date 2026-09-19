import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Passport } from '@/types/passport';

const mockSignOut = vi.fn();
const mockDuplicateAsync = vi.fn();
const mockDeleteAsync = vi.fn();
const mockReorderMutate = vi.fn();

// Stable reference — returning a new [] on every render would infinite-loop
// against the sync-effect in Dashboard.tsx (BUG-14 regression).
const mockPassports: Passport[] = [];
const mockSiteConfig = {
  config: { company_name: 'Test', setup_complete: true, site_url: 'https://public.example/' },
  loading: false,
  error: false,
  isSetupRequired: false,
};

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
  useSiteConfig: () => mockSiteConfig,
  SiteConfigProvider: ({ children }: any) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

vi.mock('@/components/QRCodeDialog', () => ({
  QRCodeDialog: ({ open, productName, wineIngredientsText, wineEnergyText, showSecuritySealOverlay }: { open: boolean; productName: string; wineIngredientsText?: string; wineEnergyText?: string; showSecuritySealOverlay?: boolean }) => open ? <output data-testid="qr-product-name" data-ingredients={wineIngredientsText} data-energy={wineEnergyText} data-seal={showSecuritySealOverlay}>{productName}</output> : null,
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
  afterEach(() => {
    mockPassports.splice(0);
    mockSiteConfig.config.site_url = 'https://public.example/';
    mockSiteConfig.loading = false;
    mockSiteConfig.error = false;
    vi.unstubAllEnvs();
  });

  it.each([
    [{ product_name: 'Public shampoo' }, 'Public shampoo'],
    [{}, 'categories.car_cleaning'],
    [{ product_name: { confidential: 'Private supplier object' } }, 'categories.car_cleaning'],
  ])('uses public car product identity in the share dialog and download filename', (category_data, expected) => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://api.example');
    mockPassports.push({
      id: 'car-qa', user_id: 'u1', name: 'INTERNAL DO NOT PUBLISH', category: 'car_cleaning',
      image_url: null, description: '', language: 'en', category_data,
      public_slug: 'aabbccdd', created_at: '2026-09-10', updated_at: '2026-09-10',
    });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('qr-btn'));
    const dialog = screen.getByRole('dialog', { name: `qrDialog.title - ${expected}` });
    expect(dialog).not.toHaveTextContent('INTERNAL DO NOT PUBLISH');
    expect(within(dialog).getByRole('img', { name: `carCleaning.carrier.title: ${expected}` })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'carCleaning.carrier.download' })).toBeEnabled();
    expect(within(dialog).getByText('https://public.example/p/aabbccdd')).toBeInTheDocument();
    expect(within(dialog).getByText('carCleaning.carrier.scan')).toBeInTheDocument();
    expect(dialog.querySelector('metadata')?.textContent).toContain('https://api.example/functions/v1/get-public-passport?slug=aabbccdd');
    expect(screen.queryByTestId('qr-product-name')).not.toBeInTheDocument();
    expect(dialog).not.toHaveAttribute('aria-describedby');
  });

  it.each(['loading', 'error', 'invalid'] as const)('does not issue a carrier while canonical configuration is %s', state => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://api.example');
    mockSiteConfig.loading = state === 'loading';
    mockSiteConfig.error = state === 'error';
    if (state === 'invalid') mockSiteConfig.config.site_url = 'http://public.example';
    mockPassports.push({ id: 'car-qa', user_id: 'u1', name: 'Private record', category: 'car_cleaning', image_url: null, description: '', language: 'en', category_data: { product_name: 'Public cleaner', counterfeit_protection_enabled: true }, public_slug: 'aabbccdd', created_at: '2026-09-10', updated_at: '2026-09-10' });
    const { rerender } = render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('qr-btn'));
    expect(screen.getByText('carCleaning.carrier.invalidUrl')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'carCleaning.carrier.download' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('qr-product-name')).not.toBeInTheDocument();
    mockSiteConfig.loading = false;
    mockSiteConfig.error = false;
    mockSiteConfig.config.site_url = 'https://public.example';
    rerender(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByRole('button', { name: 'carCleaning.carrier.download' })).toBeEnabled();
    expect(screen.queryByText('Place security')).not.toBeInTheDocument();
  });

  it('keeps the generic wine QR dialog and its caption and seal options', () => {
    mockPassports.push({ id: 'wine-qa', user_id: 'u1', name: 'QA wine', category: 'wine', image_url: null, description: '', language: 'en', category_data: { ingredients: [{ id: 'grapes' }], energy_kj: 100, energy_kcal: 24, counterfeit_protection_enabled: true }, public_slug: 'aabbccdd', created_at: '2026-09-10', updated_at: '2026-09-10' });
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('qr-btn'));
    expect(screen.getByTestId('qr-product-name')).toHaveTextContent('QA wine');
    expect(screen.getByTestId('qr-product-name')).toHaveAttribute('data-ingredients', 'wine.ingredients');
    expect(screen.getByTestId('qr-product-name')).toHaveAttribute('data-energy', 'E 100ml : 100 kJ / 24 kcal');
    expect(screen.getByTestId('qr-product-name')).toHaveAttribute('data-seal', 'true');
    expect(screen.queryByRole('button', { name: 'carCleaning.carrier.download' })).not.toBeInTheDocument();
  });
});
