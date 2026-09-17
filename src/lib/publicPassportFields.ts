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

import type { TemplateQuestion, TemplateSection } from '@/templates/base';

type Translate = (key: string, fallback?: string) => string;

/** Internal fields are collected for the manufacturer's records only. */
export function isPubliclyVisible(question: TemplateQuestion): boolean {
  return question.internal !== true;
}

/** True when at least one publicly visible question in the section has a value. */
export function sectionHasPublicData(
  section: TemplateSection,
  categoryData: Record<string, unknown>,
): boolean {
  return section.questions.filter(isPubliclyVisible).some((q) => {
    const val = categoryData[q.id];
    if (Array.isArray(val)) return val.length > 0;
    return val !== null && val !== undefined && val !== '' && val !== false;
  });
}

function optionLabel(question: TemplateQuestion, value: unknown, t: Translate): string {
  const option = question.options?.find((o) => o.value === value);
  if (!option) return String(value);
  return option.labelKey ? t(option.labelKey, option.label) : option.label;
}

/** Resolve the public display string for a question value, or null when empty. */
export function resolveDisplayValue(
  question: TemplateQuestion,
  value: unknown,
  t: Translate,
): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');

  if (question.type === 'select') {
    return optionLabel(question, value, t);
  }

  if (question.type === 'multi_select' || Array.isArray(value)) {
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return value.map((v) => optionLabel(question, v, t)).join(', ');
    }
    return optionLabel(question, value, t);
  }

  return String(value);
}
