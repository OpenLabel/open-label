import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(() => Promise.resolve({ error: null })),
    signUp: vi.fn(() => Promise.resolve({ error: null })),
    signOut: vi.fn(),
    resetPassword: vi.fn(() => Promise.resolve({ error: null })),
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

import Auth from './Auth';
import userEvent from '@testing-library/user-event';

describe('Auth page', () => {
  const renderAuth = () => render(<MemoryRouter><Auth /></MemoryRouter>);

  it('renders without crashing', () => {
    renderAuth();
    expect(screen.getByText('auth.title')).toBeInTheDocument();
  });

  it('shows sign in and sign up tabs', () => {
    renderAuth();
    expect(screen.getAllByText('auth.signIn').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('tab', { name: 'auth.signUp' })).toBeInTheDocument();
  });

  it('shows email and password fields', () => {
    renderAuth();
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByLabelText('auth.password')).toBeInTheDocument();
  });

  it('shows forgot password link', () => {
    renderAuth();
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });

  it('shows DPP branding link', () => {
    renderAuth();
    expect(screen.getAllByAltText('Open Label').length).toBeGreaterThan(0);
  });

  it('shows subtitle', () => {
    renderAuth();
    expect(screen.getByText('auth.subtitle')).toBeInTheDocument();
  });

  it('shows company name field when signup tab clicked', async () => {
    renderAuth();
    const signUpTab = screen.getByRole('tab', { name: 'auth.signUp' });
    await userEvent.click(signUpTab);
    expect(screen.getByLabelText('auth.companyName')).toBeInTheDocument();
  });

  it('shows reset mode when forgot password clicked', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('auth.forgotPassword'));
    expect(screen.getByText('auth.resetSubtitle')).toBeInTheDocument();
    expect(screen.getByText('auth.sendResetLink')).toBeInTheDocument();
  });

  it('shows back to sign in link in reset mode', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('auth.forgotPassword'));
    expect(screen.getByText('auth.backToSignIn')).toBeInTheDocument();
  });

  it('shows language switcher', () => {
    renderAuth();
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument();
  });
});

describe('Auth conversion tracking', () => {
  it('fires the account creation conversion after successful sign-up', async () => {
    const mod = await import('@/lib/googleAdsTracking');
    (mod.CONVERSION_LABELS as Record<string, string>).openlabel_accountcreation =
      'AW-672872996/signup';
    const calls: unknown[][] = [];
    window.gtag = (...args: unknown[]) => { calls.push(args); };
    window.sessionStorage.clear();

    render(<MemoryRouter><Auth /></MemoryRouter>);
    await userEvent.click(screen.getByRole('tab', { name: 'auth.signUp' }));
    await userEvent.type(screen.getByLabelText('auth.companyName'), 'Acme');
    await userEvent.type(screen.getByLabelText('auth.email'), 'a@b.co');
    await userEvent.type(screen.getByLabelText('auth.password'), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'auth.signUp' }));

    await vi.waitFor(() => {
      expect(calls).toContainEqual(['event', 'conversion', { send_to: 'AW-672872996/signup' }]);
    });
    delete window.gtag;
  });
});
