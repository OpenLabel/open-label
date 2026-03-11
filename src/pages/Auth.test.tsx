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

describe('Auth page', () => {
  const renderAuth = () => render(<MemoryRouter><Auth /></MemoryRouter>);

  it('renders without crashing', () => {
    renderAuth();
    expect(screen.getByText('auth.title')).toBeInTheDocument();
  });

  it('shows sign in and sign up tabs', () => {
    renderAuth();
    expect(screen.getByText('auth.signIn')).toBeInTheDocument();
    expect(screen.getByText('auth.signUp')).toBeInTheDocument();
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
    expect(screen.getByText('DPP')).toBeInTheDocument();
  });
});
