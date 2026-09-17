/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

/**
 * Regulatory compliance: the public passport view (/p/:slug) must load no
 * advertising/analytics tag, send no page_view, and show no consent banner.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const initGoogleAdsTag = vi.fn();
const trackPageView = vi.fn();

vi.mock('@/lib/googleAdsTracking', () => ({
  initGoogleAdsTag: (...args: unknown[]) => initGoogleAdsTag(...args),
  trackPageView: (...args: unknown[]) => trackPageView(...args),
  GOOGLE_ADS_TAG_ID: 'AW-TEST',
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
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
  initReactI18next: { type: '3rdParty', init: vi.fn() },
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

vi.mock('@/pages/Index', () => ({ default: () => <div>Index Page</div> }));
vi.mock('@/pages/PublicPassport', () => ({ default: () => <div>Public Passport</div> }));

import App from '@/App';

describe('public passport view is tracking-free', () => {
  beforeEach(() => {
    initGoogleAdsTag.mockClear();
    trackPageView.mockClear();
    window.localStorage.clear();
    // Regulated region: the banner would show on any non-exempt page.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: async () => 'loc=FR' }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.pushState({}, '', '/');
  });

  it('loads no tag and sends no page_view on /p/:slug', async () => {
    window.history.pushState({}, '', '/p/de00000000000001');
    render(<App />);
    await screen.findByText('Public Passport');
    expect(initGoogleAdsTag).not.toHaveBeenCalled();
    expect(trackPageView).not.toHaveBeenCalled();
  });

  it('shows no consent banner on /p/:slug', async () => {
    window.history.pushState({}, '', '/p/de00000000000001');
    render(<App />);
    await screen.findByText('Public Passport');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(global.fetch).not.toHaveBeenCalledWith('/cdn-cgi/trace', expect.anything());
  });

  it('still tracks other routes', async () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    await screen.findByText('Index Page');
    expect(initGoogleAdsTag).toHaveBeenCalled();
    expect(trackPageView).toHaveBeenCalled();
  });
});
