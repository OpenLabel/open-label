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
