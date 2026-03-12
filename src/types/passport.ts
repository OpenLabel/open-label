// Open-Label Digital Product Passport Engine
// Copyright (C) 2026 Open-Label.eu
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program includes additional attribution requirements.
// See the LICENSE and NOTICE files for details.

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
  | 'other';

export interface Passport {
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
