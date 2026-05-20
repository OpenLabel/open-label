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

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'number'
  | 'multi_select';

export type QuestionBadge = 'required' | 'where_applicable' | 'tbd';

export interface ShowWhenCondition {
  field: string;
  equals: unknown | unknown[];
  /** When true, condition matches if the field's array value INCLUDES `equals` */
  includes?: boolean;
}

export interface TemplateQuestion {
  id: string;
  label: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  /** Conditional reveal — render only when condition matches */
  showWhen?: ShowWhenCondition;
  /** Optional badge displayed next to the field label */
  badge?: QuestionBadge;
  /** Pre-selected values for multi_select / default value */
  defaultValue?: unknown;
}

export interface TemplateSection {
  title: string;
  description?: string;
  questions: TemplateQuestion[];
  /** Conditional reveal for whole section */
  showWhen?: ShowWhenCondition;
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

/** Evaluate a showWhen condition against current form data */
export function evaluateShowWhen(
  condition: ShowWhenCondition | undefined,
  data: Record<string, unknown>,
): boolean {
  if (!condition) return true;
  const value = data[condition.field];
  if (condition.includes) {
    if (!Array.isArray(value)) return false;
    const target = condition.equals;
    if (Array.isArray(target)) {
      return target.some((t) => (value as unknown[]).includes(t));
    }
    return (value as unknown[]).includes(target);
  }
  if (Array.isArray(condition.equals)) {
    return (condition.equals as unknown[]).includes(value);
  }
  return value === condition.equals;
}
