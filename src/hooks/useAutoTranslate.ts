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
import { useSiteConfig } from '@/hooks/useSiteConfig';
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
  const { config, loading: configLoading, error: configError } = useSiteConfig();
  const aiEnabled = enabled && config?.ai_enabled === true && !configLoading && !configError;
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userEditedLangsRef = useRef<Set<string>>(new Set());
  const lastTranslatedValueRef = useRef('');
  const lastTranslatedLanguageRef = useRef('');
  const lastAttemptedKeyRef = useRef<string | null>(null);
  const inFlightKeysRef = useRef(new Set<string>());
  const mountedRef = useRef(true);
  const currentRef = useRef({ value, sourceLanguage, existingTranslations, onTranslationsGenerated, aiEnabled });
  currentRef.current = { value, sourceLanguage, existingTranslations, onTranslationsGenerated, aiEnabled };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const markAsUserEdited = useCallback((langCode: string) => {
    userEditedLangsRef.current.add(langCode);
  }, []);

  const isUserEdited = useCallback((langCode: string) => {
    return userEditedLangsRef.current.has(langCode);
  }, []);

  // Read current callbacks/translations without making their identity trigger a request.
  const generateTranslations = useCallback(async (textToTranslate: string, force = false) => {
    const current = currentRef.current;
    if (!mountedRef.current || !current.aiEnabled || !textToTranslate.trim() || current.value !== textToTranslate) return;
    const language = current.sourceLanguage;
    const key = JSON.stringify([language, textToTranslate]);
    if (inFlightKeysRef.current.has(key)) return;
    if (!force && (lastAttemptedKeyRef.current === key ||
      (lastTranslatedValueRef.current === textToTranslate && lastTranslatedLanguageRef.current === language))) return;

    // Remember failed attempts too. Only new input or an explicit retry may repeat them.
    lastAttemptedKeyRef.current = key;
    inFlightKeysRef.current.add(key);
    // Distinct pending inputs cannot disqualify a response for the restored input.
    // The in-flight key guard already prevents concurrent requests for this key.
    const isCurrentRequest = () => mountedRef.current &&
      currentRef.current.aiEnabled && currentRef.current.value === textToTranslate && currentRef.current.sourceLanguage === language;
    setIsTranslating(true);
    setError(null);

    try {
      const targetLanguages = EU_LANGUAGES.map(l => l.code).filter(code => code !== language);
      const { data, error: invokeError } = await supabase.functions.invoke('translate-text', {
        body: { text: textToTranslate, sourceLanguage: language, targetLanguages },
      });
      if (invokeError) throw invokeError;
      if (!isCurrentRequest()) return;
      const generated = data?.translations;
      if (!generated || typeof generated !== 'object' || Array.isArray(generated) ||
        Object.values(generated).some(text => typeof text !== 'string')) {
        throw new Error('Invalid translation response');
      }

      // Use the latest edits, including edits made while this request was pending.
      const latest = currentRef.current;
      const newTranslations: Translations = { ...latest.existingTranslations };
      for (const lang of EU_LANGUAGES) {
        if (lang.code === language || userEditedLangsRef.current.has(lang.code)) continue;
        if (latest.existingTranslations[lang.code] !== current.existingTranslations[lang.code]) continue;
        if (generated[lang.code]) {
          newTranslations[lang.code] = generated[lang.code];
        }
      }
      lastTranslatedValueRef.current = textToTranslate;
      lastTranslatedLanguageRef.current = language;
      latest.onTranslationsGenerated(newTranslations);
    } catch (err) {
      if (!isCurrentRequest()) return;
      console.error('Auto-translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      inFlightKeysRef.current.delete(key);
      // A discarded response is not a completed attempt for restored input.
      if (!isCurrentRequest() && lastAttemptedKeyRef.current === key) {
        lastAttemptedKeyRef.current = null;
      }
      if (mountedRef.current) {
        const latest = currentRef.current;
        setIsTranslating(latest.aiEnabled && inFlightKeysRef.current.has(JSON.stringify([latest.sourceLanguage, latest.value])));
      }
    }
  }, []);

  // BUG-03: seed the "last translated" ref the first time we see a
  // non-empty value together with any existing curated translations, so the
  // debounced pass no-ops and never clobbers manual edits. Do NOT latch on
  // the pre-hydration render (value=''), otherwise nothing is seeded and
  // the first debounce still overwrites curated translations.
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current || !value) return;
    didInitRef.current = true;
    const hasExisting = Object.values(existingTranslations || {}).some(
      (v) => typeof v === 'string' && v.trim().length > 0,
    );
    if (hasExisting) {
      lastTranslatedValueRef.current = value;
      lastTranslatedLanguageRef.current = sourceLanguage;
    }
  }, [value, sourceLanguage, existingTranslations]);

  // Only source input and policy changes reschedule the debounce.
  useEffect(() => {
    if (!aiEnabled || !value.trim()) return;
    const timer = setTimeout(() => { void generateTranslations(value); }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, sourceLanguage, debounceMs, aiEnabled, generateTranslations]);

  return {
    isTranslating,
    error,
    markAsUserEdited,
    isUserEdited,
    retryTranslation: () => generateTranslations(value, true),
  };
}
