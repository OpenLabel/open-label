import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Globe, Infinity, Zap, CheckCircle2, Clock, Users, Github, Sparkles, Upload, FileText, Camera } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import heroBg from '@/assets/hero-bg.jpg';

// Category data based on EU DPP research document
const productCategories = [
  { 
    key: 'wine',
    status: 'active' as const,
    regulation: 'EU 2021/2117',
    deadline: 'active'
  },
  { 
    key: 'other',
    status: 'active' as const,
    regulation: 'ESPR Framework',
    deadline: '2027'
  },
];

export default function Index() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { config } = useSiteConfig();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">DPP</span>
            </div>
            <h1 className="hidden sm:block text-lg font-semibold">Digital <span className="text-muted-foreground/60 font-normal">-</span> Product <span className="text-muted-foreground/60 font-normal">-</span> Passports <span className="text-muted-foreground font-normal">.com</span></h1>
          </div>
          <div className="flex gap-1.5 sm:gap-2 items-center min-w-0">
            <LanguageSwitcher />
            {loading ? null : user ? (
              <Button size="sm" className="sm:size-default" asChild>
                <Link to="/dashboard">{t('nav.dashboard')}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="sm:size-default hidden xs:inline-flex" asChild>
                  <Link to="/auth">{t('nav.signIn')}</Link>
                </Button>
                <Button size="sm" className="sm:size-default text-xs sm:text-sm whitespace-nowrap shrink-0" asChild>
                  <Link to="/auth">{t('nav.getStarted')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {t('landing.hero.badge')}
            </Badge>
            <Badge variant="outline" className="border-primary/30">
              <Github className="h-3 w-3 mr-1" />
              {t('common.openSource')}
            </Badge>
            <Badge className="bg-blue-600/10 text-blue-600 border-blue-600/20 hover:bg-blue-600/20">
              {t('landing.hero.euFunded')}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-5xl mx-auto leading-tight tracking-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">
                {t('landing.hero.cta')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link to="/auth">{t('landing.hero.demo')}</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{t('landing.hero.features.free')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{t('landing.hero.features.selfHost')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{t('landing.hero.features.machineReadable')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>{t('landing.hero.features.categories')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">{t('landing.stats.free')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2</div>
              <div className="text-sm text-muted-foreground">{t('landing.stats.categories')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">2027</div>
              <div className="text-sm text-muted-foreground">{t('landing.stats.deadline')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">QR</div>
              <div className="text-sm text-muted-foreground">{t('landing.stats.qr')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t('landing.features.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing.features.espr.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('landing.features.espr.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Infinity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing.features.openSource.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('landing.features.openSource.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing.features.machineReadable.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('landing.features.machineReadable.description')}
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t('landing.features.qr.title')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('landing.features.qr.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Autofill Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-amber-50 dark:from-violet-950/30 dark:via-fuchsia-950/30 dark:to-amber-950/30 relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                {t('landing.ai.badge')}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-600 bg-clip-text text-transparent">
                {t('landing.ai.title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('landing.ai.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-background/80 backdrop-blur-sm border-2 border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600 transition-all hover:shadow-xl hover:shadow-violet-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('landing.ai.snap.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.ai.snap.description')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/80 backdrop-blur-sm border-2 border-fuchsia-200 dark:border-fuchsia-800 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 transition-all hover:shadow-xl hover:shadow-fuchsia-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-fuchsia-500/30">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('landing.ai.upload.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.ai.upload.description')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/80 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-xl hover:shadow-amber-500/10">
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('landing.ai.extract.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.ai.extract.description')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-background/90 backdrop-blur-sm rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-amber-500 flex items-center justify-center animate-pulse">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{t('landing.ai.multiUpload.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.ai.multiUpload.description')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{t('landing.ai.tags.wineLabels')}</Badge>
                  <Badge variant="outline">{t('landing.ai.tags.productLabels')}</Badge>
                  <Badge variant="outline">{t('landing.ai.tags.ingredientLists')}</Badge>
                  <Badge variant="outline">{t('landing.ai.tags.nutritionFacts')}</Badge>
                  <Badge variant="outline">{t('landing.ai.tags.technicalPdfs')}</Badge>
                </div>
              </div>

            <div className="text-center mt-10">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/30" asChild>
                <Link to="/auth">
                  {t('landing.ai.cta')} <Sparkles className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t('landing.categories.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.categories.title')}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t('landing.categories.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productCategories.map((category) => (
              <Card 
                key={category.key} 
                className="relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{t(`categories.${category.key}`)}</h3>
                    {category.status === 'active' ? (
                      <Badge className="bg-green-500/10 text-green-600 text-xs border-green-500/20">
                        {t('landing.categories.activeLaw')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {t('landing.categories.priorityGroup')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{t(`categoryDescriptions.${category.key}`)}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{category.regulation}</span>
                    <span className="font-medium">{category.deadline === 'active' ? t('landing.timeline.active.badge') : category.deadline}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/auth">
                {t('landing.categories.cta')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">{t('landing.timeline.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.timeline.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.timeline.subtitle')}
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{t('landing.timeline.active.title')}</h3>
                    <Badge variant="outline">{t('landing.timeline.active.badge')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.timeline.active.description')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{t('landing.timeline.feb2027.title')}</h3>
                    <Badge variant="secondary">{t('landing.timeline.feb2027.badge')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.timeline.feb2027.description')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('landing.timeline.rollout.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.timeline.rollout.description')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4">{t('landing.selfHost.badge')}</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.selfHost.title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.selfHost.subtitle')}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">{t('landing.selfHost.deploy.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.selfHost.deploy.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">{t('landing.selfHost.customize.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.selfHost.customize.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <h3 className="font-semibold mb-2">{t('landing.selfHost.contribute.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('landing.selfHost.contribute.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cta.title')}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link to="/auth">
              {t('landing.cta.button')} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">DPP</span>
              </div>
              <span className="text-sm font-medium">Digital <span className="text-muted-foreground/60 font-normal">-</span> Product <span className="text-muted-foreground/60 font-normal">-</span> Passports <span className="text-muted-foreground font-normal">.com</span></span>
              <Badge variant="outline" className="text-xs">
                {t('common.openSource')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <LanguageSwitcher />
              <Link to="/legal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('landing.footer.legal')}
              </Link>
              <a href="https://github.com/OpenLabel/digital-product-passports-com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
                {t('landing.footer.github')}
              </a>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {config?.company_name || 'Digital - Product - Passports .com'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
