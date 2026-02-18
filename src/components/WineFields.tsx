import { useEffect, useMemo, useCallback } from 'react';
import { getAllIngredients, getIngredientCategory } from '@/data/wineIngredients';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { volumeUnits, wineCountries } from '@/templates/wine';
import { WineIngredients } from '@/components/wine/WineIngredients';
import { WineRecycling } from '@/components/wine/WineRecycling';
import { WineAIAutofill } from '@/components/wine/WineAIAutofill';
import { packagingMaterialTypes, materialCompositions, disposalMethods } from '@/data/wineRecycling';
import { calculateWineNutrition } from '@/lib/wineCalculations';
import { TranslationButton, Translations } from '@/components/TranslationButton';
import { useAutoTranslate } from '@/hooks/useAutoTranslate';
import { LabelWithHint, FieldHint } from '@/components/ui/field-hint';

interface WineFieldsProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function WineFields({ data, onChange }: WineFieldsProps) {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language.split('-')[0]; // Get base language code

  const handleChange = (id: string, value: unknown) => {
    onChange({ ...data, [id]: value });
  };

  // Auto-translate denomination
  const denominationValue = (data.denomination as string) || '';
  const denominationTranslations = (data.denomination_translations as Translations) || {};
  
  const handleDenominationTranslations = useCallback((translations: Translations) => {
    onChange({ ...data, denomination_translations: translations });
  }, [data, onChange]);

  const { isTranslating: isDenominationTranslating, markAsUserEdited: markDenominationEdited } = useAutoTranslate({
    value: denominationValue,
    sourceLanguage: currentLanguage,
    existingTranslations: denominationTranslations,
    onTranslationsGenerated: handleDenominationTranslations,
    enabled: !!denominationValue.trim(),
  });

  // Auto-translate sugar classification
  const sugarClassificationValue = (data.sugar_classification as string) || '';
  const sugarClassificationTranslations = (data.sugar_classification_translations as Translations) || {};
  
  const handleSugarClassificationTranslations = useCallback((translations: Translations) => {
    onChange({ ...data, sugar_classification_translations: translations });
  }, [data, onChange]);

  const { isTranslating: isSugarTranslating, markAsUserEdited: markSugarEdited } = useAutoTranslate({
    value: sugarClassificationValue,
    sourceLanguage: currentLanguage,
    existingTranslations: sugarClassificationTranslations,
    onTranslationsGenerated: handleSugarClassificationTranslations,
    enabled: !!sugarClassificationValue.trim(),
  });

  // Calculate nutritional values using the utility function
  const calculatedValues = useMemo(() => {
    const alcohol = Number(data.alcohol_percent) || 0;
    const residualSugar = Number(data.residual_sugar) || 0;
    const totalAcidity = Number(data.total_acidity) || 0;
    const glycerine = Number(data.glycerine) || 0;

    const result = calculateWineNutrition({
      alcoholPercent: alcohol,
      residualSugar,
      totalAcidity,
      glycerine,
    });

    return {
      glycerine,
      energyKcal: data.energy_kcal_manual ? Number(data.energy_kcal) : result.energyKcal,
      energyKj: data.energy_kj_manual ? Number(data.energy_kj) : result.energyKj,
      carbohydrates: data.carbohydrates_manual ? Number(data.carbohydrates) : result.carbohydrates,
      sugar: data.sugar_manual ? Number(data.sugar) : result.sugar,
    };
  }, [data]);

  // Update calculated values when dependencies change
  useEffect(() => {
    const updates: Record<string, unknown> = {};
    if (!data.energy_kcal_manual && data.energy_kcal !== calculatedValues.energyKcal) {
      updates.energy_kcal = calculatedValues.energyKcal;
    }
    if (!data.energy_kj_manual && data.energy_kj !== calculatedValues.energyKj) {
      updates.energy_kj = calculatedValues.energyKj;
    }
    if (!data.carbohydrates_manual && data.carbohydrates !== calculatedValues.carbohydrates) {
      updates.carbohydrates = calculatedValues.carbohydrates;
    }
    if (!data.sugar_manual && data.sugar !== calculatedValues.sugar) {
      updates.sugar = calculatedValues.sugar;
    }

    if (Object.keys(updates).length > 0) {
      onChange({ ...data, ...updates });
    }
  }, [calculatedValues, data, onChange]);

