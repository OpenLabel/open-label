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

import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CounterfeitProtectionProps {
  passportName: string;
  passportSlug: string | null;
  userEmail: string | undefined;
  enabled: boolean;
  requestSentAt?: string | null;
  onChange: (enabled: boolean) => void;
}

export function CounterfeitProtection({ 
  passportName, 
  passportSlug, 
  userEmail,
  enabled,
  requestSentAt,
  onChange,
}: CounterfeitProtectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleEnable = async () => {
    // BUG-10: the email is now dispatched by PassportForm.handleSubmit after
    // the passport is persisted (and the slug exists). Here we just toggle
    // the flag; the user must save the passport to trigger the email.
    if (!userEmail) {
      toast({
        title: t('common.error'),
        description: t('counterfeit.errorNoEmail', 'Unable to send request - user email not found'),
        variant: 'destructive',
      });
      return;
    }
    onChange(true);
  };

  const handleDisable = () => {
    onChange(false);
  };

  // NEW-03: whenever the toggle is on, render a panel with a Disable
  // control. Show the "email sent" confirmation copy only once we have a
  // request timestamp persisted; otherwise indicate the email will go out
  // on save. Legacy passports enabled under the old flow (email sent, no
  // sent_at) can now be disabled directly.
  if (enabled) {
    const emailSent = !!requestSentAt;
    return (
      <div className="rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800 dark:text-green-200">
              {t('counterfeit.enabled', 'Counterfeit Protection Enabled')}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {emailSent
                ? t('counterfeit.enabledDescription', 'Request sent. Our team will contact you to discuss counterfeit protection for this product.')
                : t('counterfeit.pendingSend', 'Our team will be notified the next time you save this passport.')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisable}
            className="text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-300 dark:hover:text-green-200 dark:hover:bg-green-900/30"
          >
            {t('counterfeit.disable', 'Disable')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4">
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800 dark:text-red-200">
            {t('counterfeit.addProtection', 'Add Counterfeit Protection (optional)')}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {t('counterfeit.description')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnable}
          className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          {t('counterfeit.enable')}
        </Button>
      </div>
    </div>
  );
}
