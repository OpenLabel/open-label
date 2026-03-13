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

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EU_LANGUAGES, type Translations } from '@/components/TranslationButton';

interface UseAutoTranslateOptions {
  /** Current value to translate */
  value: string;
  /** Source language code */
  sourceLanguage: string;
  /** Existing translations (including user edits) */
  existingTranslations?: Translations;
  /** Callback when translations are generated */
  onTranslationsGenerated: (translations: Translations) => void;
  /** Debounce delay in ms (default 1500ms) */
  debounceMs?: number;
  /** Whether auto-translation is enabled */
  enabled?: boolean;
}

/**
 * Hook that automatically generates translations when a value changes.
 * User-edited translations take precedence over AI-generated ones.
 */
export function useAutoTranslate({
  value,
  sourceLanguage,
  existingTranslations = {},
  onTranslationsGenerated,
  debounceMs = 1500,
  enabled = true,
}: UseAutoTranslateOptions) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track which translations were manually edited by the user
  const userEditedLangsRef = useRef<Set<string>>(new Set());
  
  // Track the last translated value to avoid re-translating the same content
  const lastTranslatedValueRef = useRef<string>('');
  
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mark a language as user-edited
  const markAsUserEdited = useCallback((langCode: string) => {
    userEditedLangsRef.current.add(langCode);
  }, []);

  // Check if a language was user-edited
  const isUserEdited = useCallback((langCode: string) => {
    return userEditedLangsRef.current.has(langCode);
  }, []);

  // Generate translations
  const generateTranslations = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim() || !enabled) return;
    
    // Don't re-translate if value hasn't changed
    if (textToTranslate === lastTranslatedValueRef.current) return;

    setIsTranslating(true);
    setError(null);

    try {
      const targetLanguages = EU_LANGUAGES
        .map((l) => l.code)
        .filter((code) => code !== sourceLanguage);

      const { data, error: invokeError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: textToTranslate,
          sourceLanguage,
          targetLanguages,
        },
      });

      if (invokeError) throw invokeError;

      // Merge AI translations with existing, preserving user edits
      const newTranslations: Translations = { ...existingTranslations };
      
      for (const lang of EU_LANGUAGES) {
        if (lang.code === sourceLanguage) continue;
        
        // Only update if not user-edited
        if (!userEditedLangsRef.current.has(lang.code)) {
          if (data.translations[lang.code]) {
            newTranslations[lang.code] = data.translations[lang.code];
          }
        }
      }

      lastTranslatedValueRef.current = textToTranslate;
      onTranslationsGenerated(newTranslations);
    } catch (err) {
      console.error('Auto-translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLanguage, existingTranslations, onTranslationsGenerated, enabled]);

  // Debounced auto-translate when value changes
  useEffect(() => {
    if (!enabled || !value.trim()) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced call
    debounceTimerRef.current = setTimeout(() => {
      generateTranslations(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, debounceMs, enabled, generateTranslations]);

  return {
    isTranslating,
    error,
    markAsUserEdited,
    isUserEdited,
    retryTranslation: () => generateTranslations(value),
  };
}