  // Check if small quantities have non-zero values
  const hasNonZeroSmallQuantities = useMemo(() => {
    return (
      Number(data.fat) > 0 ||
      Number(data.saturated_fat) > 0 ||
      Number(data.proteins) > 0 ||
      Number(data.salt) > 0
    );
  }, [data]);

  // Ingredient alias map for fuzzy matching from AI-detected names
  const INGREDIENT_ALIASES: Record<string, string> = {
    'sulphites': 'sulfites',
    'sulphite': 'sulfites',
    'sulfite': 'sulfites',
    'so2': 'sulfites',
    'sulfur dioxide': 'sulfur_dioxide',
    'sulphur dioxide': 'sulfur_dioxide',
    'e 220': 'sulfur_dioxide',
    'e220': 'sulfur_dioxide',
    'e 224': 'potassium_metabisulfite',
    'e224': 'potassium_metabisulfite',
    'e 202': 'potassium_sorbate',
    'e202': 'potassium_sorbate',
    'e 334': 'tartaric_acid',
    'e334': 'tartaric_acid',
    'e 330': 'citric_acid',
    'e330': 'citric_acid',
    'e 414': 'gum_arabic',
    'e414': 'gum_arabic',
    'e 300': 'ascorbic_acid',
    'e300': 'ascorbic_acid',
    'e 296': 'malic_acid',
    'e296': 'malic_acid',
    'e 270': 'lactic_acid',
    'e270': 'lactic_acid',
    'e 353': 'metatartaric_acid',
    'e353': 'metatartaric_acid',
    'e 1105': 'lysozyme',
    'e1105': 'lysozyme',
    'acacia gum': 'gum_arabic',
    'arabic gum': 'gum_arabic',
    'l-ascorbic acid': 'ascorbic_acid',
    'ascorbic acid': 'ascorbic_acid',
    'potassium metabisulphite': 'potassium_metabisulfite',
    'potassium bisulphite': 'potassium_bisulfite',
    'eggs': 'egg',
    'egg white': 'egg',
    'egg protein': 'egg',
    'milk protein': 'milk',
    'milk casein': 'casein',
    'fish glue': 'isinglass',
    'isinglass': 'isinglass',
    'fish bladder': 'isinglass',
  };

  // Map AI material names to materialCompositions IDs
  const mapPackagingComponents = (components: Array<{ type?: string; material?: string; material_code?: string; disposal?: string }>) => {
    
    return components.map((comp, index) => {
      // Match type
      const typeId = packagingMaterialTypes.find(
        (t: { id: string; name: string }) => t.name.toLowerCase() === (comp.type || '').toLowerCase() || t.id === (comp.type || '').toLowerCase()
      )?.id || comp.type || 'bottle';

      // Match material code first, then material name
      let compositionMatch = null;
      if (comp.material_code) {
        const codeNorm = comp.material_code.replace(/\s+/g, ' ').trim().toUpperCase();
        compositionMatch = materialCompositions.find(
          (m: { code: string }) => m.code.replace(/\s+/g, ' ').trim().toUpperCase() === codeNorm
        );
      }
      if (!compositionMatch && comp.material) {
        const matLower = comp.material.toLowerCase();
        compositionMatch = materialCompositions.find(
          (m: { name: string }) => m.name.toLowerCase().includes(matLower)
        );
      }

      // Match disposal
      let disposalMatch = null;
      if (comp.disposal) {
        const dispLower = comp.disposal.toLowerCase();
        disposalMatch = disposalMethods.find(
          (d: { name: string; id: string }) => d.name.toLowerCase().includes(dispLower) || d.id.includes(dispLower.replace(/\s+/g, '_'))
        );
      }

      return {
        id: `ai_${index}_${Date.now()}`,
        typeId,
        typeName: packagingMaterialTypes.find((t: { id: string; name: string }) => t.id === typeId)?.name || comp.type || 'Bottle',
        ...(compositionMatch ? {
          compositionId: compositionMatch.id,
          compositionName: compositionMatch.name,
          compositionCode: compositionMatch.code,
        } : {}),
        ...(disposalMatch ? {
          disposalMethodId: disposalMatch.id,
          disposalMethodName: disposalMatch.name,
        } : {}),
      };
    });
  };

