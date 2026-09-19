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
import { useTranslation } from 'react-i18next';
import { Languages, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { supabase } from '@/integrations/supabase/client';

// 24 official EU languages + Simplified Chinese (zh-CN), all first-class
export const EU_LANGUAGES = [
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
] as const;

export type EULanguageCode = (typeof EU_LANGUAGES)[number]['code'];

export interface Translations {
  [languageCode: string]: string;
}

interface TranslationButtonProps {
  /** Current value in the source language */
  value: string;
  /** Current source language code (from i18n) */
  sourceLanguage: string;
  /** Existing translations object */
  translations?: Translations;
  /** Callback when translations are saved */
  onSave: (translations: Translations) => void;
  /** Optional: field label for context in the dialog */
  fieldLabel?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'default' | 'icon';
}

export function TranslationButton({
  value,
  sourceLanguage,
  translations = {},
  onSave,
  fieldLabel,
  disabled = false,
  size = 'icon',
}: TranslationButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { config, loading: configLoading, error: configError } = useSiteConfig();
  const aiEnabled = config?.ai_enabled === true && !configLoading && !configError;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localTranslations, setLocalTranslations] = useState<Translations>({});
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const currentRef = useRef({ value, sourceLanguage, aiEnabled, open });
  currentRef.current = { value, sourceLanguage, aiEnabled, open };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    // A response belongs to the source and policy under which it was requested.
    requestIdRef.current += 1;
    setLoading(false);
  }, [value, sourceLanguage, aiEnabled]);

  const hasTranslations = Object.keys(translations).length > 0;

  const handleOpenChange = (nextOpen: boolean) => {
    // Closing or reopening starts a separate editing session, even for the same text.
    requestIdRef.current += 1;
    setLoading(false);
    setOpen(nextOpen);
  };

  const handleOpen = () => {
    // Initialize with existing translations, using source value for source language
    const initial: Translations = { ...translations };
    if (value) {
      initial[sourceLanguage] = value;
    }
    setLocalTranslations(initial);
    handleOpenChange(true);
  };

  const handleGenerateTranslations = async () => {
    if (!open || !aiEnabled || loading) return;
    if (!value.trim()) {
      toast({
        variant: 'destructive',
        title: t('translation.noSourceText', 'No source text'),
        description: t('translation.enterTextFirst', 'Please enter text in the field before generating translations.'),
      });
      return;
    }

    const requestId = ++requestIdRef.current;
    const isCurrentRequest = () => mountedRef.current && requestIdRef.current === requestId &&
      currentRef.current.open && currentRef.current.aiEnabled &&
      currentRef.current.value === value && currentRef.current.sourceLanguage === sourceLanguage;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: value,
          sourceLanguage,
          targetLanguages: EU_LANGUAGES.map((l) => l.code).filter((code) => code !== sourceLanguage),
        },
      });

      if (!isCurrentRequest()) return;
      if (error) throw error;
      const generated = data?.translations;
      if (!generated || typeof generated !== 'object' || Array.isArray(generated) ||
        Object.values(generated).some(text => typeof text !== 'string')) {
        throw new Error('Invalid translation response');
      }

      // Merge into the latest form state so edits made during the request survive.
      setLocalTranslations(latest => {
        if (!isCurrentRequest()) return latest;
        const newTranslations: Translations = { [sourceLanguage]: value };
        for (const lang of EU_LANGUAGES) {
          if (lang.code === sourceLanguage) continue;
          const editedWhilePending = latest[lang.code] !== localTranslations[lang.code];
          newTranslations[lang.code] = editedWhilePending
            ? latest[lang.code] || ''
            : latest[lang.code] || generated[lang.code] || '';
        }
        return newTranslations;
      });
      toast({
        title: t('translation.generated', 'Translations generated'),
        description: t('translation.reviewAndEdit', 'Review and edit translations as needed.'),
      });
    } catch (error) {
      if (!isCurrentRequest()) return;
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: t('translation.error', 'Translation error'),
        description: t('translation.errorDesc', 'Failed to generate translations. Please try again.'),
      });
    } finally {
      if (isCurrentRequest()) setLoading(false);
    }
  };

  const handleSave = () => {
    // Don't save the source language in translations (it's the main field value)
    const translationsToSave: Translations = {};
    for (const [code, text] of Object.entries(localTranslations)) {
      if (code !== sourceLanguage && text.trim()) {
        translationsToSave[code] = text.trim();
      }
    }
    onSave(translationsToSave);
    handleOpenChange(false);
    toast({
      title: t('translation.saved', 'Translations saved'),
    });
  };

  const handleTranslationChange = (langCode: string, text: string) => {
    setLocalTranslations((prev) => ({
      ...prev,
      [langCode]: text,
    }));
  };

  const getLanguageName = (code: string) => {
    const lang = EU_LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.nativeName} (${lang.name})` : code;
  };

  return (
    <>
      <Button
        type="button"
        variant={hasTranslations ? 'secondary' : 'ghost'}
        size={size}
        onClick={handleOpen}
        disabled={disabled}
        className={size === 'icon' ? 'h-9 w-9 shrink-0' : ''}
        title={t('translation.manageTranslations', 'Manage translations')}
      >
        <Languages className="h-4 w-4" />
        {size !== 'icon' && (
          <span className="ml-2">{t('translation.translate', 'Translate')}</span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {t('translation.title', 'Translations')}
              {fieldLabel && ` - ${fieldLabel}`}
            </DialogTitle>
            <DialogDescription>
              {t('translation.description', 'Provide translations for all EU languages. Use AI to generate initial translations, then review and edit as needed.')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 py-2 border-b">
            <div className="flex-1 text-sm text-muted-foreground">
              {t('translation.sourceText', 'Source text')}: <strong>{value || t('translation.empty', '(empty)')}</strong>
            </div>
            <button
              type="button"
              onClick={handleGenerateTranslations}
              disabled={!aiEnabled || loading || !value.trim()}
              className="group relative overflow-hidden rounded-lg p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 15%, #FEC89A 30%, #98D8AA 50%, #7EB6FF 70%, #A78BFA 85%, #F472B6 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 4s ease infinite',
              }}
            >
              <div className="relative flex items-center justify-center gap-2 rounded-[6px] bg-background/95 px-4 py-2 backdrop-blur-sm transition-all group-hover:bg-background/90">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-500" />
                )}
                <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {t('translation.generateWithAI', 'Generate with AI')}
                </span>
              </div>
            </button>
          </div>

          <div className="flex-1 min-h-0 max-h-[50vh] overflow-y-auto -mx-6 px-6">
            <div className="grid gap-3 py-4 pr-4">
              {EU_LANGUAGES.map((lang) => (
                <div key={lang.code} className="grid grid-cols-[140px_1fr] gap-3 items-center">
                  <Label
                    htmlFor={`trans-${lang.code}`}
                    className={`text-sm truncate ${lang.code === sourceLanguage ? 'font-semibold' : ''}`}
                    title={getLanguageName(lang.code)}
                  >
                    {lang.nativeName}
                    {lang.code === sourceLanguage && ' ★'}
                  </Label>
                  <Input
                    id={`trans-${lang.code}`}
                    value={localTranslations[lang.code] || ''}
                    onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                    placeholder={lang.code === sourceLanguage ? value : t('translation.enterTranslation', 'Enter translation...')}
                    disabled={lang.code === sourceLanguage}
                    className={lang.code === sourceLanguage ? 'bg-muted' : ''}
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={handleSave}>
              {t('translation.saveTranslations', 'Save Translations')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
