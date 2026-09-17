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

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePassportBySlug } from '@/hooks/usePassports';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicPassportView } from '@/components/PublicPassportView';

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

  return (
    <PublicPassportView
      category={passport.category}
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
