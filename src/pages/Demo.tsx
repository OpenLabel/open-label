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

import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categoryList } from '@/templates';
import { SAMPLE_PASSPORTS, getSamplePassport } from '@/data/samples';
import { PublicPassportView } from '@/components/PublicPassportView';
import { Button } from '@/components/ui/button';
import type { ProductCategory } from '@/types/passport';

/** Build date — demo passports are static, so "last updated" is the build. */
const BUILD_DATE = new Date().toISOString();

const DEFAULT_CATEGORY: ProductCategory = 'wine';

/** Active, sampled categories in categoryList order. */
export function getDemoCategories() {
  return categoryList.filter(
    (c) => c.status === 'active' && c.value !== 'other' && SAMPLE_PASSPORTS[c.value],
  );
}

export default function Demo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const tabs = getDemoCategories();

  const active = tabs.find((c) => c.value === category);
  const sample = active ? getSamplePassport(active.value)?.() : undefined;

  useEffect(() => {
    if (sample) document.title = sample.name;
  }, [sample]);

  if (!active || !sample) {
    return <Navigate to={`/demo/${DEFAULT_CATEGORY}`} replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Demo banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">{t('demo.banner')}</p>
          <Button size="sm" asChild>
            <Link to="/auth">{t('demo.cta')}</Link>
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="border-b bg-background">
        <div
          className="container mx-auto px-4 py-2 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label={t('demo.banner')}
        >
          {tabs.map((c) => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={c.value === active.value}
              onClick={() => navigate(`/demo/${c.value}`)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                c.value === active.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              <span aria-hidden="true" className="mr-1">{c.icon}</span>
              {t(`categories.${c.value}`)}
            </button>
          ))}
        </div>
      </div>

      <PublicPassportView
        category={active.value}
        passport={{
          name: sample.name,
          image_url: sample.image_url,
          description: sample.description,
          category_data: (sample.category_data as Record<string, unknown>) || {},
          updated_at: BUILD_DATE,
        }}
      />
    </div>
  );
}
