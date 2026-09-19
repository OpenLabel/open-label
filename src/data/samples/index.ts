/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData, ProductCategory } from '@/types/passport';
import { buildSampleWinePassport } from './wine';
import { buildSampleToyPassport } from './toys';
import { buildSampleTextilesPassport } from './textiles';
import { buildSampleCarCleaningPassport } from './carCleaning';

/**
 * Demo passports that live in code. They render through the exact same public
 * components as real passports, and the suite fails if they drift from their
 * template (see samples.test.ts).
 *
 * Adding a new active category? Register its sample here.
 */
export const SAMPLE_PASSPORTS: Partial<Record<ProductCategory, () => PassportFormData>> = {
  wine: buildSampleWinePassport,
  toys: buildSampleToyPassport,
  textiles: buildSampleTextilesPassport,
  car_cleaning: buildSampleCarCleaningPassport,
};

export function getSamplePassport(
  category: ProductCategory,
): (() => PassportFormData) | undefined {
  return SAMPLE_PASSPORTS[category];
}

export { buildSampleWinePassport, buildSampleToyPassport, buildSampleTextilesPassport, buildSampleCarCleaningPassport };
