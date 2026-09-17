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

import { WinePublicPassport } from '@/components/wine/WinePublicPassport';
import { ToyPublicPassport } from '@/components/toys/ToyPublicPassport';
import { GenericPublicPassport } from '@/components/GenericPublicPassport';
import type { ProductCategory } from '@/types/passport';

export interface PublicPassportViewProps {
  category: ProductCategory;
  passport: {
    name: string;
    image_url: string | null;
    description: string | null;
    category_data: Record<string, unknown>;
    updated_at: string;
  };
}

/** Picks the public renderer for a category. Used by /p/:slug and /demo alike. */
export function PublicPassportView({ category, passport }: PublicPassportViewProps) {
  if (category === 'wine') {
    return <WinePublicPassport passport={passport} />;
  }
  if (category === 'toys') {
    return <ToyPublicPassport passport={passport} />;
  }
  return <GenericPublicPassport category={category} passport={passport} />;
}

export default PublicPassportView;
