/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { generateAdminToken } from '@/lib/adminToken';
import { ArrowLeft, Copy, ExternalLink, RefreshCw, Shield, Trophy } from 'lucide-react';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { config, loading: configLoading, saveConfig, refetch } = useSiteConfig();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [termsConditionsUrl, setTermsConditionsUrl] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [senderEmail, setSenderEmail] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    if (!config) return;
    setCompanyName(config.company_name);
    setCompanyAddress(config.company_address);
    setPrivacyPolicyUrl(config.privacy_policy_url);
    setTermsConditionsUrl(config.terms_conditions_url);
    setAiEnabled(config.ai_enabled);
    setSenderEmail(config.sender_email);
    setSiteUrl(config.site_url);
  }, [config]);

  if (authLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!config?.admin_user_id || config.admin_user_id !== user.id) {
    return <Navigate to="/dashboard" replace />;
  }

  const token = config.admin_leaderboard_token;
  const baseUrl = config.site_url?.trim() || window.location.origin;
  const humanUrl = token ? `${baseUrl}/admin-leaderboard#${encodeURIComponent(token)}` : '';
  const apiUrl = token
    ? `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/get-admin-leaderboard?token=${encodeURIComponent(token)}`
    : '';

  const copy = (s: string, label: string) => {
    navigator.clipboard.writeText(s);
    toast({ title: `${label} copied` });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveConfig({
        company_name: companyName.trim(),
        company_address: companyAddress.trim(),
        privacy_policy_url: privacyPolicyUrl.trim(),
        terms_conditions_url: termsConditionsUrl.trim(),
        ai_enabled: aiEnabled,
        sender_email: senderEmail.trim(),
        site_url: siteUrl.trim(),
      });
      toast({ title: 'Configuration saved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRotate = async () => {
    if (!confirm('Rotate the admin token? Existing links will stop working immediately.')) return;
    setRotating(true);
    try {
      await saveConfig({ admin_leaderboard_token: generateAdminToken() });
      await refetch();
      toast({ title: 'Token rotated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Referral Leaderboard Links
            </CardTitle>
            <CardDescription>
              Share these with your team. The token grants full access to referral data, so treat it
              like a password. Rotate it any time to invalidate existing links.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!token ? (
              <p className="text-sm text-destructive">
                No admin token found. Re-run setup or rotate the token below to generate one.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Human (browser) URL</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={humanUrl} className="font-mono text-xs" />
                    <Button type="button" variant="outline" size="icon" onClick={() => copy(humanUrl, 'Browser URL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" asChild>
                      <a href={humanUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>JSON API URL</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={apiUrl} className="font-mono text-xs" />
                    <Button type="button" variant="outline" size="icon" onClick={() => copy(apiUrl, 'API URL')}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Button type="button" variant="outline" onClick={handleRotate} disabled={rotating}>
              <RefreshCw className="h-4 w-4 mr-2" /> {rotating ? 'Rotating...' : 'Rotate token'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instance Configuration</CardTitle>
            <CardDescription>
              Edit the settings originally entered during setup. Changes are saved immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company / Organization Name</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Registered Address</Label>
                <Textarea id="companyAddress" rows={3} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                  <Input id="privacyPolicyUrl" value={privacyPolicyUrl} onChange={(e) => setPrivacyPolicyUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsConditionsUrl">Terms & Conditions URL</Label>
                  <Input id="termsConditionsUrl" value={termsConditionsUrl} onChange={(e) => setTermsConditionsUrl(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email Address</Label>
                <Input id="senderEmail" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Published Website URL</Label>
                <Input id="siteUrl" type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} required />
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Checkbox id="aiEnabled" checked={aiEnabled} onCheckedChange={(c) => setAiEnabled(c === true)} />
                <Label htmlFor="aiEnabled" className="text-sm font-normal cursor-pointer flex-1">
                  Enable AI features
                </Label>
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="link" asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
