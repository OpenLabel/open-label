import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetGoogleAdsTagForTests, initGoogleAdsTag, trackAccountCreation, trackButtonConversion, trackConversionOnce, trackPageView, withAdParams } from './googleAdsTracking';

beforeEach(() => {
  __resetGoogleAdsTagForTests();
  document.head.innerHTML = '';
  delete window.gtag; delete window.dataLayer;
  window.history.replaceState({}, '', '/');
});
afterEach(() => { window.history.replaceState({}, '', '/'); vi.restoreAllMocks(); });

describe('all advertising entrypoints respect the active public route', () => {
  it.each(['/p/abcdef01', '/P/abcdef01', '/%70/abcdef01'])('does not initialize or emit on %s', path => {
    window.history.replaceState({}, '', path);
    initGoogleAdsTag();
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(window.dataLayer).toBeUndefined();
    const gtag = vi.fn(); window.gtag = gtag;
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    const onSent = vi.fn();
    trackPageView('/');
    trackConversionOnce('AW-test/private');
    trackAccountCreation();
    trackButtonConversion('click_openlabel_landing_hero_get_dpp', onSent);
    expect(gtag).not.toHaveBeenCalled();
    expect(storage).not.toHaveBeenCalled();
    expect(onSent).toHaveBeenCalledOnce();
    expect(withAdParams('/auth', '?gclid=private')).toBe('/auth');
  });

  it('does not attach campaign identifiers to public passport destinations', () => {
    expect(withAdParams('/p/abcdef01', '?gclid=private')).toBe('/p/abcdef01');
    expect(withAdParams('https://example.test/P/abcdef01', '?gclid=private')).toBe('https://example.test/P/abcdef01');
  });
});
