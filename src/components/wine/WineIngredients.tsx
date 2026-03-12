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

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, GripVertical, X, AlertTriangle, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getIngredientById, getIngredientCategory } from '@/data/wineIngredients';
import { IngredientPickerDialog } from './IngredientPickerDialog';
import { CustomIngredientDialog, CustomIngredient } from './CustomIngredientDialog';

interface SelectedIngredient {
  id: string;
  name: string;
  eNumber?: string;
  isAllergen?: boolean;
  isCustom?: boolean;
  category?: string;
  nameTranslations?: Record<string, string>;
}

interface WineIngredientsProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function WineIngredients({ data, onChange }: WineIngredientsProps) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<CustomIngredient | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedIngredients = (data.ingredients as SelectedIngredient[]) || [];

  // Translate ingredient name - uses translation if available, otherwise falls back to stored name
  const translateIngredient = (ingredient: SelectedIngredient): string => {
    if (ingredient.isCustom) return ingredient.name;
    const translationKey = `ingredients.${ingredient.id}`;
    const translated = t(translationKey);
    return translated === translationKey ? ingredient.name : translated;
  };

  const handleApplyFromPicker = (selectedIds: string[]) => {
    // Get existing custom ingredients
    const customIngredients = selectedIngredients.filter((ing) => ing.isCustom);
    
    // Convert selected IDs to ingredient objects
    const standardIngredients: SelectedIngredient[] = selectedIds
      .map((id) => {
        const ingredient = getIngredientById(id);
        if (!ingredient) return null;
        return {
          id: ingredient.id,
          name: ingredient.name,
          eNumber: ingredient.eNumber,
          isAllergen: ingredient.isAllergen,
          category: getIngredientCategory(id),
        };
      })
      .filter(Boolean) as SelectedIngredient[];

    onChange({
      ...data,
      ingredients: [...standardIngredients, ...customIngredients],
    });
  };

  const handleAddCustom = (ingredient: CustomIngredient) => {
    onChange({
      ...data,
      ingredients: [...selectedIngredients, ingredient],
    });
  };

  const handleUpdateCustom = (updatedIngredient: CustomIngredient) => {
    onChange({
      ...data,
      ingredients: selectedIngredients.map((ing) =>
        ing.id === updatedIngredient.id ? updatedIngredient : ing
      ),
    });
    setEditingIngredient(null);
  };

  const handleEditCustomIngredient = (ingredient: SelectedIngredient) => {
    if (ingredient.isCustom) {
      setEditingIngredient(ingredient as CustomIngredient);
      setCustomOpen(true);
    }
  };

  const handleRemoveIngredient = (id: string) => {
    onChange({
      ...data,
      ingredients: selectedIngredients.filter((ing) => ing.id !== id),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newIngredients = [...selectedIngredients];
    const draggedItem = newIngredients[draggedIndex];
    newIngredients.splice(draggedIndex, 1);
    newIngredients.splice(index, 0, draggedItem);

    onChange({ ...data, ingredients: newIngredients });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleCloseCustomDialog = (open: boolean) => {
    setCustomOpen(open);
    if (!open) {
      setEditingIngredient(null);
    }
  };

  const standardIngredientIds = useMemo(
    () => selectedIngredients.filter((ing) => !ing.isCustom).map((ing) => ing.id),
    [selectedIngredients]
  );

  const allergenIngredients = selectedIngredients.filter((ing) => ing.isAllergen);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('wine.ingredients')}</CardTitle>
        <CardDescription>
          {t('wine.ingredientsDescription', 'Select ingredients from the wine ingredient list or add custom ones. Sort them by quantity (largest to smallest).')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Choose Ingredients */}
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('wine.chooseIngredients', 'Choose wine ingredients')} *</Label>
          <p className="text-sm text-muted-foreground">
            {t('wine.chooseIngredientsDescription', 'Select all ingredients that are part of your wine composition. If necessary, you can add a custom ingredient.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setPickerOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('wine.selectFromList', 'Select ingredient from list')}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setEditingIngredient(null);
                setCustomOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('wine.defineCustom', 'Define custom ingredient')}
            </Button>
          </div>
        </div>

        {/* Sort Ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('wine.sortIngredients', 'Sort ingredients')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('wine.sortIngredientsDescription', "The ingredient list should be sorted from largest to smallest quantity. Quantities below 0.1 g/100 ml don't need to be sorted.")}
            </p>
            <div className="border rounded-lg divide-y">
              {selectedIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-background hover:bg-muted/50 cursor-move ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className={ingredient.isAllergen ? 'font-semibold' : ''}>
                      {translateIngredient(ingredient)}
                    </span>
                    {ingredient.eNumber && (
                      <span className="text-muted-foreground text-sm">
                        ({ingredient.eNumber})
                      </span>
                    )}
                    {ingredient.isCustom && (
                      <Badge variant="secondary" className="text-xs">
                        {t('common.custom', 'Custom')}
                      </Badge>
                    )}
                    {ingredient.isAllergen && (
                      <Badge variant="destructive" className="text-xs">
                        {t('wine.allergen', 'Allergen')}
                      </Badge>
                    )}
                  </div>
                  {ingredient.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleEditCustomIngredient(ingredient)}
                      className="p-1 hover:bg-muted rounded"
                      title={t('common.edit')}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergen Warning */}
        {allergenIngredients.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">{t('wine.allergenNotice', 'Allergen notice')}</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('wine.allergenWarning', 'This wine contains allergens that must be declared:')}{' '}
                {allergenIngredients.map((a) => translateIngredient(a)).join(', ')}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <IngredientPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={standardIngredientIds}
        onApply={handleApplyFromPicker}
      />

      <CustomIngredientDialog
        open={customOpen}
        onOpenChange={handleCloseCustomDialog}
        onAdd={handleAddCustom}
        editIngredient={editingIngredient}
        onUpdate={handleUpdateCustom}
      />
    </Card>
  );
}
