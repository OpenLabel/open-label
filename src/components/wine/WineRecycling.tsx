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
import { Plus, X, Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { TranslationButton, Translations } from '@/components/TranslationButton';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import {
  packagingMaterialTypes,
  getCompositionsByCategory,
  disposalMethods,
  PackagingMaterial,
  materialCompositions,
} from '@/data/wineRecycling';

// Extended PackagingMaterial with translations
interface PackagingMaterialWithTranslations extends PackagingMaterial {
  customTypeNameTranslations?: Translations;
}

interface WineRecyclingProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function WineRecycling({ data, onChange }: WineRecyclingProps) {
  const { t, i18n } = useTranslation();
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [customTypeOpen, setCustomTypeOpen] = useState(false);
  const [customTypeName, setCustomTypeName] = useState('');
  const [customTypeTranslations, setCustomTypeTranslations] = useState<Translations>({});
  const [editingMaterial, setEditingMaterial] = useState<PackagingMaterialWithTranslations | null>(null);

  const currentLanguage = i18n.language.split('-')[0];
  const materials = (data.packaging_materials as PackagingMaterialWithTranslations[]) || [];

  // Auto-translate custom type name
  const handleCustomTypeTranslationsGenerated = useCallback((translations: Translations) => {
    setCustomTypeTranslations(translations);
  }, []);

  const { isTranslating: isCustomTypeTranslating, markAsUserEdited: markCustomTypeEdited } = useAutoTranslate({
    value: customTypeName,
    sourceLanguage: currentLanguage,
    existingTranslations: customTypeTranslations,
    onTranslationsGenerated: handleCustomTypeTranslationsGenerated,
    enabled: customTypeOpen && !!customTypeName.trim(),
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!customTypeOpen) {
      setCustomTypeName('');
      setCustomTypeTranslations({});
      setEditingMaterial(null);
    }
  }, [customTypeOpen]);

  const handleAddMaterial = (typeId: string, typeName: string, isCustom = false) => {
    const newMaterial: PackagingMaterialWithTranslations = {
      id: `mat_${Date.now()}`,
      typeId: isCustom ? 'custom' : typeId,
      typeName: isCustom ? typeName : typeName,
      isCustomType: isCustom,
      customTypeName: isCustom ? typeName : undefined,
    };
    onChange({
      ...data,
      packaging_materials: [...materials, newMaterial],
    });
    setAddMaterialOpen(false);
  };

  const handleAddCustomType = () => {
    if (customTypeName.trim()) {
      const newMaterial: PackagingMaterialWithTranslations = {
        id: `mat_${Date.now()}`,
        typeId: 'custom',
        typeName: customTypeName.trim(),
        isCustomType: true,
        customTypeName: customTypeName.trim(),
        customTypeNameTranslations: Object.keys(customTypeTranslations).length > 0 ? customTypeTranslations : undefined,
      };
      onChange({
        ...data,
        packaging_materials: [...materials, newMaterial],
      });
      setCustomTypeName('');
      setCustomTypeTranslations({});
      setCustomTypeOpen(false);
    }
  };

  const handleUpdateCustomType = () => {
    if (editingMaterial && customTypeName.trim()) {
      onChange({
        ...data,
        packaging_materials: materials.map((m) =>
          m.id === editingMaterial.id
            ? {
                ...m,
                typeName: customTypeName.trim(),
                customTypeName: customTypeName.trim(),
                customTypeNameTranslations: Object.keys(customTypeTranslations).length > 0 ? customTypeTranslations : undefined,
              }
            : m
        ),
      });
      setCustomTypeName('');
      setCustomTypeTranslations({});
      setEditingMaterial(null);
      setCustomTypeOpen(false);
    }
  };

  const handleEditCustomMaterial = (material: PackagingMaterialWithTranslations) => {
    setEditingMaterial(material);
    setCustomTypeName(material.customTypeName || material.typeName);
    setCustomTypeTranslations(material.customTypeNameTranslations || {});
    setCustomTypeOpen(true);
  };

  const handleRemoveMaterial = (id: string) => {
    onChange({
      ...data,
      packaging_materials: materials.filter((m) => m.id !== id),
    });
  };

  const handleMaterialChange = (id: string, field: keyof PackagingMaterial, value: string) => {
    const composition = field === 'compositionId' 
      ? materialCompositions.find((c) => c.id === value)
      : null;
    const disposal = field === 'disposalMethodId'
      ? disposalMethods.find((d) => d.id === value)
      : null;

    onChange({
      ...data,
      packaging_materials: materials.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: value,
              ...(composition && {
                compositionName: composition.name,
                compositionCode: composition.code,
              }),
              ...(disposal && {
                disposalMethodName: disposal.name,
              }),
            }
          : m
      ),
    });
  };

  const compositionsByCategory = getCompositionsByCategory();

  const getMaterialIcon = (typeId: string) => {
    const type = packagingMaterialTypes.find((t) => t.id === typeId);
    return type?.icon || '📦';
  };

  const isEditMode = !!editingMaterial;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('wine.recycling')}</CardTitle>
        <CardDescription>
          {t('wine.recyclingDescription', 'Select the materials used for your wine packaging.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Materials List */}
        {materials.length > 0 && (
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex flex-col sm:flex-row gap-3 p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <span className="text-2xl">
                    {material.isCustomType ? '📦' : getMaterialIcon(material.typeId)}
                  </span>
                  <span className="font-medium">{material.typeName}</span>
                  {material.isCustomType && (
                    <button
                      type="button"
                      onClick={() => handleEditCustomMaterial(material)}
                      className="p-1 hover:bg-muted rounded"
                      title={t('common.edit')}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <Select
                    value={material.compositionId || ''}
                    onValueChange={(val) => {
                      if (val === 'custom') {
                        handleMaterialChange(material.id, 'compositionId', '');
                      } else {
                        handleMaterialChange(material.id, 'compositionId', val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('recycling.selectMaterial', 'Select material')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="font-bold text-foreground">{t('recycling.individualComponents', 'Individual Components')}</SelectLabel>
                      </SelectGroup>
                      {compositionsByCategory.individual.map((cat) => (
                        <SelectGroup key={cat.id}>
                          <SelectLabel>{cat.name}</SelectLabel>
                          {cat.compositions.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id}>
                              {comp.name} <span className="font-semibold">({comp.code})</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                      <SelectGroup>
                        <SelectLabel className="font-bold text-foreground">{t('recycling.compositeComponents', 'Composite Components')}</SelectLabel>
                      </SelectGroup>
                      {compositionsByCategory.composite.map((cat) => (
                        <SelectGroup key={cat.id}>
                          {cat.compositions.map((comp) => (
                            <SelectItem key={comp.id} value={comp.id}>
                              {comp.name} <span className="font-semibold">({comp.code})</span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                      <SelectGroup>
                        <SelectLabel className="font-bold text-foreground">{t('recycling.customMaterial', 'Custom Material')}</SelectLabel>
                        <SelectItem value="custom">{t('recycling.addCustomMaterial', 'Add custom material')}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Select
                    value={material.disposalMethodId || ''}
                    onValueChange={(val) =>
                      handleMaterialChange(material.id, 'disposalMethodId', val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('recycling.disposalAdvice', 'Disposal advice')} />
                    </SelectTrigger>
                    <SelectContent>
                      {disposalMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(material.id)}
                  className="self-start p-2 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Material Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setAddMaterialOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('recycling.addMaterial', 'Add material')}
        </Button>
      </CardContent>

      {/* Add Material Dialog */}
      <Dialog open={addMaterialOpen} onOpenChange={setAddMaterialOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('recycling.addPackagingMaterial', 'Add packaging material')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {packagingMaterialTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleAddMaterial(type.id, type.name)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="font-medium">{type.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAddMaterialOpen(false);
                setEditingMaterial(null);
                setCustomTypeName('');
                setCustomTypeTranslations({});
                setCustomTypeOpen(true);
              }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left border-t mt-2 pt-4"
            >
              <span className="text-muted-foreground">{t('recycling.customType', 'Custom type')}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Type Dialog */}
      <Dialog open={customTypeOpen} onOpenChange={setCustomTypeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? t('recycling.editCustomType', 'Edit custom material type')
                : t('recycling.addCustomType', 'Add custom material type')
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-type-name">
                {t('recycling.materialName', 'Material name')}
                {isCustomTypeTranslating && <span className="ml-2 text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating', 'Translating...')}</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="custom-type-name"
                  placeholder={t('recycling.materialNamePlaceholder', 'e.g., Wooden crate')}
                  value={customTypeName}
                  onChange={(e) => setCustomTypeName(e.target.value)}
                  className="flex-1"
                />
                <TranslationButton
                  value={customTypeName}
                  sourceLanguage={currentLanguage}
                  translations={customTypeTranslations}
                  onSave={(translations) => {
                    Object.keys(translations).forEach(lang => markCustomTypeEdited(lang));
                    setCustomTypeTranslations(translations);
                  }}
                  fieldLabel={t('recycling.materialName', 'Material name')}
                  disabled={!customTypeName.trim()}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomTypeOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={isEditMode ? handleUpdateCustomType : handleAddCustomType} 
              disabled={!customTypeName.trim()}
            >
              {isEditMode ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
