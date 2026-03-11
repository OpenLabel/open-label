import { describe, it, expect, beforeEach } from 'vitest';
import { getReferralCode, clearReferralCode } from './useReferral';

describe('useReferral helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns referral code from localStorage', () => {
    localStorage.setItem('referral_code', 'testcode');
    expect(getReferralCode()).toBe('testcode');
  });

  it('clears referral code', () => {
    localStorage.setItem('referral_code', 'testcode');
    clearReferralCode();
    expect(getReferralCode()).toBeNull();
  });

  it('returns null when no code', () => {
    expect(getReferralCode()).toBeNull();
  });
});
