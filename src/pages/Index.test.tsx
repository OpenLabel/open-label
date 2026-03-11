import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(), resetPassword: vi.fn() }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test Co', setup_complete: true, ai_enabled: true, sender_email: '', short_url: '', company_address: '', privacy_policy_url: '', terms_conditions_url: '' },
    loading: false,
    isSetupRequired: false,
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ children }: any) => children,
}));

vi.mock('@/assets/hero-bg.jpg', () => ({ default: 'hero-bg.jpg' }));

vi.mock('@/components/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="lang-switcher" />,
}));

import Index from './Index';

describe('Index page', () => {
  const renderIndex = () =>
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

  it('renders without crashing', () => {
    renderIndex();
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('shows hero section', () => {
    renderIndex();
    expect(screen.getByText('landing.hero.title')).toBeInTheDocument();
  });

  it('shows CTA button', () => {
    renderIndex();
    expect(screen.getByText('landing.hero.cta')).toBeInTheDocument();
  });

  it('shows features section', () => {
    renderIndex();
    expect(screen.getByText('landing.features.title')).toBeInTheDocument();
  });

  it('shows stats section', () => {
    renderIndex();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows AI section', () => {
    renderIndex();
    expect(screen.getByText('landing.ai.title')).toBeInTheDocument();
  });

  it('shows get started when no user', () => {
    renderIndex();
    expect(screen.getByText('nav.getStarted')).toBeInTheDocument();
  });

  it('renders category cards', () => {
    renderIndex();
    expect(screen.getByText('categories.wine')).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderIndex();
    expect(screen.getByText('landing.footer.legal')).toBeInTheDocument();
  });
});
