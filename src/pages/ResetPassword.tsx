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

import { BrandLogo } from '@/components/BrandLogo';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const passwordSchema = z.string().min(6);

export default function ResetPassword() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // NEW-04: PASSWORD_RECOVERY fires once when the reset link opens. If the
    // user reloads the page the event won't fire again, but Supabase has
    // already stored the recovery session — treat any active session on this
    // route as a valid recovery context so the form isn't a dead-end.
    supabase.auth.getSession?.().then(({ data }) => {
      if (data?.session) setIsRecovery(true);
    }).catch(() => {});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      toast({ title: t('common.error'), description: t('auth.validation.shortPassword'), variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: t('common.error'), description: t('auth.passwordMismatch'), variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: t('auth.passwordUpdated') });
      navigate('/dashboard');
    } catch (error: unknown) {
      toast({ title: t('common.error'), description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            <BrandLogo heightClass="h-9 sm:h-10" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.setNewPassword')}</CardTitle>
            <CardDescription>{t('auth.setNewPasswordDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* BUG-34: gate the form on a real PASSWORD_RECOVERY event — the
                page must not accept a new password unless Supabase actually
                delivered a recovery session. */}
            {!isRecovery ? (
              <p className="text-sm text-muted-foreground text-center">
                {t('auth.recoveryLinkRequired', 'Open the password reset link from your email to continue.')}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.newPassword')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.updatePassword')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
