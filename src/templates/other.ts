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