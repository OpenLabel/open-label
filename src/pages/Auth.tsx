import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const emailSchema = z.string().email(); // validation message handled via i18n
const passwordSchema = z.string().min(6); // validation message handled via i18n

export default function Auth() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateInputs = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: t('common.error'), description: t('auth.validation.invalidEmail'), variant: 'destructive' });
      return false;
    }
    if (mode !== 'reset') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast({ title: t('common.error'), description: t('auth.validation.shortPassword'), variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: t('auth.welcomeBack') });
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, companyName);
        if (error) throw error;
        toast({ title: t('auth.accountCreated'), description: t('auth.accountCreatedDesc') });
      } else {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast({ title: t('auth.checkEmail'), description: t('auth.resetLinkSent') });
      }
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with language switcher */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm font-black">DPP</span>
            <span className="hidden sm:inline">Digital</span>
            <span className="hidden sm:inline text-muted-foreground font-normal">-</span>
            <span className="hidden sm:inline">Product</span>
            <span className="hidden sm:inline text-muted-foreground font-normal">-</span>
            <span className="hidden sm:inline">Passports</span>
            <span className="hidden sm:inline text-muted-foreground font-normal">.com</span>
          </Link>
          <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-wider">beta</span>
          <LanguageSwitcher />
        </div>
      </header>
      
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.title')}</CardTitle>
          <CardDescription>
            {mode === 'reset' ? t('auth.resetSubtitle') : t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'reset' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.sending') : t('auth.sendResetLink')}
              </Button>
              <Button type="button" variant="link" className="w-full" onClick={() => setMode('signin')}>
                {t('auth.backToSignIn')}
              </Button>
            </form>
          ) : (
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t('auth.companyName')}</Label>
                    <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
                </Button>
                {mode === 'signin' && (
                  <Button type="button" variant="link" className="w-full" onClick={() => setMode('reset')}>
                    {t('auth.forgotPassword')}
                  </Button>
                )}
              </form>
            </Tabs>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
