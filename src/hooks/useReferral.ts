import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const REFERRAL_KEY = 'referral_code';

export function getReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_KEY);
}

export function clearReferralCode(): void {
  localStorage.removeItem(REFERRAL_KEY);
}

export function useReferral() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && /^[a-zA-Z0-9]+$/.test(ref)) {
      localStorage.setItem(REFERRAL_KEY, ref);
    }
  }, [searchParams]);
}
