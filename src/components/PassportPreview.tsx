import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WinePublicPassport } from './wine/WinePublicPassport';
import { getTemplate, categoryList } from '@/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
import type { ProductCategory } from '@/types/passport';

interface PassportPreviewProps {
  formData: {
    name: string;
    category: ProductCategory;
    image_url: string | null;
    description: string;
    category_data: Record<string, unknown>;
  };
}

export function PassportPreview({ formData }: PassportPreviewProps) {
  const { t, i18n } = useTranslation();
  
  // Manage preview language separately from app language
  const [previewLanguage, setPreviewLanguage] = useState(() => {
    return i18n.language.split('-')[0];
  });

  const previewPassport = {
    name: formData.name || t('preview.productName'),
    image_url: formData.image_url,
    description: formData.description,
    category_data: formData.category_data,
    updated_at: new Date().toISOString(),
  };

  // Use specialized view for wine passports
  if (formData.category === 'wine') {
    return (
      <div className="sticky top-8">
        <div className="bg-background shadow-lg overflow-hidden max-w-[280px] mx-auto rounded-2xl border">
          {/* Phone frame styling */}
          <div className="bg-muted/50 p-2 flex justify-center">
            <div className="w-20 h-1 bg-muted-foreground/20 rounded-full" />
          </div>
          {/* Scaled preview container */}
          <div className="h-[500px] overflow-hidden">
            <div 
              className="overflow-y-auto origin-top"
              style={{
                transform: 'scale(0.65)',
                width: '154%',
                height: '154%',
                transformOrigin: 'top left',
              }}
            >
              <WinePublicPassport 
                passport={previewPassport} 
                isPreview={true}
                previewLanguage={previewLanguage}
                onPreviewLanguageChange={setPreviewLanguage}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">{t('preview.livePreview')}</p>
      </div>
    );
  }

  // Generic preview for all other categories
  const template = getTemplate(formData.category);
  const categoryData = formData.category_data || {};
  const categoryInfo = categoryList.find(c => c.value === formData.category);
  const requiredLogos = template.getRequiredLogos?.(categoryData) || [];

  const getDisplayValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
    return String(value);
  };

  return (
    <div className="sticky top-8">
      <div className="bg-background shadow-lg overflow-hidden max-w-[280px] mx-auto rounded-2xl border">
        {/* Phone frame styling */}
        <div className="bg-muted/50 p-2 flex justify-center">
          <div className="w-20 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        {/* Scaled preview container */}
        <div className="h-[500px] overflow-hidden">
          <div 
            className="overflow-y-auto origin-top"
            style={{
              transform: 'scale(0.65)',
              width: '154%',
              height: '154%',
              transformOrigin: 'top left',
            }}
          >
            {/* Generic Passport Preview */}
            <div className="min-h-screen bg-muted/30">
              <main className="px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    {formData.category !== 'other' && (
                      <Badge variant="secondary" className="mb-3">
                        {categoryInfo?.icon} {t(`categories.${formData.category}`)} {t('preview.productPassport')}
                      </Badge>
                    )}
                    <h1 className="text-xl font-bold mb-2">
                      {(categoryData?.product_name as string) || formData.name || t('preview.productName')}
                    </h1>
                    
                    {/* Check Authenticity Button (preview mode - non-clickable) */}
                    {categoryData?.counterfeit_protection_enabled && (
                      <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-600 text-white rounded-lg font-medium text-sm cursor-default">
                        <ShieldCheck className="h-3 w-3" />
                        {t('preview.checkAuthenticity')}
                      </div>
                    )}
                  </div>

                  {/* Product Image */}
                  {formData.image_url && (
                    <Card className="overflow-hidden">
                      <img
                        src={formData.image_url}
                        alt={formData.name}
                        className="w-full max-h-40 object-contain bg-background"
                      />
                    </Card>
                  )}

                  {/* Description */}
                  {formData.description && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('preview.productDescription')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="prose prose-sm max-w-none text-xs"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.description) }}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Required Logos/Certifications */}
                  {requiredLogos.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('preview.certificationsLabels')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {requiredLogos.map((logo) => (
                            <Badge key={logo} variant="outline" className="text-xs py-0.5 px-2">
                              {logo.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category-Specific Details */}
                  {template.sections.length > 0 && (
                    <div className="space-y-3">
                      {template.sections.map((section, sectionIndex) => {
                        const hasData = section.questions.some(q => {
                          const val = categoryData[q.id];
                          return val !== null && val !== undefined && val !== '' && val !== false;
                        });

                        if (!hasData) return null;

                        return (
                          <Card key={sectionIndex}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <dl className="grid gap-2">
                                {section.questions.map((question) => {
                                  const value = categoryData[question.id];
                                  const displayValue = getDisplayValue(value);
                                  
                                  if (!displayValue || displayValue === 'No') return null;

                                  let displayLabel = displayValue;
                                  if (question.type === 'select' && question.options) {
                                    const option = question.options.find(o => o.value === value);
                                    if (option) displayLabel = option.label;
                                  }

                                  return (
                                    <div key={question.id} className="grid grid-cols-2 gap-1">
                                      <dt className="text-muted-foreground text-xs truncate">{question.label}</dt>
                                      <dd className="text-xs font-medium">
                                        {question.type === 'checkbox' ? (
                                          <Badge variant="secondary" className="text-[10px]">✓</Badge>
                                        ) : (
                                          <span className="truncate block">{displayLabel}</span>
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
                  
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-foreground">
                        {t('preview.poweredBy')}{' '}
                        <span className="text-primary font-medium">Digital <span className="text-muted-foreground/60 font-normal">-</span> Product <span className="text-muted-foreground/60 font-normal">-</span> Passports <span className="text-muted-foreground font-normal">.com</span></span>
                      </p>
                    </div>



                  {/* Footer */}
                  <footer className="text-center text-[10px] text-muted-foreground py-3 border-t">
                    <span className="underline">{t('legal.legalMentions')}</span>
                  </footer>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground mt-2">{t('preview.livePreview')}</p>
    </div>
  );
}
