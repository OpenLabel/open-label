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

import { BaseTemplate, TemplateSection } from './base';

export class OtherTemplate extends BaseTemplate {
  id = 'other';
  name = 'Other';
  description = 'Generic Digital Product Passport for any product type';
  icon = '📦';
  
  sections: TemplateSection[] = [];
  
  getRequiredLogos(): string[] {
    return [];
  }
}

export const otherTemplate = new OtherTemplate();