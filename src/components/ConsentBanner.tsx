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

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { isTrackingExemptPath } from '@/lib/trackingExemptions';
import { Button } from '@/components/ui/button';
import {
  applyStoredConsent,
  detectCountry,
  getStoredConsent,
  isRegulatedCountry,
  setConsent,
} from '@/lib/adsConsent';

/**
 * Consent banner shown only to visitors in regions that require consent.
 * Everyone else never sees it. Accepting and rejecting are equally easy,
 * and the choice can be changed later via the discreet re-open button.
 */
export function ConsentBanner() {
  const { t } = useTranslation();
  const [regulated, setRegulated] = useState(false);
  const [decided, setDecided] = useState<boolean>(() => getStoredConsent() !== null);

  useEffect(() => {
    let active = true;
    applyStoredConsent();
    detectCountry().then((country) => {
      if (active) setRegulated(isRegulatedCountry(country));
    });
    return () => {
      active = false;
    };
  }, []);

  const decide = useCallback((decision: 'granted' | 'denied') => {
    setConsent(decision);
    setDecided(true);
  }, []);

  if (!regulated) return null;

  if (decided) {
    return (
      <button
        type="button"
        onClick={() => setDecided(false)}
        className="fixed bottom-3 left-3 z-40 rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
      >
        {t('consent.manage')}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={t('consent.title')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{t('consent.title')}</p>
          <p className="text-sm text-muted-foreground">
            {t('consent.description')}{' '}
            <Link to="/privacy-policy" className="underline underline-offset-2">
              {t('consent.privacyLink')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide('denied')}>
            {t('consent.decline')}
          </Button>
          <Button size="sm" onClick={() => decide('granted')}>
            {t('consent.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConsentBanner;
