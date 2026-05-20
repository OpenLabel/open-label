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

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTemplate } from '@/templates';
import type { ProductCategory } from '@/types/passport';
import {
  evaluateShowWhen,
  type QuestionBadge,
  type TemplateQuestion,
} from '@/templates/base';
import {
  TOY_CATEGORY_LEGISLATION_HINTS,
  YOUNG_CHILD_AGES,
} from '@/templates/toys';
import {
  generateAllergenDeclaration,
  type SelectedFragrance,
} from '@/data/toyFragrances';
import { FragrancePicker } from '@/components/toys/FragrancePicker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AlertTriangle, Info } from 'lucide-react';

interface CategoryQuestionsProps {
  category: ProductCategory;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

const BADGE_LABELS: Record<QuestionBadge, string> = {
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
    // Only auto-fill when empty or previously auto-generated (8-digit numeric starting with 9880)
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
    // Only overwrite when empty or matches a previously-generated declaration
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
        {BADGE_LABELS[badge]}
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
        return (
          <Input
            id={question.id}
            value={(value as string) || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={question.id}
            value={(value as string) || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.placeholder}
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
            placeholder={question.placeholder}
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
              {question.label}
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
                  {option.label}
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
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        );
      }
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
        'This toy is intended for children under 36 months. Stricter allergenic fragrance restrictions apply, and any small parts must be assessed against choking hazards.',
      );
    }
    if (data.has_allergenic_fragrances === 'unknown') {
      toyWarnings.push(
        'This DPP may be incomplete because allergenic fragrance information is mandatory when applicable. Replace "Unknown" with Yes or No before publishing.',
      );
    }
    const toyCat = data.toy_category as string | undefined;
    if (toyCat && TOY_CATEGORY_LEGISLATION_HINTS[toyCat]) {
      const legislation =
        (data.applicable_legislation as string[]) || [];
      const missing = TOY_CATEGORY_LEGISLATION_HINTS[toyCat].filter(
        (l) => !legislation.includes(l),
      );
      if (missing.length > 0) {
        toyWarnings.push(
          `Based on the selected toy category, also consider ticking: ${missing.join(', ')}.`,
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
          <AlertTitle>Toys DPP — compliance disclaimer</AlertTitle>
          <AlertDescription className="text-sm">
            The exact EU Digital Product Passport data model and API
            specifications for toys are still TBD and are expected to be
            defined in the implementing act due by the end of 2026. This
            tool is a first version based on Regulation (EU) 2025/2509 and
            should not be treated as final legal advice.
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

        return (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.description && (
                <CardDescription>{section.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleQuestions.map((question) => (
                <div key={question.id} className="space-y-2">
                  {question.type !== 'checkbox' && (
                    <Label htmlFor={question.id}>
                      {question.label}
                      {question.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                      {renderBadge(question.badge)}
                    </Label>
                  )}
                  {renderQuestion(question)}
                  {question.helpText && (
                    <p className="text-xs text-muted-foreground">
                      {question.helpText}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Toys: fixed EU Safety Gate link */}
      {isToys && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>EU Safety Gate</AlertTitle>
          <AlertDescription className="text-sm">
            Report unsafe products through the EU Safety Gate Portal:{' '}
            <a
              href="https://ec.europa.eu/safety-gate-alerts/screen/webReport"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              ec.europa.eu/safety-gate-alerts
            </a>
            . This link is always shown on the public passport.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