  const handleAIAutofill = (extractedData: Record<string, unknown>) => {
    // Map detected_ingredients names to proper ingredient objects
    const detectedNames = extractedData.detected_ingredients as string[] | undefined;
    delete extractedData.detected_ingredients;

    // Map packaging_components to recycling_materials format
    const packagingComponents = extractedData.packaging_components as Array<{ type?: string; material?: string; material_code?: string; disposal?: string }> | undefined;
    delete extractedData.packaging_components;

    // Remove extra fields not used in the form
    delete extractedData.lot_number;
    delete extractedData.barcode;
    delete extractedData.description;
    delete extractedData.serving_temperature;

    let ingredientsToSet = undefined;
    if (detectedNames && detectedNames.length > 0) {
      const allIngredients = getAllIngredients();
      const seen = new Set<string>();
      const matched = detectedNames
        .map((name) => {
          const lower = name.toLowerCase().trim();
          // Check alias map first
          const aliasId = INGREDIENT_ALIASES[lower];
          if (aliasId) {
            const found = allIngredients.find((ing) => ing.id === aliasId);
            if (found && !seen.has(found.id)) {
              seen.add(found.id);
              return {
                id: found.id,
                name: found.name,
                eNumber: found.eNumber,
                isAllergen: found.isAllergen,
                category: getIngredientCategory(found.id),
              };
            }
          }
          // Direct name/id match
          const found = allIngredients.find(
            (ing) => ing.name.toLowerCase() === lower || ing.id === lower
          );
          if (found && !seen.has(found.id)) {
            seen.add(found.id);
            return {
              id: found.id,
              name: found.name,
              eNumber: found.eNumber,
              isAllergen: found.isAllergen,
              category: getIngredientCategory(found.id),
            };
          }
          // Partial match (e.g., "Tartaric acid" in "L-Tartaric acid")
          const partial = allIngredients.find(
            (ing) => lower.includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(lower)
          );
          if (partial && !seen.has(partial.id)) {
            seen.add(partial.id);
            return {
              id: partial.id,
              name: partial.name,
              eNumber: partial.eNumber,
              isAllergen: partial.isAllergen,
              category: getIngredientCategory(partial.id),
            };
          }
          // Unknown ingredient → add as custom
          const customId = `custom_${lower.replace(/\s+/g, '_')}`;
          if (!seen.has(customId)) {
            seen.add(customId);
            return {
              id: customId,
              name,
              isCustom: true,
            };
          }
          return null;
        })
        .filter(Boolean);
      ingredientsToSet = matched;
    }

    let recyclingToSet = undefined;
    if (packagingComponents && packagingComponents.length > 0) {
      try {
        recyclingToSet = mapPackagingComponents(packagingComponents);
      } catch (e) {
        console.error('Failed to map packaging components:', e);
      }
    }

    const mergedData = {
      ...data,
      ...extractedData,
      ...(ingredientsToSet ? { ingredients: ingredientsToSet } : {}),
      ...(recyclingToSet ? { recycling_materials: recyclingToSet } : {}),
    };
    onChange(mergedData);
  };

