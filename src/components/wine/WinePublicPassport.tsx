import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DPPLanguagePicker } from '@/components/DPPLanguagePicker';

interface WinePassportData {
  name: string;
  image_url: string | null;
  description: string | null;
  category_data: Record<string, unknown>;
  updated_at: string;
}

interface SelectedIngredient {
  id: string;
  name: string;
  isAllergen?: boolean;
  category?: string;
  nameTranslations?: Record<string, string>;
}

interface PackagingMaterial {
  id: string;
  typeId: string;
  typeName: string;
  compositionId?: string;
  compositionName?: string;
  compositionCode?: string;
  disposalMethodId?: string;
  disposalMethodName?: string;
  isCustomType?: boolean;
  customTypeName?: string;
  customTypeNameTranslations?: Record<string, string>;
}

interface WinePublicPassportProps {
  passport: WinePassportData;
  isPreview?: boolean;
  /** For preview mode: current preview language */
  previewLanguage?: string;
  /** For preview mode: callback when language changes */
  onPreviewLanguageChange?: (lang: string) => void;
}

export function WinePublicPassport({ 
  passport, 
  isPreview = false,
  previewLanguage,
  onPreviewLanguageChange,
}: WinePublicPassportProps) {
  const { t: tBase, i18n } = useTranslation();
  const categoryData = (passport.category_data || {}) as Record<string, unknown>;

  // Get the effective language for displaying translated content
  const displayLanguage = previewLanguage || i18n.language.split('-')[0];
  
  // Create a translation function that respects the preview language
  // This ensures ALL labels in the preview use the selected language, not the app language
  const t = (key: string) => tBase(key, { lng: displayLanguage });

  // Product info
  const productName = (categoryData.product_name as string) || passport.name;
  const volume = categoryData.volume as number | undefined;
  const volumeUnit = (categoryData.volume_unit as string) || 'ml';
  const grapeVarietyRaw = categoryData.grape_variety as string | undefined;
  const grapeVarietyTranslations = categoryData.grape_variety_translations as Record<string, string> | undefined;
  const grapeVariety = grapeVarietyTranslations?.[displayLanguage] || grapeVarietyRaw;

  const vintageRaw = categoryData.vintage as string | undefined;
  const vintageTranslations = categoryData.vintage_translations as Record<string, string> | undefined;
  const vintage = vintageTranslations?.[displayLanguage] || vintageRaw;

  const country = categoryData.country as string | undefined;

  const regionRaw = categoryData.region as string | undefined;
  const regionTranslations = categoryData.region_translations as Record<string, string> | undefined;
  const region = regionTranslations?.[displayLanguage] || regionRaw;
  
  // Denomination with translations
  const denominationRaw = categoryData.denomination as string | undefined;
  const denominationTranslations = categoryData.denomination_translations as Record<string, string> | undefined;
  const denomination = denominationTranslations?.[displayLanguage] || denominationRaw;
  
  // Sugar classification with translations
  const sugarClassificationRaw = categoryData.sugar_classification as string | undefined;
  const sugarClassificationTranslations = categoryData.sugar_classification_translations as Record<string, string> | undefined;
  const sugarClassification = sugarClassificationTranslations?.[displayLanguage] || sugarClassificationRaw;

  // Producer info
  const producerName = categoryData.producer_name as string | undefined;
  const bottlerInfo = categoryData.bottler_info as string | undefined;


  // Nutritional values

  // Nutritional values
  const alcoholPercent = categoryData.alcohol_percent as number | undefined;
  const residualSugar = categoryData.residual_sugar as number | undefined;
  const totalAcidity = categoryData.total_acidity as number | undefined;
  const energyKcal = categoryData.energy_kcal as number | undefined;
  const energyKj = categoryData.energy_kj as number | undefined;
  const carbohydrates = categoryData.carbohydrates as number | undefined;
  const sugar = categoryData.sugar as number | undefined;
  const fat = categoryData.fat as number | undefined;
  const saturatedFat = categoryData.saturated_fat as number | undefined;
  const proteins = categoryData.proteins as number | undefined;
  const salt = categoryData.salt as number | undefined;

  // Display options - these control visibility in product info section
  const showAlcohol = categoryData.show_alcohol_on_label === true;
  const showResidualSugar = categoryData.show_residual_sugar_on_label === true;
  const showTotalAcidity = categoryData.show_total_acidity_on_label === true;

  // Ingredients
  const ingredients = (categoryData.ingredients as SelectedIngredient[]) || [];

  // Recycling / Packaging materials
  const packagingMaterials = (categoryData.packaging_materials as PackagingMaterial[]) || [];

  // Counterfeit protection
  const counterfeitProtectionEnabled = categoryData.counterfeit_protection_enabled === true;

  const hasNutritionalInfo = energyKcal || energyKj || carbohydrates !== undefined || sugar !== undefined;
  const hasRecyclingInfo = packagingMaterials.length > 0;
  const hasProducerInfo = producerName || bottlerInfo || country;
  
  // Helper to get material type name with translation support
  const getMaterialTypeName = (material: PackagingMaterial): string => {
    if (material.isCustomType) {
      // Check for user-provided translation
      const customTranslation = material.customTypeNameTranslations?.[displayLanguage];
      if (customTranslation) return customTranslation;
      return material.customTypeName || material.typeName;
    }
    return material.typeName;
  };

  // Translate ingredient name
  // For custom ingredients: use nameTranslations if available for current displayLanguage
  // For standard ingredients: use i18n translation
  const translateIngredient = (ingredient: SelectedIngredient): string => {
    // Custom ingredients: check for user-provided translations first
    if (ingredient.id?.startsWith('custom_')) {
      const customTranslation = ingredient.nameTranslations?.[displayLanguage];
      if (customTranslation) return customTranslation;
      return ingredient.name; // Fall back to original name
    }
    
    // Standard ingredients: use i18n system
    const translationKey = `ingredients.${ingredient.id}`;
    const translated = t(translationKey);
    // If translation key is returned (no translation found), use the stored name
    return translated === translationKey ? ingredient.name : translated;
  };

  // Format ingredients for display according to EU regulations
  // - Gases become "Bottled in a protective atmosphere"
  // - Acidity regulators, stabilizers, preservatives get category prefix
  // - Allergens are bold
  const formatIngredientsDisplay = (): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    
    // Group ingredients by category
    const generalIngredients: SelectedIngredient[] = [];
    const gasIngredients: SelectedIngredient[] = [];
    const acidityRegulators: SelectedIngredient[] = [];
    const stabilizers: SelectedIngredient[] = [];
    const preservatives: SelectedIngredient[] = [];
    const processingAids: SelectedIngredient[] = [];
    const customIngredients: SelectedIngredient[] = [];
    
    ingredients.forEach(ing => {
      const category = ing.category || 'general';
      if (category === 'gases') gasIngredients.push(ing);
      else if (category === 'acidity_regulators') acidityRegulators.push(ing);
      else if (category === 'stabilizers') stabilizers.push(ing);
      else if (category === 'preservatives') preservatives.push(ing);
      else if (category === 'processing_aids') processingAids.push(ing);
      else if (ing.id?.startsWith('custom_')) customIngredients.push(ing);
      else generalIngredients.push(ing);
    });

    // Helper to render an ingredient (bold if allergen)
    const renderIngredient = (ing: SelectedIngredient): React.ReactNode => {
      const name = translateIngredient(ing);
      return ing.isAllergen ? <strong key={ing.id}>{name}</strong> : name;
    };

    // Add general ingredients
    generalIngredients.forEach((ing, idx) => {
      if (result.length > 0) result.push(', ');
      result.push(renderIngredient(ing));
    });

    // Add custom ingredients
    customIngredients.forEach((ing) => {
      if (result.length > 0) result.push(', ');
      result.push(renderIngredient(ing));
    });

    // Add gases as "Bottled in a protective atmosphere"
    if (gasIngredients.length > 0) {
      if (result.length > 0) result.push(', ');
      result.push(t('wine.bottledProtectiveAtmosphere'));
    }

    // Add acidity regulators with category prefix
    if (acidityRegulators.length > 0) {
      if (result.length > 0) result.push(', ');
      const names = acidityRegulators.map(ing => renderIngredient(ing));
      result.push(
        <span key="acidity">{t('wine.ingredientCategories.acidity_regulators')}: {names.reduce((prev, curr, i) => i === 0 ? [curr] : [...prev as React.ReactNode[], ', ', curr], [] as React.ReactNode[])}</span>
      );
    }

    // Add stabilizers with category prefix
    if (stabilizers.length > 0) {
      if (result.length > 0) result.push(', ');
      const names = stabilizers.map(ing => renderIngredient(ing));
      result.push(
        <span key="stabilizers">{t('wine.ingredientCategories.stabilizers')}: {names.reduce((prev, curr, i) => i === 0 ? [curr] : [...prev as React.ReactNode[], ', ', curr], [] as React.ReactNode[])}</span>
      );
    }

    // Add preservatives with category prefix
    if (preservatives.length > 0) {
      if (result.length > 0) result.push(', ');
      const names = preservatives.map(ing => renderIngredient(ing));
      result.push(
        <span key="preservatives">{t('wine.ingredientCategories.preservatives')}: {names.reduce((prev, curr, i) => i === 0 ? [curr] : [...prev as React.ReactNode[], ', ', curr], [] as React.ReactNode[])}</span>
      );
    }

    // Add processing aids (allergens will be bold)
    processingAids.forEach((ing) => {
      if (result.length > 0) result.push(', ');
      result.push(renderIngredient(ing));
    });

    return result;
  };

  // Get unique component types for recycling table columns
  const uniqueComponentTypes = useMemo(() => {
    const types = new Map<string, { id: string; name: string }>();
    packagingMaterials.forEach(m => {
      if (!types.has(m.typeId)) {
        types.set(m.typeId, { id: m.typeId, name: getMaterialTypeName(m) });
      }
    });
    return Array.from(types.entries());
  }, [packagingMaterials, displayLanguage]);

  return (
    <div className="min-h-screen bg-background">
      {/* Language Switcher - Top Right */}
      <div className="container mx-auto px-4 pt-4 max-w-lg">
        <div className="flex justify-end">
          <DPPLanguagePicker 
            localOnly={isPreview}
            currentLanguage={previewLanguage}
            onLanguageChange={onPreviewLanguageChange}
          />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header with Product Name and Image */}
        <div className="mb-6">
          {/* Product card with image and info side by side */}
          <div className="flex gap-5 items-start">
            {/* Product Image */}
            {passport.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={passport.image_url}
                  alt={productName}
                  className="w-28 h-auto max-h-44 object-contain rounded-lg shadow-sm"
                  data-testid="product-image"
                />
              </div>
            )}
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold leading-tight mb-2" data-testid="passport-name">{productName}</h1>
              
              {/* Key attributes inline */}
              <div className="space-y-1.5 text-sm">
                {volume && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">{t('wine.volume')}:</span>
                    <span className="font-medium">{volume} {volumeUnit}</span>
                  </div>
                )}
                {vintage && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">{t('wine.vintage')}:</span>
                    <span className="font-medium">{vintage}</span>
                  </div>
                )}
                {grapeVariety && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-muted-foreground">{t('wine.grapeVariety')}:</span>
                    <span className="font-medium">{grapeVariety}</span>
                  </div>
                )}
              </div>
              
              {/* Check Authenticity Button */}
              {counterfeitProtectionEnabled && (
                isPreview ? (
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-600 text-white rounded-md font-medium text-sm cursor-default">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('passport.checkAuthenticity')}
                  </div>
                ) : (
                  <a
                    href="https://app.cypheme.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('passport.checkAuthenticity')}
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        {/* Wine Attributes Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm">
          {showAlcohol && alcoholPercent !== undefined && (
            <div>
              <p className="text-muted-foreground">{t('wine.alcohol')}</p>
              <p className="font-medium">{alcoholPercent}% vol</p>
            </div>
          )}
          {showResidualSugar && residualSugar !== undefined && (
            <div>
              <p className="text-muted-foreground">{t('wine.residualSugar')}</p>
              <p className="font-medium">{residualSugar} g/l</p>
            </div>
          )}
          {showTotalAcidity && totalAcidity !== undefined && (
            <div>
              <p className="text-muted-foreground">{t('wine.acidity')}</p>
              <p className="font-medium">{totalAcidity} g/l</p>
            </div>
          )}
          {country && (
            <div>
              <p className="text-muted-foreground">{t('wine.country')}</p>
              <p className="font-medium">{country}</p>
            </div>
          )}
          {region && (
            <div>
              <p className="text-muted-foreground">{t('wine.region')}</p>
              <p className="font-medium">{region}</p>
            </div>
          )}
          {denomination && (
            <div>
              <p className="text-muted-foreground">{t('wine.denomination')}</p>
              <p className="font-medium">{denomination}</p>
            </div>
          )}
          {sugarClassification && (
            <div>
              <p className="text-muted-foreground">{t('wine.sugarClassification')}</p>
              <p className="font-medium">{sugarClassification}</p>
            </div>
          )}
        </div>


        {/* Nutritional Values - EU Regulation 1169/2011 compliant format */}
        {hasNutritionalInfo && (
          <section className="mb-6" data-testid="nutritional-section">
            <h2 className="text-xl font-semibold mb-3">{t('wine.nutritionalValues')}</h2>
            
            {/* EU mandates tabular format with values per 100ml */}
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-foreground/20">
                  <th className="text-left py-2 font-medium"></th>
                  <th className="text-right py-2 font-medium">{t('wine.per100ml')}</th>
                </tr>
              </thead>
              <tbody>
                {/* EU Order: Energy first (mandatory kJ, optional kcal) */}
                <tr className="border-b border-foreground/10">
                  <td className="py-2 font-medium">{t('wine.energy')}</td>
                  <td className="py-2 text-right">
                    {energyKj !== undefined ? `${energyKj} kJ` : '0 kJ'}
                    {' / '}
                    {energyKcal !== undefined ? `${energyKcal} kcal` : '0 kcal'}
                  </td>
                </tr>
                
                {/* Fat - only show if non-zero, otherwise covered by negligible notice */}
                {(fat !== undefined && fat > 0) ? (
                  <tr className="border-b border-foreground/10">
                    <td className="py-2">{t('wine.fat')}</td>
                    <td className="py-2 text-right">{fat} g</td>
                  </tr>
                ) : null}
                
                {/* of which saturated fat - only show if non-zero */}
                {(saturatedFat !== undefined && saturatedFat > 0) ? (
                  <tr className="border-b border-foreground/10">
                    <td className="py-2 pl-4 text-muted-foreground">{t('wine.saturatedFat')}</td>
                    <td className="py-2 text-right">{saturatedFat} g</td>
                  </tr>
                ) : null}
                
                {/* Carbohydrate - always show as it's calculated from sugar */}
                <tr className="border-b border-foreground/10">
                  <td className="py-2">{t('wine.carbohydrate')}</td>
                  <td className="py-2 text-right">{carbohydrates !== undefined ? `${carbohydrates} g` : '0 g'}</td>
                </tr>
                
                {/* of which sugars (indented) - always show */}
                <tr className="border-b border-foreground/10">
                  <td className="py-2 pl-4 text-muted-foreground">{t('wine.sugars')}</td>
                  <td className="py-2 text-right">{sugar !== undefined ? `${sugar} g` : '0 g'}</td>
                </tr>
                
                {/* Protein - only show if non-zero */}
                {(proteins !== undefined && proteins > 0) ? (
                  <tr className="border-b border-foreground/10">
                    <td className="py-2">{t('wine.protein')}</td>
                    <td className="py-2 text-right">{proteins} g</td>
                  </tr>
                ) : null}
                
                {/* Salt - only show if non-zero */}
                {(salt !== undefined && salt > 0) ? (
                  <tr className="border-b border-foreground/10">
                    <td className="py-2">{t('wine.salt')}</td>
                    <td className="py-2 text-right">{salt} g</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            {/* Negligible amounts notice - shown when fat, saturated fat, protein, salt are all 0 or undefined */}
            {(fat === 0 || fat === undefined) && 
             (saturatedFat === 0 || saturatedFat === undefined) && 
             (proteins === 0 || proteins === undefined) && 
             (salt === 0 || salt === undefined) && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {t('wine.negligibleAmounts')}
              </p>
            )}
          </section>
        )}

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <section className="mb-6" data-testid="ingredients-section">
            <h2 className="text-xl font-semibold mb-3">{t('wine.ingredients')}</h2>
            <p className="text-sm" data-testid="ingredients-list">
              {formatIngredientsDisplay()}
            </p>
          </section>
        )}

        {/* Recycling Information */}
        {hasRecyclingInfo && (
          <section className="mb-6" data-testid="recycling-section">
            <h2 className="text-xl font-semibold mb-3">{t('wine.recycling')}</h2>
            
            {packagingMaterials.length > 0 && (
              <>
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2"></th>
                      {uniqueComponentTypes.map(([typeId, typeInfo]) => (
                        <th key={typeId} className="text-center py-2 font-medium">{typeInfo.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">{t('recycling.code')}</td>
                      {uniqueComponentTypes.map(([typeId]) => {
                        const mat = packagingMaterials.find(m => m.typeId === typeId);
                        return (
                          <td key={typeId} className="py-2 text-center">{mat?.compositionCode || '-'}</td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">{t('recycling.material')}</td>
                      {uniqueComponentTypes.map(([typeId]) => {
                        const mat = packagingMaterials.find(m => m.typeId === typeId);
                        return (
                          <td key={typeId} className="py-2 text-center">{mat?.compositionName || '-'}</td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">{t('recycling.disposal')}</td>
                      {uniqueComponentTypes.map(([typeId]) => {
                        const mat = packagingMaterials.find(m => m.typeId === typeId);
                        return (
                          <td key={typeId} className="py-2 text-center">{mat?.disposalMethodName || '-'}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-muted-foreground">
                  {t('wine.recyclingNote')}
                </p>
              </>
            )}
          </section>
        )}

        {/* Legal Mentions / Producer Info */}
        {hasProducerInfo && (
          <section className="mb-6" data-testid="producer-section">
            <h2 className="text-xl font-semibold mb-3">{t('wine.legalInfo')}</h2>
            <div className="text-sm space-y-1">
              {producerName && <p>{producerName}</p>}
              {bottlerInfo && <p className="whitespace-pre-wrap">{bottlerInfo}</p>}
              {country && !producerName && !bottlerInfo && <p>{country}</p>}
            </div>
          </section>
        )}

        {/* Promotional Footer */}
        
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm text-foreground">
              {t('passport.poweredBy')}{' '}
              <a 
                href="https://www.digital-product-passports.com"
                className="text-primary font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Digital <span className="text-muted-foreground/60 font-normal">-</span> Product <span className="text-muted-foreground/60 font-normal">-</span> Passports <span className="text-muted-foreground font-normal">.com</span>
              </a>
            </p>
          </div>



        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-4 border-t">
          {isPreview ? (
            <span className="underline">{t('legal.legalMentions')}</span>
          ) : (
            <Link to="/legal" className="underline hover:text-foreground">
              {t('legal.legalMentions')}
            </Link>
          )}
        </footer>
      </main>
    </div>
  );
}

// Export field keys for testing - these are the ONLY fields that should be saved/displayed
export const WINE_PASSPORT_FIELDS = {
  productInfo: ['volume', 'volume_unit', 'grape_variety', 'vintage', 'country', 'region', 'denomination', 'sugar_classification', 'denomination_translations', 'sugar_classification_translations', 'grape_variety_translations', 'vintage_translations', 'region_translations'],
  producer: ['producer_name', 'bottler_info'],
  nutritional: ['alcohol_percent', 'energy_kcal', 'energy_kj', 'carbohydrates', 'sugar', 'residual_sugar', 'total_acidity', 'glycerine', 'fat', 'saturated_fat', 'proteins', 'salt'],
  manualOverrides: ['energy_kcal_manual', 'energy_kj_manual', 'carbohydrates_manual', 'sugar_manual'],
  displayOptions: ['show_alcohol_on_label', 'show_residual_sugar_on_label', 'show_total_acidity_on_label'],
  ingredients: ['ingredients'],
  recycling: ['packaging_materials'],
} as const;
