import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

// Official EU languages only (24 languages)
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localTranslations, setLocalTranslations] = useState<Translations>({});

  const hasTranslations = Object.keys(translations).length > 0;

  const handleOpen = () => {
    // Initialize with existing translations, using source value for source language
    const initial: Translations = { ...translations };
    if (value) {
      initial[sourceLanguage] = value;
    }
    setLocalTranslations(initial);
    setOpen(true);
  };

  const handleGenerateTranslations = async () => {
    if (!value.trim()) {
      toast({
        variant: 'destructive',
        title: t('translation.noSourceText', 'No source text'),
        description: t('translation.enterTextFirst', 'Please enter text in the field before generating translations.'),
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text: value,
          sourceLanguage,
          targetLanguages: EU_LANGUAGES.map((l) => l.code).filter((code) => code !== sourceLanguage),
        },
      });

      if (error) throw error;

      // Merge AI translations with existing (user edits take precedence)
      const newTranslations: Translations = { [sourceLanguage]: value };
      for (const lang of EU_LANGUAGES) {
        if (lang.code === sourceLanguage) continue;
        // Keep existing user edits, otherwise use AI translation
        newTranslations[lang.code] = localTranslations[lang.code] || data.translations[lang.code] || '';
      }

      setLocalTranslations(newTranslations);
      toast({
        title: t('translation.generated', 'Translations generated'),
        description: t('translation.reviewAndEdit', 'Review and edit translations as needed.'),
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        variant: 'destructive',
        title: t('translation.error', 'Translation error'),
        description: t('translation.errorDesc', 'Failed to generate translations. Please try again.'),
      });
    } finally {
      setLoading(false);
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
    setOpen(false);
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

      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateTranslations}
              disabled={loading || !value.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t('translation.generateWithAI', 'Generate with AI')}
            </Button>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
