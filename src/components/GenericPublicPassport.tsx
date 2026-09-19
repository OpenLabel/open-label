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

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTemplate, categoryList } from '@/templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import DOMPurify from 'dompurify';
import { toDppLanguage } from '@/lib/dppLanguage';
import { isPubliclyVisible, sectionHasPublicData, resolveDisplayValue } from '@/lib/publicPassportFields';
import type { ProductCategory } from '@/types/passport';

export interface GenericPublicPassportProps {
  category: ProductCategory;
  passport: {
    name: string;
    image_url: string | null;
    description: string | null;
    category_data: Record<string, unknown>;
    updated_at: string;
  };
}

/**
 * Public rendering for categories without a bespoke viewer. Extracted verbatim
 * from PublicPassport.tsx so the demo page and the live page share one renderer.
 */
export function GenericPublicPassport({ category, passport }: GenericPublicPassportProps) {
  const { t, i18n } = useTranslation();
  const displayLanguage = toDppLanguage(i18n.language);

  const template = getTemplate(category);
  const categoryData = passport.category_data || {};
  const categoryInfo = categoryList.find(c => c.value === category);
  const requiredLogos = template.getRequiredLogos?.(categoryData) || [];

  const tr = t as unknown as (key: string, fallback?: string) => string;

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            {category !== 'other' && (
              <Badge variant="secondary" className="mb-4">
                {categoryInfo?.icon} {t(`categories.${category}`)} {t('passport.productPassport')}
              </Badge>
            )}
            <h1 className="text-3xl font-bold mb-2">
              {(categoryData.product_name_translations as Record<string, string>)?.[displayLanguage] || (categoryData.product_name as string) || passport.name || ''}
            </h1>

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
                alt={(categoryData.product_name as string) || ''}
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
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(
                    (categoryData.description_translations as Record<string, string>)?.[displayLanguage] || passport.description
                  ) }}
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
                if (!sectionHasPublicData(section, categoryData)) return null;

                return (
                  <Card key={sectionIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {section.titleKey ? t(section.titleKey, section.title) : section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid gap-3">
                        {section.questions.filter(isPubliclyVisible).map((question) => {
                          const value = categoryData[question.id];
                          const displayValue = resolveDisplayValue(question, value, tr);

                          // BUG-07: filter checkboxes by raw boolean, not translated 'No'
                          if (question.type === 'checkbox' || typeof value === 'boolean') {
                            if (!value) return null;
                          } else if (!displayValue) {
                            return null;
                          }

                          const displayLabel = displayValue;

                          const questionLabel = question.labelKey ? t(question.labelKey, question.label) : question.label;

                          return (
                            <div key={question.id} className="grid grid-cols-2 gap-2">
                              <dt className="text-muted-foreground text-sm">{questionLabel}</dt>

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
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center mt-6">
            <p className="text-sm text-foreground">
              {t('passport.poweredBy')}{' '}
              <a
                href="https://www.open-label.eu"
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Label <span className="text-primary font-bold">.eu</span>
              </a>
            </p>
          </div>

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

export default GenericPublicPassport;
