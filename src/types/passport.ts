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

import type { Json } from '@/integrations/supabase/types';

export type ProductCategory = 
  | 'wine' 
  | 'battery' 
  | 'textiles' 
  | 'construction'
  | 'electronics'
  | 'iron_steel'
  | 'aluminum'
  | 'toys'
  | 'cosmetics'
  | 'furniture'
  | 'tires'
  | 'detergents'
  | 'car_cleaning'
  | 'other';

export interface CarCleaningHistoryData {
  product_identifier: string; identifier_status: 'internal_unverified'; public_path: string;
  latest_version: number; selected_version?: number; retained_until: string; withdrawn: boolean;
  versions: { version: number; recorded_at: string }[]; next_before_version: number | null;
}

export interface Passport {
  dpp_history?: CarCleaningHistoryData;
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  image_url: string | null;
  description: string | null;
  language: string;
  category_data: Json | null;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassportFormData {
  name: string;
  category: ProductCategory;
  image_url: string | null;
  description: string;
  language: string;
  category_data: Json;
}
