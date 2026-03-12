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

/**
 * Wine nutritional value calculations per EU Regulation 1169/2011
 */

export interface WineNutritionInputs {
  alcoholPercent: number;
  residualSugar: number; // g/L
  totalAcidity: number; // g/L (tartaric acid C4H6O6)
  glycerine: number; // g/L
}

export interface WineNutritionResults {
  glycerine: number; // g/L
  energyKcal: number; // per 100ml
  energyKj: number; // per 100ml
  carbohydrates: number; // g per 100ml
  sugar: number; // g per 100ml
}

/**
 * Calculate wine nutritional values per 100ml
 * 
 * Energy factors (EU Regulation 1169/2011):
 * - Alcohol: 7 kcal/g (density 0.789 g/ml)
 * - Sugar/Carbohydrates: 4 kcal/g
 * - Organic acids (tartaric C4H6O6): 3.12 kcal/g
 * - Polyols (glycerine): 2.4 kcal/g
 */
export function calculateWineNutrition(inputs: WineNutritionInputs): WineNutritionResults {
  const { alcoholPercent, residualSugar, totalAcidity, glycerine } = inputs;

  // Convert to grams per 100ml
  const alcoholGrams = alcoholPercent * 0.789;
  const sugarGrams = residualSugar / 10;
  const acidityGrams = totalAcidity / 10;
  const glycerineGrams = glycerine / 10;

  // Calculate energy
  const energyKcal = Math.round(
    (alcoholGrams * 7) + (sugarGrams * 4) + (acidityGrams * 3.12) + (glycerineGrams * 2.4)
  );
  const energyKj = Math.round(energyKcal * 4.184);

  // Carbohydrates include sugar and glycerine (polyol)
  const carbohydrates = Math.round((sugarGrams + glycerineGrams) * 10) / 10;
  const sugar = Math.round(sugarGrams * 10) / 10;

  return {
    glycerine: Math.round(glycerine * 10) / 10,
    energyKcal,
    energyKj,
    carbohydrates,
    sugar,
  };
}
