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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CounterfeitProtectionProps {
  passportName: string;
  passportSlug: string | null;
  userEmail: string | undefined;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function CounterfeitProtection({ 
  passportName, 
  passportSlug, 
  userEmail,
  enabled,
  onChange,
}: CounterfeitProtectionProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEnable = async () => {
    // If passport hasn't been saved yet (no slug), just toggle the flag locally.
    // The email notification will be sent when the user saves and a slug exists.
    if (!passportSlug) {
      onChange(true);
      return;
    }

    if (!userEmail) {
      toast({
        title: t('common.error'),
        description: t('counterfeit.errorNoEmail', 'Unable to send request - user email not found'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const passportUrl = `${window.location.origin}/p/${passportSlug}`;
      const requestedAt = new Date().toISOString();
      
      const { error } = await supabase.functions.invoke('send-counterfeit-request', {
        body: {
          userEmail,
          passportName,
          passportUrl,
          requestedAt,
        },
      });

      if (error) throw error;

      onChange(true);
      toast({
        title: t('counterfeit.requestSent', 'Request sent!'),
        description: t('counterfeit.requestSentDescription', 'An email has been sent to our counterfeit protection partner. They will contact you to deliver the security seal.'),
      });
    } catch (error: any) {
      console.error('Counterfeit protection request failed:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('counterfeit.errorFailed', 'Failed to send counterfeit protection request'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = () => {
    onChange(false);
  };

  if (enabled) {
    return (
      <div className="rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-950/20 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-green-800 dark:text-green-200">
              {t('counterfeit.enabled', 'Counterfeit Protection Enabled')}
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {t('counterfeit.enabledDescription', 'An email has been sent to our counterfeit protection partner. They will contact you to deliver the security seal.')}
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
          disabled={loading}
          className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              {t('counterfeit.sending', 'Sending...')}
            </>
          ) : (
            t('counterfeit.enable')
          )}
        </Button>
      </div>
    </div>
  );
}
