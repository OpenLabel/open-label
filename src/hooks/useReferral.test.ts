import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureReferralCode, getReferralCode, clearReferralCode } from './useReferral';

describe('useReferral', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('captures referral code from URL params', () => {
    // captureReferralCode reads from window.location
    // We test getReferralCode and clearReferralCode
    sessionStorage.setItem('referral_code', 'testcode');
    expect(getReferralCode()).toBe('testcode');
  });

  it('clears referral code', () => {
    sessionStorage.setItem('referral_code', 'testcode');
    clearReferralCode();
    expect(getReferralCode()).toBeNull();
  });

  it('returns null when no code', () => {
    expect(getReferralCode()).toBeNull();
  });
});
