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

export interface TemplateQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

export interface TemplateSection {
  title: string;
  description?: string;
  questions: TemplateQuestion[];
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: TemplateSection[];
  getRequiredLogos?: (data: Record<string, unknown>) => string[];
}

export abstract class BaseTemplate implements CategoryTemplate {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract icon: string;
  abstract sections: TemplateSection[];
  
  getRequiredLogos?(data: Record<string, unknown>): string[];
}
