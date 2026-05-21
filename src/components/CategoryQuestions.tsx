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

import { useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { getTemplate } from '@/templates';
import type { ProductCategory } from '@/types/passport';
import {
  evaluateShowWhen,
  type QuestionBadge,
  type TemplateOption,
  type TemplateQuestion,
} from '@/templates/base';
import {
  TOY_CATEGORY_LEGISLATION_HINTS,
  YOUNG_CHILD_AGES,
} from '@/templates/toys';
import {
  generateAllergenDeclaration,
  getFragranceById,
  type SelectedFragrance,
} from '@/data/toyFragrances';
import { FragrancePicker } from '@/components/toys/FragrancePicker';
import { TranslatableField } from '@/components/TranslatableField';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react';

interface CategoryQuestionsProps {
  category: ProductCategory;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const BADGE_KEY: Record<QuestionBadge, string> = {
  required: 'common.required',
  where_applicable: 'common.whereApplicable',
  tbd: 'common.tbdImplementingAct',
};

const BADGE_FALLBACK: Record<QuestionBadge, string> = {
  required: 'Required',
  where_applicable: 'Where applicable',
  tbd: 'TBD — implementing act',
};

const BADGE_VARIANTS: Record<
  QuestionBadge,
  'default' | 'secondary' | 'outline'
> = {
  required: 'default',
  where_applicable: 'secondary',
  tbd: 'outline',
};

/** Lookup translated label for a question, falling back to inline `label`. */
function tLabel(t: TFunction, q: { label: string; labelKey?: string }): string {
  return q.labelKey ? t(q.labelKey, q.label) : q.label;
}

function tHelp(
  t: TFunction,
  q: { helpText?: string; helpKey?: string },
): string | undefined {
  if (!q.helpText && !q.helpKey) return undefined;
  return q.helpKey ? t(q.helpKey, q.helpText ?? '') : q.helpText;
}

function tPlaceholder(
  t: TFunction,
  q: { placeholder?: string; placeholderKey?: string },
): string | undefined {
  if (!q.placeholder && !q.placeholderKey) return undefined;
  return q.placeholderKey
    ? t(q.placeholderKey, q.placeholder ?? '')
    : q.placeholder;
}

function tOption(t: TFunction, o: TemplateOption): string {
  return o.labelKey ? t(o.labelKey, o.label) : o.label;
}

/** File-upload renderer for `file` question type. */
function FileUploadField({
  question,
  value,
  onChange,
}: {
  question: TemplateQuestion;
  value: string | undefined;
  onChange: (url: string | null) => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = question.accept ?? 'application/pdf,image/*';
  const maxBytes = question.maxBytes ?? 5 * 1024 * 1024;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      setError(t('toys.certificate.errors.loginRequired', 'You must be signed in to upload files.'));
      return;
    }
    if (file.size > maxBytes) {
      setError(t('toys.certificate.errors.tooLarge', 'File is too large. Maximum size is 5 MB.'));
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const ext = file.name.split('.').pop() ?? 'bin';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${user.id}/certificates/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('passport-images')
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('passport-images').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('toys.certificate.errors.uploadFailed', 'Upload failed.'),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
        id={`file-${question.id}`}
      />
      {value ? (
        <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/30">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline inline-flex items-center gap-1 flex-1 truncate"
          >
            {t('toys.certificate.viewFile', 'View uploaded file')}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label={t('toys.certificate.remove', 'Remove file')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-dashed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('toys.certificate.uploading', 'Uploading...')}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {t('toys.certificate.uploadButton', 'Upload certificate')}
            </>
          )}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function CategoryQuestions({
  category,
  data,
  onChange,
}: CategoryQuestionsProps) {
  const { t } = useTranslation();
  const template = getTemplate(category);
  const isToys = category === 'toys';

  // Auto-fill customs commodity code for toys: 9880 + CN chapter + 00
  useEffect(() => {
    if (!isToys) return;
    const chapter = data.cn_chapter as string | undefined;
    const current = data.customs_code as string | undefined;
    if (!chapter || chapter === 'other') return;
    const generated = `9880${chapter.padStart(2, '0')}00`;
    if (!current || /^9880\d{4}$/.test(current)) {
      if (current !== generated) {
        onChange({ ...data, customs_code: generated });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.cn_chapter, isToys]);

  // Apply defaults for multi_select fields once
  useEffect(() => {
    const updates: Record<string, unknown> = {};
    for (const section of template.sections) {
      for (const q of section.questions) {
        if (
          q.type === 'multi_select' &&
          q.defaultValue !== undefined &&
          data[q.id] === undefined
        ) {
          updates[q.id] = q.defaultValue;
        }
      }
    }
    if (Object.keys(updates).length > 0) {
      onChange({ ...data, ...updates });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Auto-regenerate allergen declaration for toys
  useEffect(() => {
    if (!isToys) return;
    const hasAllergens = data.has_allergenic_fragrances as string | undefined;
    const fragrances = (data.allergenic_fragrances as SelectedFragrance[]) || [];
    const next = generateAllergenDeclaration(hasAllergens, fragrances);
    const existing = data.allergen_declaration_text as string | undefined;
    if (
      !existing ||
      existing.startsWith('No allergenic fragrances') ||
      existing.startsWith('The following allergenic fragrances')
    ) {
      if (existing !== next) {
        onChange({ ...data, allergen_declaration_text: next });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.has_allergenic_fragrances, data.allergenic_fragrances, isToys]);

  // ---- Toys AI autofill: merge sanitized fields from edge function ----
  useEffect(() => {
    if (!isToys) return;
    const payload = data.__ai_autofill as Record<string, unknown> | undefined;
    if (!payload) return;

    // Build allowed-id sets from the template
    const allowedIds = new Set<string>();
    const optionValues: Record<string, Set<string>> = {};
    for (const section of template.sections) {
      for (const q of section.questions) {
        allowedIds.add(q.id);
        if (q.options && q.options.length > 0) {
          optionValues[q.id] = new Set(q.options.map((o) => o.value));
        }
      }
    }

    const updates: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(payload)) {
      if (key === 'product_name' || key === 'productImageBase64') continue;
      if (raw === null || raw === undefined || raw === '') continue;

      // Translate allergenic_fragrance_ids → SelectedFragrance[] for the picker
      if (key === 'allergenic_fragrance_ids' && Array.isArray(raw)) {
        const fragrances: SelectedFragrance[] = (raw as string[])
          .map((id) => {
            const f = getFragranceById(id);
            return f ? { id: f.id, name: f.name, cas: f.cas } : null;
          })
          .filter((v): v is SelectedFragrance => v !== null);
        if (fragrances.length > 0) {
          updates.allergenic_fragrances = fragrances;
        }
        continue;
      }

      if (!allowedIds.has(key)) continue;

      // Validate enum values
      if (typeof raw === 'string' && optionValues[key]) {
        if (!optionValues[key].has(raw)) continue;
      }
      if (Array.isArray(raw) && optionValues[key]) {
        const filtered = raw.filter(
          (v) => typeof v === 'string' && optionValues[key].has(v),
        );
        if (filtered.length === 0) continue;
        updates[key] = filtered;
        continue;
      }

      updates[key] = raw;
    }

    const next = { ...data, ...updates };
    delete (next as Record<string, unknown>).__ai_autofill;
    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.__ai_autofill, isToys]);

  const handleChange = (id: string, value: unknown) => {
    onChange({ ...data, [id]: value });
  };

  const renderBadge = (badge?: QuestionBadge) => {
    if (!badge) return null;
    return (
      <Badge
        variant={BADGE_VARIANTS[badge]}
        className="ml-2 text-[10px] font-normal align-middle"
      >
        {t(BADGE_KEY[badge], BADGE_FALLBACK[badge])}
      </Badge>
    );
  };

  const renderQuestion = (question: TemplateQuestion) => {
    const value = data[question.id];

    // Special-cased: toy fragrance picker
    if (isToys && question.id === 'allergenic_fragrances') {
      return (
        <FragrancePicker
          selected={(value as SelectedFragrance[]) || []}
          onChange={(next) => handleChange(question.id, next)}
        />
      );
    }

    switch (question.type) {
      case 'text':
        if (question.translatable) {
          return (
            <TranslatableField
              id={question.id}
              value={(value as string) || ''}
              onChange={(v) => handleChange(question.id, v)}
              translations={
                (data[`${question.id}_translations`] as Record<string, string>) || {}
              }
              onTranslationsChange={(tr) =>
                handleChange(`${question.id}_translations`, tr)
              }
              fieldLabel={tLabel(t, question)}
              placeholder={tPlaceholder(t, question)}
              autoTranslate={question.autoTranslate !== false}
            />
          );
        }
        return (
          <Input
            id={question.id}
            value={(value as string) || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={tPlaceholder(t, question)}
          />
        );
      case 'textarea':
        if (question.translatable) {
          return (
            <TranslatableField
              id={question.id}
              value={(value as string) || ''}
              onChange={(v) => handleChange(question.id, v)}
              translations={
                (data[`${question.id}_translations`] as Record<string, string>) || {}
              }
              onTranslationsChange={(tr) =>
                handleChange(`${question.id}_translations`, tr)
              }
              fieldLabel={tLabel(t, question)}
              placeholder={tPlaceholder(t, question)}
              multiline
              autoTranslate={question.autoTranslate !== false}
            />
          );
        }
        return (
          <Textarea
            id={question.id}
            value={(value as string) || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={tPlaceholder(t, question)}
            rows={3}
          />
        );
      case 'number':
        return (
          <Input
            id={question.id}
            type="number"
            value={(value as number) || ''}
            onChange={(e) =>
              handleChange(
                question.id,
                e.target.value ? Number(e.target.value) : '',
              )
            }
            placeholder={tPlaceholder(t, question)}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.id}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) =>
                handleChange(question.id, checked)
              }
            />
            <Label
              htmlFor={question.id}
              className="font-normal cursor-pointer"
            >
              {tLabel(t, question)}
              {renderBadge(question.badge)}
            </Label>
          </div>
        );
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => handleChange(question.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('common.selectOption')} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {tOption(t, option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multi_select': {
        const current = (value as string[]) || [];
        return (
          <div className="space-y-2 border rounded-md p-3">
            {question.options?.map((option) => {
              const checked = current.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-start gap-2 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = c
                        ? [...current, option.value]
                        : current.filter((v) => v !== option.value);
                      handleChange(question.id, next);
                    }}
                  />
                  <span>{tOption(t, option)}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case 'file':
        return (
          <FileUploadField
            question={question}
            value={value as string | undefined}
            onChange={(url) => handleChange(question.id, url ?? '')}
          />
        );
      default:
        return null;
    }
  };

  if (template.sections.length === 0) {
    return <div className="space-y-6" />;
  }

  // ---- Toys-specific warnings ----
  const toyWarnings: string[] = [];
  if (isToys) {
    const age = data.age_group as string | undefined;
    if (age && YOUNG_CHILD_AGES.includes(age)) {
      toyWarnings.push(
        t(
          'toys.warnings.youngChild',
          'This toy is intended for children under 36 months. Stricter allergenic fragrance restrictions apply, and any small parts must be assessed against choking hazards.',
        ),
      );
    }
    if (data.mouth_contact === 'yes') {
      toyWarnings.push(
        t(
          'toys.warnings.mouthContact',
          'This toy is intended to be placed in the mouth. Stricter allergenic fragrance and chemical migration restrictions apply.',
        ),
      );
    }
    if (data.has_allergenic_fragrances === 'unknown') {
      toyWarnings.push(
        t(
          'toys.warnings.unknownAllergens',
          'This DPP may be incomplete because allergenic fragrance information is mandatory when applicable. Replace "Unknown" with Yes or No before publishing.',
        ),
      );
    }
    const toyCat = data.toy_category as string | undefined;
    if (toyCat && TOY_CATEGORY_LEGISLATION_HINTS[toyCat]) {
      const legislation = (data.applicable_legislation as string[]) || [];
      const missing = TOY_CATEGORY_LEGISLATION_HINTS[toyCat].filter(
        (l) => !legislation.includes(l),
      );
      if (missing.length > 0) {
        toyWarnings.push(
          t(
            'toys.warnings.suggestLegislation',
            'Based on the selected toy category, also consider ticking: {{list}}.',
            { list: missing.join(', ') },
          ),
        );
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Toys disclaimer */}
      {isToys && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {t('toys.disclaimer.title', 'Toys DPP — compliance disclaimer')}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {t(
              'toys.disclaimer.body',
              'The exact EU Digital Product Passport data model and API specifications for toys are still TBD and are expected to be defined in the implementing act due by the end of 2026. This tool is a first version based on Regulation (EU) 2025/2509 and should not be treated as final legal advice.',
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Alpha warning for non-wine, non-toys categories */}
      {category !== 'wine' && category !== 'toys' && (
        <Alert
          variant="destructive"
          className="bg-destructive/10 border-destructive/30"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('passport.earlyAlpha')}</AlertTitle>
          <AlertDescription>{t('passport.earlyAlphaDesc')}</AlertDescription>
        </Alert>
      )}

      {/* Toys: inline contextual warnings */}
      {toyWarnings.map((msg, i) => (
        <Alert
          key={i}
          variant="destructive"
          className="bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-100"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      ))}

      {template.sections.map((section, sectionIndex) => {
        if (!evaluateShowWhen(section.showWhen, data)) return null;
        const visibleQuestions = section.questions.filter((q) =>
          evaluateShowWhen(q.showWhen, data),
        );
        if (visibleQuestions.length === 0) return null;

        const title = section.titleKey
          ? t(section.titleKey, section.title)
          : section.title;
        const description = section.descriptionKey
          ? t(section.descriptionKey, section.description ?? '')
          : section.description;

        return (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleQuestions.map((question) => {
                const help = tHelp(t, question);
                const value = data[question.id];
                const showWarn = !!(
                  question.warnWhen &&
                  question.warnWhen.equals.includes(value)
                );
                const warnMessage = question.warnWhen
                  ? question.warnWhen.messageKey
                    ? t(question.warnWhen.messageKey, question.warnWhen.message)
                    : question.warnWhen.message
                  : '';
                return (
                  <div key={question.id} className="space-y-2">
                    {question.type !== 'checkbox' && (
                      <Label htmlFor={question.id}>
                        {tLabel(t, question)}
                        {question.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                        {renderBadge(question.badge)}
                        {question.internal && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] font-normal align-middle"
                          >
                            {t(
                              'toys.internalBadge',
                              'Internal \u2014 not shown publicly',
                            )}
                          </Badge>
                        )}
                      </Label>
                    )}
                    {renderQuestion(question)}
                    {help && (
                      <p className="text-xs text-muted-foreground">{help}</p>
                    )}
                    {showWarn && (
                      <Alert
                        variant="destructive"
                        className="bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-100"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warnMessage}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Toys: fixed EU Safety Gate link */}
      {isToys && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>
            {t('toys.safetyGate.title', 'EU Safety Gate')}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {t(
              'toys.safetyGate.body',
              'Report unsafe products through the EU Safety Gate Portal:',
            )}{' '}
            <a
              href="https://ec.europa.eu/safety-gate-alerts/screen/webReport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              ec.europa.eu/safety-gate-alerts
            </a>
            .{' '}
            {t(
              'toys.safetyGate.alwaysShown',
              'This link is always shown on the public passport.',
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
