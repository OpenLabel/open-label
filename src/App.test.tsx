import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test', setup_complete: true, site_url: '' },
    loading: false,
    isSetupRequired: false,
    refetch: vi.fn(),
    saveConfig: vi.fn(),
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ children }: any) => children,
}));

vi.mock('@/hooks/useReferral', () => ({
  useReferral: () => {},
  getReferralCode: () => null,
  clearReferralCode: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
    },
    from: () => ({ select: vi.fn(), insert: vi.fn() }),
    functions: { invoke: vi.fn() },
  },
}));

// Mock all pages to keep tests fast
vi.mock('./pages/Index', () => ({ default: () => <div>Index Page</div> }));
vi.mock('./pages/Auth', () => ({ default: () => <div>Auth Page</div> }));
vi.mock('./pages/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('./pages/PassportForm', () => ({ default: () => <div>Passport Form</div> }));
vi.mock('./pages/PublicPassport', () => ({ default: () => <div>Public Passport</div> }));
vi.mock('./pages/LegalMentions', () => ({ default: () => <div>Legal Mentions</div> }));
vi.mock('./pages/PrivacyPolicy', () => ({ default: () => <div>Privacy Policy</div> }));
vi.mock('./pages/Terms', () => ({ default: () => <div>Terms</div> }));
vi.mock('./pages/Setup', () => ({ default: () => <div>Setup</div> }));
vi.mock('./pages/ResetPassword', () => ({ default: () => <div>Reset Password</div> }));
vi.mock('./pages/NotFound', () => ({ default: () => <div>Not Found</div> }));
vi.mock('./pages/ReferralStats', () => ({ default: () => <div>Referral Stats</div> }));

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // The Index page should render by default
    expect(screen.getByText('Index Page')).toBeInTheDocument();
  });
});
