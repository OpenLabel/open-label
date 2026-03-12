// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.

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
