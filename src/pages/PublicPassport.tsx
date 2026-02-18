import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePassportBySlug } from '@/hooks/usePassports';
import { getTemplate, categoryList } from '@/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { WinePublicPassport } from '@/components/wine/WinePublicPassport';
import { ShieldCheck } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function PublicPassport() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { data: passport, isLoading, error } = usePassportBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('passport.notFound')}</h2>
            <p className="text-muted-foreground">
              {t('passport.notFoundDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use specialized view for wine passports
  if (passport.category === 'wine') {
    return (
      <WinePublicPassport
        passport={{
          name: passport.name,
          image_url: passport.image_url,
          description: passport.description,
          category_data: (passport.category_data as Record<string, unknown>) || {},
          updated_at: passport.updated_at,
        }}
      />
    );
  }

  const template = getTemplate(passport.category);
  const categoryData = (passport.category_data as Record<string, unknown>) || {};
  const categoryInfo = categoryList.find(c => c.value === passport.category);
  const requiredLogos = template.getRequiredLogos?.(categoryData) || [];

  const getDisplayValue = (value: unknown, questionType: string): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
    return String(value);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              {categoryInfo?.icon} {t(`categories.${passport.category}`)} {t('passport.productPassport')}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{passport.name}</h1>
            
            {/* Check Authenticity Button */}
            {categoryData?.counterfeit_protection_enabled && (
              <a
                href="https://app.cypheme.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                {t('passport.checkAuthenticity')}
              </a>
            )}
          </div>

          {/* Product Image */}
          {passport.image_url && (
            <Card className="overflow-hidden">
              <img
                src={passport.image_url}
                alt={passport.name}
                className="w-full max-h-96 object-contain bg-background"
              />
            </Card>
          )}

          {/* Description */}
          {passport.description && (
            <Card>
              <CardHeader>
                <CardTitle>{t('passport.productDescription')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(passport.description) }}
                />
              </CardContent>
            </Card>
          )}

          {/* Required Logos/Certifications */}
          {requiredLogos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('certifications.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {requiredLogos.map((logo) => (
                    <Badge key={logo} variant="outline" className="text-sm py-1 px-3">
                      {logo.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category-Specific Details */}
          {template.sections.length > 0 && (
            <div className="space-y-4">
              {template.sections.map((section, sectionIndex) => {
                const hasData = section.questions.some(q => {
                  const val = categoryData[q.id];
                  return val !== null && val !== undefined && val !== '' && val !== false;
                });

                if (!hasData) return null;

                return (
                  <Card key={sectionIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid gap-3">
                        {section.questions.map((question) => {
                          const value = categoryData[question.id];
                          const displayValue = getDisplayValue(value, question.type);
                          
                          if (!displayValue || displayValue === 'No') return null;

                          let displayLabel = displayValue;
                          if (question.type === 'select' && question.options) {
                            const option = question.options.find(o => o.value === value);
                            if (option) displayLabel = option.label;
                          }

                          return (
                            <div key={question.id} className="grid grid-cols-2 gap-2">
                              <dt className="text-muted-foreground text-sm">{question.label}</dt>
                              <dd className="text-sm font-medium">
                                {question.type === 'checkbox' ? (
                                  <Badge variant="secondary" className="text-xs">✓ {t('common.confirmed')}</Badge>
                                ) : (
                                  displayLabel
                                )}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Promotional Footer */}
          {!categoryData?.hide_promo && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center mt-6">
              <p className="text-sm text-foreground">
                {t('passport.poweredBy')}{' '}
                <a 
                  href="https://www.digital-product-passports.com"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Digital <span className="text-muted-foreground/60 font-normal">-</span> Product <span className="text-muted-foreground/60 font-normal">-</span> Passports <span className="text-muted-foreground font-normal">.com</span>
                </a>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground py-8">
            <Link to="/legal" className="underline hover:text-foreground">
              {t('legal.legalMentions')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
