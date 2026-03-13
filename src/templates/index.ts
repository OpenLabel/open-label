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

import { CategoryTemplate } from './base';
import { wineTemplate } from './wine';
import { batteryTemplate } from './battery';
import { textilesTemplate } from './textiles';
import { constructionTemplate } from './construction';
import { electronicsTemplate } from './electronics';
import { ironSteelTemplate } from './iron_steel';
import { aluminumTemplate } from './aluminum';
import { toysTemplate } from './toys';
import { cosmeticsTemplate } from './cosmetics';
import { furnitureTemplate } from './furniture';
import { tiresTemplate } from './tires';
import { detergentsTemplate } from './detergents';
import { otherTemplate } from './other';
import type { ProductCategory } from '@/types/passport';

export const templates: Record<ProductCategory, CategoryTemplate> = {
  wine: wineTemplate,
  battery: batteryTemplate,
  textiles: textilesTemplate,
  construction: constructionTemplate,
  electronics: electronicsTemplate,
  iron_steel: ironSteelTemplate,
  aluminum: aluminumTemplate,
  toys: toysTemplate,
  cosmetics: cosmeticsTemplate,
  furniture: furnitureTemplate,
  tires: tiresTemplate,
  detergents: detergentsTemplate,
  other: otherTemplate,
};

export const getTemplate = (category: ProductCategory): CategoryTemplate => {
  return templates[category] || otherTemplate;
};

export const categoryList = [
  { value: 'wine' as const, label: 'Wine & Spirits', icon: '🍷', status: 'active' as const, regulation: 'EU 2021/2117' },
  { value: 'other' as const, label: 'Other', icon: '📦', status: 'active' as const, regulation: 'Generic DPP' },
];

export * from './base';