  return (
    <div className="space-y-6">
      {/* AI Autofill Button */}
      <WineAIAutofill onAutofill={handleAIAutofill} />

      {/* 1. Product Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('wine.productIdentity')}</CardTitle>
          <CardDescription>{t('wine.productIdentityDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <LabelWithHint 
              label={t('wine.productName')} 
              htmlFor="product_name" 
              required 
              tooltip={t('wine.hints.productNameTooltip')} 
            />
            <Input
              id="product_name"
              value={(data.product_name as string) || ''}
              onChange={(e) => handleChange('product_name', e.target.value)}
              placeholder={t('wine.placeholders.productName')}
            />
            <FieldHint hint={t('wine.hints.productName')} />
          </div>
          
          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.grapeVariety')} 
              htmlFor="grape_variety" 
              tooltip={t('wine.hints.grapeVarietyTooltip')} 
            />
            <Input
              id="grape_variety"
              value={(data.grape_variety as string) || ''}
              onChange={(e) => handleChange('grape_variety', e.target.value)}
              placeholder={t('wine.placeholders.grapeVariety')}
            />
            <FieldHint hint={t('wine.hints.grapeVariety')} />
          </div>

          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.vintage')} 
              htmlFor="vintage" 
              tooltip={t('wine.hints.vintageTooltip')} 
            />
            <Input
              id="vintage"
              value={(data.vintage as string) || ''}
              onChange={(e) => handleChange('vintage', e.target.value)}
              placeholder={t('wine.placeholders.vintage')}
            />
            <FieldHint hint={t('wine.hints.vintage')} />
          </div>

          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.volume')} 
              tooltip={t('wine.hints.volumeTooltip')} 
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={data.volume !== undefined && data.volume !== '' ? String(data.volume) : ''}
                onChange={(e) => handleChange('volume', e.target.value ? Number(e.target.value) : undefined)}
                placeholder={t('wine.placeholders.volume')}
                className="flex-1"
              />
              <Select
                value={(data.volume_unit as string) || 'ml'}
                onValueChange={(val) => handleChange('volume_unit', val)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {volumeUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldHint hint={t('wine.hints.volume')} />
          </div>

          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.country')} 
              htmlFor="country" 
              tooltip={t('wine.hints.countryTooltip')} 
            />
            <Select
              value={(data.country as string) || ''}
              onValueChange={(val) => handleChange('country', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('wine.selectCountry')} />
              </SelectTrigger>
              <SelectContent>
                {wineCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldHint hint={t('wine.hints.country')} />
          </div>

          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.region')} 
              htmlFor="region" 
              tooltip={t('wine.hints.regionTooltip')} 
            />
            <Input
              id="region"
              value={(data.region as string) || ''}
              onChange={(e) => handleChange('region', e.target.value)}
              placeholder={t('wine.placeholders.region')}
            />
            <FieldHint hint={t('wine.hints.region')} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <LabelWithHint 
                label={t('wine.denomination')} 
                htmlFor="denomination" 
                tooltip={t('wine.hints.denominationTooltip')} 
              />
              {isDenominationTranslating && <span className="text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating', 'Translating...')}</span>}
            </div>
            <div className="flex gap-2">
              <Input
                id="denomination"
                value={(data.denomination as string) || ''}
                onChange={(e) => handleChange('denomination', e.target.value)}
                placeholder={t('wine.placeholders.denomination')}
                className="flex-1"
              />
              <TranslationButton
                value={(data.denomination as string) || ''}
                sourceLanguage={currentLanguage}
                translations={denominationTranslations}
                onSave={(translations) => {
                  // Mark all languages as user-edited when saving from dialog
                  Object.keys(translations).forEach(lang => markDenominationEdited(lang));
                  handleChange('denomination_translations', translations);
                }}
                fieldLabel={t('wine.denomination')}
                disabled={!data.denomination}
              />
            </div>
            <FieldHint hint={t('wine.hints.denomination')} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-1.5">
              <LabelWithHint 
                label={t('wine.sugarClassification')} 
                htmlFor="sugar_classification" 
                tooltip={t('wine.hints.sugarClassificationTooltip')} 
              />
              {isSugarTranslating && <span className="text-xs text-muted-foreground animate-pulse">{t('translation.autoTranslating', 'Translating...')}</span>}
            </div>
            <div className="flex gap-2">
              <Input
                id="sugar_classification"
                value={(data.sugar_classification as string) || ''}
                onChange={(e) => handleChange('sugar_classification', e.target.value)}
                placeholder={t('wine.placeholders.sugarClassification')}
                className="flex-1"
              />
              <TranslationButton
                value={(data.sugar_classification as string) || ''}
                sourceLanguage={currentLanguage}
                translations={sugarClassificationTranslations}
                onSave={(translations) => {
                  // Mark all languages as user-edited when saving from dialog
                  Object.keys(translations).forEach(lang => markSugarEdited(lang));
                  handleChange('sugar_classification_translations', translations);
                }}
                fieldLabel={t('wine.sugarClassification')}
                disabled={!data.sugar_classification}
              />
            </div>
            <FieldHint hint={t('wine.hints.sugarClassification')} />
          </div>
        </CardContent>
      </Card>

      {/* 2. Producer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('wine.producerInfo')}</CardTitle>
          <CardDescription>{t('wine.producerInfoDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.producerName')} 
              htmlFor="producer_name" 
              tooltip={t('wine.hints.producerNameTooltip')} 
            />
            <Input
              id="producer_name"
              value={(data.producer_name as string) || ''}
              onChange={(e) => handleChange('producer_name', e.target.value)}
              placeholder={t('wine.placeholders.producerName')}
            />
            <FieldHint hint={t('wine.hints.producerName')} />
          </div>
          <div className="space-y-2">
            <LabelWithHint 
              label={t('wine.bottlerInfo')} 
              htmlFor="bottler_info" 
              tooltip={t('wine.hints.bottlerInfoTooltip')} 
            />
            <Input
              id="bottler_info"
              value={(data.bottler_info as string) || ''}
              onChange={(e) => handleChange('bottler_info', e.target.value)}
              placeholder={t('wine.bottlerInfoPlaceholder')}
            />
            <FieldHint hint={t('wine.hints.bottlerInfo')} />
          </div>
        </CardContent>
      </Card>

      {/* 4. Nutritional Values - Primary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('wine.nutritionalValues')}</CardTitle>
          <CardDescription>{t('wine.nutritionalValuesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <LabelWithHint 
                label={t('wine.alcoholPercent')} 
                htmlFor="alcohol_percent" 
                required
                tooltip={t('wine.hints.alcoholPercentTooltip')} 
              />
              <Input
                id="alcohol_percent"
                type="number"
                step="0.1"
                value={(data.alcohol_percent as number) || ''}
                onChange={(e) => handleChange('alcohol_percent', e.target.value ? Number(e.target.value) : '')}
                placeholder={t('wine.placeholders.alcohol')}
              />
              <FieldHint hint={t('wine.hints.alcoholPercent')} />
            </div>

            <div className="space-y-2">
              <LabelWithHint 
                label={t('wine.residualSugarGL')} 
                htmlFor="residual_sugar" 
                tooltip={t('wine.hints.residualSugarTooltip')} 
              />
              <Input
                id="residual_sugar"
                type="number"
                step="0.1"
                value={(data.residual_sugar as number) || ''}
                onChange={(e) => handleChange('residual_sugar', e.target.value ? Number(e.target.value) : '')}
                placeholder={t('wine.placeholders.residualSugar')}
              />
              <FieldHint hint={t('wine.hints.residualSugar')} />
            </div>

            <div className="space-y-2">
              <LabelWithHint 
                label={t('wine.totalAcidityGL')} 
                htmlFor="total_acidity" 
                tooltip={t('wine.hints.totalAcidityTooltip')} 
              />
              <Input
                id="total_acidity"
                type="number"
                step="0.1"
                value={(data.total_acidity as number) || ''}
                onChange={(e) => handleChange('total_acidity', e.target.value ? Number(e.target.value) : '')}
                placeholder={t('wine.placeholders.totalAcidity')}
              />
              <FieldHint hint={t('wine.hints.totalAcidity')} />
            </div>

            <div className="space-y-2">
              <LabelWithHint 
                label={t('wine.glycerineGL')} 
                htmlFor="glycerine" 
                tooltip={t('wine.hints.glycerineTooltip')} 
              />
              <Input
                id="glycerine"
                type="number"
                step="0.1"
                value={(data.glycerine as number) || ''}
                onChange={(e) => handleChange('glycerine', e.target.value ? Number(e.target.value) : '')}
                placeholder={t('wine.placeholders.glycerine')}
              />
              <FieldHint hint={t('wine.hints.glycerine')} />
            </div>
          </div>

          {/* Calculated values */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <p className="text-sm font-medium">{t('wine.calculatedValues')}</p>
              <LabelWithHint tooltip={t('wine.hints.calculatedValuesTooltip')} label="" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="energy_kcal" className="text-sm">{t('wine.energyKcal')}</Label>
                  <label htmlFor="energy_kcal_manual" className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      id="energy_kcal_manual"
                      checked={(data.energy_kcal_manual as boolean) || false}
                      onCheckedChange={(checked) => handleChange('energy_kcal_manual', checked)}
                    />
                    <span className="text-xs text-muted-foreground">{t('wine.manual')}</span>
                  </label>
                </div>
                <Input
                  id="energy_kcal"
                  type="number"
                  value={calculatedValues.energyKcal}
                  onChange={(e) => handleChange('energy_kcal', e.target.value ? Number(e.target.value) : '')}
                  disabled={!data.energy_kcal_manual}
                  className={!data.energy_kcal_manual ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="energy_kj" className="text-sm">{t('wine.energyKj')}</Label>
                  <label htmlFor="energy_kj_manual" className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      id="energy_kj_manual"
                      checked={(data.energy_kj_manual as boolean) || false}
                      onCheckedChange={(checked) => handleChange('energy_kj_manual', checked)}
                    />
                    <span className="text-xs text-muted-foreground">{t('wine.manual')}</span>
                  </label>
                </div>
                <Input
                  id="energy_kj"
                  type="number"
                  value={calculatedValues.energyKj}
                  onChange={(e) => handleChange('energy_kj', e.target.value ? Number(e.target.value) : '')}
                  disabled={!data.energy_kj_manual}
                  className={!data.energy_kj_manual ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="carbohydrates" className="text-sm">{t('wine.carbohydratesG')}</Label>
                  <label htmlFor="carbohydrates_manual" className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      id="carbohydrates_manual"
                      checked={(data.carbohydrates_manual as boolean) || false}
                      onCheckedChange={(checked) => handleChange('carbohydrates_manual', checked)}
                    />
                    <span className="text-xs text-muted-foreground">{t('wine.manual')}</span>
                  </label>
                </div>
                <Input
                  id="carbohydrates"
                  type="number"
                  step="0.1"
                  value={calculatedValues.carbohydrates}
                  onChange={(e) => handleChange('carbohydrates', e.target.value ? Number(e.target.value) : '')}
                  disabled={!data.carbohydrates_manual}
                  className={!data.carbohydrates_manual ? 'bg-muted' : ''}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sugar" className="text-sm">{t('wine.sugarG')}</Label>
                  <label htmlFor="sugar_manual" className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      id="sugar_manual"
                      checked={(data.sugar_manual as boolean) || false}
                      onCheckedChange={(checked) => handleChange('sugar_manual', checked)}
                    />
                    <span className="text-xs text-muted-foreground">{t('wine.manual')}</span>
                  </label>
                </div>
                <Input
                  id="sugar"
                  type="number"
                  step="0.1"
                  value={calculatedValues.sugar}
                  onChange={(e) => handleChange('sugar', e.target.value ? Number(e.target.value) : '')}
                  disabled={!data.sugar_manual}
                  className={!data.sugar_manual ? 'bg-muted' : ''}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Small Quantities */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-lg">
              {hasNonZeroSmallQuantities ? t('wine.additionalNutritional') : t('wine.smallQuantities')}
            </CardTitle>
            <LabelWithHint tooltip={t('wine.hints.smallQuantitiesTooltip')} label="" />
          </div>
          <CardDescription>
            {hasNonZeroSmallQuantities 
              ? t('wine.additionalNutritionalDesc')
              : t('wine.smallQuantitiesDesc')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldHint hint={t('wine.hints.smallQuantitiesHint')} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="fat">{t('wine.fatG')}</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={(data.fat as number) || 0}
                onChange={(e) => handleChange('fat', e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saturated_fat">{t('wine.saturatedFatG')}</Label>
              <Input
                id="saturated_fat"
                type="number"
                step="0.1"
                value={(data.saturated_fat as number) || 0}
                onChange={(e) => handleChange('saturated_fat', e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proteins">{t('wine.proteinsG')}</Label>
              <Input
                id="proteins"
                type="number"
                step="0.1"
                value={(data.proteins as number) || 0}
                onChange={(e) => handleChange('proteins', e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salt">{t('wine.saltG')}</Label>
              <Input
                id="salt"
                type="number"
                step="0.01"
                value={(data.salt as number) || 0}
                onChange={(e) => handleChange('salt', e.target.value ? Number(e.target.value) : 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Ingredients */}
      <WineIngredients data={data} onChange={onChange} />

      {/* 6. Electronic Label Display Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-lg">{t('wine.electronicLabelOptions')}</CardTitle>
            <LabelWithHint tooltip={t('wine.hints.electronicLabelTooltip')} label="" />
          </div>
          <CardDescription>
            {t('wine.electronicLabelOptionsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldHint hint={t('wine.hints.electronicLabelHint')} className="mb-4" />
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show_alcohol_on_label"
                checked={(data.show_alcohol_on_label as boolean) || false}
                onCheckedChange={(checked) => handleChange('show_alcohol_on_label', checked)}
              />
              <Label htmlFor="show_alcohol_on_label" className="text-sm font-normal cursor-pointer">
                {t('wine.showAlcohol')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show_residual_sugar_on_label"
                checked={(data.show_residual_sugar_on_label as boolean) || false}
                onCheckedChange={(checked) => handleChange('show_residual_sugar_on_label', checked)}
              />
              <Label htmlFor="show_residual_sugar_on_label" className="text-sm font-normal cursor-pointer">
                {t('wine.showResidualSugar')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show_total_acidity_on_label"
                checked={(data.show_total_acidity_on_label as boolean) || false}
                onCheckedChange={(checked) => handleChange('show_total_acidity_on_label', checked)}
              />
              <Label htmlFor="show_total_acidity_on_label" className="text-sm font-normal cursor-pointer">
                {t('wine.showTotalAcidity')}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Recycling Information */}
      <WineRecycling data={data} onChange={onChange} />

      {/* Promotional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('wine.displaySettings')}</CardTitle>
          <CardDescription>
            {t('wine.displaySettingsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldHint hint={t('wine.hints.displaySettingsHint')} className="mb-4" />
          <div className="flex items-center gap-2">
            <Checkbox
              id="hide_promo"
              checked={(data.hide_promo as boolean) || false}
              onCheckedChange={(checked) => handleChange('hide_promo', checked)}
            />
            <Label htmlFor="hide_promo" className="text-sm font-normal cursor-pointer">
              {t('wine.hidePromo')}
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
