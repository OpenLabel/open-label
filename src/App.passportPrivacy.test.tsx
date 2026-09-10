import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Link } from 'react-router-dom';

const { detectCountry, referralCapture, setConsentDefaults } = vi.hoisted(() => ({
  detectCountry: vi.fn().mockResolvedValue('US'), referralCapture: vi.fn(), setConsentDefaults: vi.fn(),
}));
vi.mock('@/lib/adsConsent', () => ({
  applyStoredConsent: vi.fn(), setConsentDefaults, detectCountry, getStoredConsent: () => null,
  isRegulatedCountry: () => false, setConsent: vi.fn(),
}));
vi.mock('@/hooks/useReferral', () => ({ useReferral: referralCapture }));
vi.mock('@/hooks/useAuth', () => ({ AuthProvider: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/hooks/useSiteConfig', () => ({
  SiteConfigProvider: ({ children }: { children: ReactNode }) => children,
  useSiteConfig: () => ({ loading: false, isSetupRequired: false }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/components/BuildStatusBanner', () => ({ BuildStatusBanner: () => null }));
vi.mock('./pages/Index', () => ({ default: () => <Link to="/p/aabbccdd?ref=marketing">View public passport</Link> }));
vi.mock('./pages/PublicPassport', () => ({ default: () => <div>Public product information<Link to="/">Return home</Link></div> }));
vi.mock('./pages/Auth', () => ({ default: () => null }));
vi.mock('./pages/Dashboard', () => ({ default: () => null }));
vi.mock('./pages/PassportForm', () => ({ default: () => null }));
vi.mock('./pages/LegalMentions', () => ({ default: () => null }));
vi.mock('./pages/PrivacyPolicy', () => ({ default: () => null }));
vi.mock('./pages/Terms', () => ({ default: () => null }));
vi.mock('./pages/Setup', () => ({ default: () => null }));
vi.mock('./pages/ResetPassword', () => ({ default: () => null }));
vi.mock('./pages/NotFound', () => ({ default: () => null }));
vi.mock('./pages/ReferralStats', () => ({ default: () => null }));
vi.mock('./pages/ReferralLeaderboard', () => ({ default: () => null }));
vi.mock('./pages/AdminLeaderboard', () => ({ default: () => null }));
vi.mock('./pages/Admin', () => ({ default: () => null }));
vi.mock('./pages/CyphemePassport', () => ({ default: () => null }));
import App from './App';
import { __resetGoogleAdsTagForTests, trackPageView } from '@/lib/googleAdsTracking';

beforeEach(() => {
  vi.clearAllMocks(); detectCountry.mockResolvedValue('US'); __resetGoogleAdsTagForTests(); document.head.innerHTML = '';
  delete window.gtag; delete window.dataLayer;
  window.history.replaceState({}, '', '/');
});
afterEach(() => { window.history.replaceState({}, '', '/'); vi.restoreAllMocks(); });

describe('Public passport marketing privacy', () => {
  it.each(['/p/aabbccdd?ref=PRIVATE', '/P/aabbccdd'])('does not load advertising, geo-consent or referral capture on cold public route %s', async path => {
    window.history.replaceState({}, '', path);
    await act(async () => { render(<App />); });
    expect(screen.getByText('Public product information')).toBeInTheDocument();
    expect(document.querySelector('script[src*="googletagmanager.com"]')).toBeNull();
    expect(window.gtag).toBeUndefined();
    expect(detectCountry).not.toHaveBeenCalled();
    expect(referralCapture).not.toHaveBeenCalled();
    expect(setConsentDefaults).not.toHaveBeenCalled();
  });

  it('stops route events when moving from marketing to a public passport and resumes on returning home', async () => {
    const gtag = vi.fn(); window.gtag = gtag;
    await act(async () => { render(<App />); });
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_path: '/' }));
    expect(detectCountry).toHaveBeenCalledOnce();
    gtag.mockClear(); referralCapture.mockClear();
    await act(async () => { fireEvent.click(screen.getByRole('link', { name: 'View public passport' })); });
    expect(screen.getByText('Public product information')).toBeInTheDocument();
    expect(gtag).not.toHaveBeenCalled();
    expect(referralCapture).not.toHaveBeenCalled();
    expect(detectCountry).toHaveBeenCalledOnce();
    await act(async () => { fireEvent.click(screen.getByRole('link', { name: 'Return home' })); });
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_path: '/' }));
  });

  it('guards the tracking helper even when another caller supplies a public passport URL', () => {
    const gtag = vi.fn(); window.gtag = gtag;
    trackPageView('/p/aabbccdd?email=private@example.test');
    trackPageView('/P/aabbccdd');
    expect(gtag).not.toHaveBeenCalled();
    trackPageView('/passport/new');
    expect(gtag).toHaveBeenCalledOnce();
  });
});
