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

import { useCallback, type AriaAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  TranslationButton,
  type Translations,
} from '@/components/TranslationButton';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { toDppLanguage } from '@/lib/dppLanguage';

interface TranslatableFieldProps extends Pick<AriaAttributes, 'aria-invalid' | 'aria-describedby'> {
  id: string;
  value: string;
  onChange: (value: string) => void;
  translations: Translations;
  onTranslationsChange: (translations: Translations) => void;
  fieldLabel?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  /** When false, only the manual translate button is shown (no debounced AI). */
  autoTranslate?: boolean;
}

/**
 * Single input/textarea paired with the wine-style translation UX:
 * inline TranslationButton + debounced AI auto-translation via useAutoTranslate.
 */
export function TranslatableField({
  id,
  value,
  onChange,
  translations,
  onTranslationsChange,
  fieldLabel,
  placeholder,
  multiline = false,
  rows = 3,
  autoTranslate = true,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: TranslatableFieldProps) {
  const { t, i18n } = useTranslation();
  const sourceLanguage = toDppLanguage(i18n.language);

  const handleAutoTranslations = useCallback(
    (next: Translations) => onTranslationsChange(next),
    [onTranslationsChange],
  );

  const { isTranslating, markAsUserEdited } = useAutoTranslate({
    value,
    sourceLanguage,
    existingTranslations: translations,
    onTranslationsGenerated: handleAutoTranslations,
    enabled: autoTranslate && !!value.trim(),
  });

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-start">
        {multiline ? (
          <Textarea
            id={id}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="flex-1"
          />
        ) : (
          <Input
            id={id}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        )}
        <TranslationButton
          value={value}
          sourceLanguage={sourceLanguage}
          translations={translations}
          onSave={(next) => {
            Object.keys(next).forEach((lang) => markAsUserEdited(lang));
            onTranslationsChange(next);
          }}
          fieldLabel={fieldLabel}
          disabled={!value.trim()}
        />
      </div>
      {isTranslating && (
        <span className="text-xs text-muted-foreground animate-pulse">
          {t('translation.autoTranslating', 'Translating...')}
        </span>
      )}
    </div>
  );
}
