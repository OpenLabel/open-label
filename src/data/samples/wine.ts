/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import type { PassportFormData } from '@/types/passport';
import { calculateWineNutrition } from '@/lib/wineCalculations';

const ALCOHOL_PERCENT = 13.5;
const RESIDUAL_SUGAR = 2.5; // g/L
const TOTAL_ACIDITY = 5.2; // g/L
const GLYCERINE = 0; // g/L

/**
 * Fictitious wine demo passport. Mirrors the long-standing front-page demo
 * bottle, but lives in code so it can never drift from the wine renderer.
 * Nutrition is computed from the declared analysis, never hard-coded.
 */
export function buildSampleWinePassport(): PassportFormData {
  const nutrition = calculateWineNutrition({
    alcoholPercent: ALCOHOL_PERCENT,
    residualSugar: RESIDUAL_SUGAR,
    totalAcidity: TOTAL_ACIDITY,
    glycerine: GLYCERINE,
  });

  return {
    name: 'Chateau Example 2022',
    category: 'wine',
    image_url: null,
    description:
      '<p>A demonstration Digital Product Passport for a typical French red wine. All data shown here is fictitious and intended for preview only.</p>',
    language: 'en',
    category_data: {
      product_name: 'Chateau Example 2022',

      // Product info
      volume: 750,
      volume_unit: 'ml',
      grape_variety: 'Merlot, Cabernet Sauvignon',
      vintage: '2022',
      country: 'France',
      region: 'Bordeaux',
      denomination: 'Bordeaux AOC',
      sugar_classification: 'Dry',
      sugar_classification_translations: {
        bg: 'Сухо',
        cs: 'Suché',
        da: 'Tør',
        de: 'Trocken',
        el: 'Ξηρό',
        en: 'Dry',
        es: 'Seco',
        et: 'Kuiv',
        fi: 'Kuiva',
        fr: 'Sec',
        ga: 'Tirim',
        hr: 'Suho',
        hu: 'Száraz',
        it: 'Secco',
        lt: 'Sausas',
        lv: 'Sausais',
        mt: 'Niexef',
        nl: 'Droog',
        pl: 'Wytrawne',
        pt: 'Seco',
        ro: 'Sec',
        sk: 'Suché',
        sl: 'Suho',
        sv: 'Torrt',
        'zh-CN': '干型',
      },

      // Producer
      producer_name: 'Domaine Example',

      // Nutrition — computed, per 100 ml
      alcohol_percent: ALCOHOL_PERCENT,
      residual_sugar: RESIDUAL_SUGAR,
      total_acidity: TOTAL_ACIDITY,
      energy_kcal: nutrition.energyKcal,
      energy_kj: nutrition.energyKj,
      carbohydrates: nutrition.carbohydrates,
      sugar: nutrition.sugar,
      fat: 0,
      saturated_fat: 0,
      proteins: 0,
      salt: 0,

      // Display options
      show_alcohol_on_label: true,
      show_residual_sugar_on_label: false,
      show_total_acidity_on_label: false,

      // Ingredients (canonical ids from wineIngredients.ts)
      ingredients: [
        { id: 'grapes', name: 'Grapes' },
        { id: 'sulfites', name: 'Sulfites', isAllergen: true },
        { id: 'tartaric_acid', name: 'Tartaric acid', eNumber: 'E 334' },
      ],

      // Packaging (canonical ids from wineRecycling.ts)
      packaging_materials: [
        {
          id: 'sample_bottle',
          typeId: 'bottle',
          typeName: 'Bottle',
          compositionId: 'gl_70',
          compositionName: 'Colorless glass',
          compositionCode: 'GL 70',
          disposalMethodId: 'glass_collection',
          disposalMethodName: 'Glass collection',
          isCustomType: false,
        },
        {
          id: 'sample_cork',
          typeId: 'cork',
          typeName: 'Cork',
          compositionId: 'for_51',
          compositionName: 'Cork',
          compositionCode: 'FOR 51',
          disposalMethodId: 'residual_waste',
          disposalMethodName: 'Residual waste collection',
          isCustomType: false,
        },
      ],
    },
  };
}
