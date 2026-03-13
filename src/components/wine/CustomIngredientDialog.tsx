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

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TranslationButton, Translations } from '@/components/TranslationButton';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';

export interface CustomIngredient {
  id: string;
  name: string;
  eNumber?: string;
  isAllergen?: boolean;
  isCustom: true;
  nameTranslations?: Translations;
}

interface CustomIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (ingredient: CustomIngredient) => void;
  /** If provided, dialog is in edit mode */
  editIngredient?: CustomIngredient | null;
  onUpdate?: (ingredient: CustomIngredient) => void;
}

export function CustomIngredientDialog({
  open,
  onOpenChange,
  onAdd,
  editIngredient,
  onUpdate,
}: CustomIngredientDialogProps) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [eNumber, setENumber] = useState('');
  const [isAllergen, setIsAllergen] = useState(false);
  const [nameTranslations, setNameTranslations] = useState<Translations>({});

  const currentLanguage = i18n.language.split('-')[0];
  const isEditMode = !!editIngredient;

  // Auto-translate ingredient name
  const handleTranslationsGenerated = useCallback((translations: Translations) => {
    setNameTranslations(translations);
  }, []);

  const { isTranslating, markAsUserEdited } = useAutoTranslate({
    value: name,
    sourceLanguage: currentLanguage,
    existingTranslations: nameTranslations,
    onTranslationsGenerated: handleTranslationsGenerated,
    enabled: open && !!name.trim(),
  });

  // Reset form when dialog opens/closes or editIngredient changes
  useEffect(() => {
    if (open && editIngredient) {
      setName(editIngredient.name);
      setENumber(editIngredient.eNumber || '');
      setIsAllergen(editIngredient.isAllergen || false);
      setNameTranslations(editIngredient.nameTranslations || {});
    } else if (!open) {
      setName('');
      setENumber('');
      setIsAllergen(false);
      setNameTranslations({});
    }
  }, [open, editIngredient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const ingredient: CustomIngredient = {
      id: editIngredient?.id || `custom_${Date.now()}`,
      name: name.trim(),
      eNumber: eNumber.trim() || undefined,
      isAllergen,
      isCustom: true,
      nameTranslations: Object.keys(nameTranslations).length > 0 ? nameTranslations : undefined,
    };

    if (isEditMode && onUpdate) {
      onUpdate(ingredient);
    } else {
      onAdd(ingredient);
    }
    
    setName('');
    setENumber('');
    setIsAllergen(false);
    setNameTranslations({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('customIngredient.editTitle', 'Edit custom ingredient') : t('customIngredient.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-name">
              {t('customIngredient.ingredientName')} *
              {isTranslating && <span className="ml-2 text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating', 'Translating...')}</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('customIngredient.ingredientPlaceholder')}
                required
                className="flex-1"
              />
              <TranslationButton
                value={name}
                sourceLanguage={currentLanguage}
                translations={nameTranslations}
                onSave={(translations) => {
                  Object.keys(translations).forEach(lang => markAsUserEdited(lang));
                  setNameTranslations(translations);
                }}
                fieldLabel={t('customIngredient.ingredientName')}
                disabled={!name.trim()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-enumber">{t('customIngredient.eNumber')}</Label>
            <Input
              id="custom-enumber"
              value={eNumber}
              onChange={(e) => setENumber(e.target.value)}
              placeholder={t('customIngredient.eNumberPlaceholder')}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="custom-allergen"
              checked={isAllergen}
              onCheckedChange={(checked) => setIsAllergen(checked === true)}
            />
            <Label htmlFor="custom-allergen" className="font-normal cursor-pointer">
              {t('customIngredient.isAllergen')}
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditMode ? t('common.save') : t('customIngredient.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}