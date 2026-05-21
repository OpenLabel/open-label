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
  | 'multi_select'
  | 'file';

export type QuestionBadge = 'required' | 'where_applicable' | 'tbd';

export interface ShowWhenCondition {
  field: string;
  equals: unknown | unknown[];
  /** When true, condition matches if the field's array value INCLUDES `equals` */
  includes?: boolean;
}

export interface TemplateOption {
  value: string;
  /** English fallback label */
  label: string;
  /** i18n key for translated label (preferred over `label` when present) */
  labelKey?: string;
}

export interface TemplateQuestion {
  id: string;
  /** English fallback label */
  label: string;
  /** i18n key for translated label (preferred over `label` when present) */
  labelKey?: string;
  type: QuestionType;
  options?: TemplateOption[];
  placeholder?: string;
  /** i18n key for translated placeholder */
  placeholderKey?: string;
  required?: boolean;
  helpText?: string;
  /** i18n key for translated help text */
  helpKey?: string;
  /** Conditional reveal — render only when condition matches */
  showWhen?: ShowWhenCondition;
  /** Optional badge displayed next to the field label */
  badge?: QuestionBadge;
  /** Pre-selected values for multi_select / default value */
  defaultValue?: unknown;
  /** For 'file' questions: accepted MIME types (defaults to image/*,application/pdf) */
  accept?: string;
  /** For 'file' questions: max size in bytes (defaults to 5 MB) */
  maxBytes?: number;
  /**
   * When true, this field's value (typically an uploaded file URL or sensitive text)
   * is collected for the manufacturer's internal records and MUST NOT be rendered
   * on the public DPP. The form should display an "Internal — not shown publicly" badge.
   */
  internal?: boolean;
  /**
   * When true, this field shows the wine-style translation UI:
   * inline manual TranslationButton plus debounced AI auto-translation.
   * Translations live under `<id>_translations` in category_data.
   */
  translatable?: boolean;
  /**
   * When `translatable` is true, controls whether AI auto-translate fires on
   * debounced changes. Defaults to true. Set false to keep only the manual
   * button (e.g. brand names).
   */
  autoTranslate?: boolean;
  /**
   * Inline warning shown under the field when its current value matches any of `equals`.
   * Use for non-blocking regulatory advisories (e.g. "complete this before relying on the DPP").
   */
  warnWhen?: {
    equals: unknown[];
    /** English fallback message */
    message: string;
    /** i18n key for translated message */
    messageKey?: string;
  };
}

export interface TemplateSection {
  /** Optional stable id used for translation keys */
  id?: string;
  title: string;
  /** i18n key for translated section title */
  titleKey?: string;
  description?: string;
  /** i18n key for translated section description */
  descriptionKey?: string;
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
