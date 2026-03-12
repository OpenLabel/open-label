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

import { useTranslation } from 'react-i18next';
import { getTemplate } from '@/templates';
import type { ProductCategory } from '@/types/passport';
import type { TemplateQuestion } from '@/templates/base';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CategoryQuestionsProps {
  category: ProductCategory;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function CategoryQuestions({ category, data, onChange }: CategoryQuestionsProps) {
  const { t } = useTranslation();
  const template = getTemplate(category);

  const handleChange = (id: string, value: unknown) => {
    onChange({ ...data, [id]: value });
  };

  const renderQuestion = (question: TemplateQuestion) => {
    const value = data[question.id];

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
            onChange={(e) => handleChange(question.id, e.target.value ? Number(e.target.value) : '')}
            placeholder={question.placeholder}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.id}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => handleChange(question.id, checked)}
            />
            <Label htmlFor={question.id} className="font-normal cursor-pointer">
              {question.label}
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
      default:
        return null;
    }
  };

  if (template.sections.length === 0) {
    // Still render display settings for categories with no specific questions
    return (
      <div className="space-y-6" />
    
    );
  }

  return (
    <div className="space-y-6">
      {/* Alpha Warning for non-wine categories */}
      {category !== 'wine' && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('passport.earlyAlpha')}</AlertTitle>
          <AlertDescription>
            {t('passport.earlyAlphaDesc')}
          </AlertDescription>
        </Alert>
      )}
      
      {template.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {section.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                {question.type !== 'checkbox' && (
                  <Label htmlFor={question.id}>
                    {question.label}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                {renderQuestion(question)}
                {question.helpText && (
                  <p className="text-xs text-muted-foreground">{question.helpText}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}



    </div>
  );
}
