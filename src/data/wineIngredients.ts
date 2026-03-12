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

export interface WineIngredient {
  id: string;
  name: string;
  eNumber?: string;
  note?: string;
  isAllergen?: boolean;
}

export interface IngredientCategory {
  id: string;
  name: string;
  ingredients: WineIngredient[];
}

export const wineProductTypes = [
  { id: 'wine', label: 'Wine', description: 'e.g., white wine, red wine, champagne' },
  { id: 'aromatized', label: 'Aromatized wines', description: 'e.g., mulled wine, glögg' },
  { id: 'fortified', label: 'Fortified wines', description: 'e.g., port, sherry' },
  { id: 'spirits', label: 'Spirits', description: 'e.g., vodka, whiskey (not legally binding)' },
];

export const wineIngredientCategories: IngredientCategory[] = [
  {
    id: 'general',
    name: 'General',
    ingredients: [
      { id: 'grapes', name: 'Grapes' },
      { id: 'saccharose', name: 'Saccharose' },
      { id: 'aleppo_pine_resin', name: 'Aleppo pine resin' },
      { id: 'caramel', name: 'Caramel' },
      { id: 'concentrated_grape_must', name: 'Concentrated grape must' },
      { id: 'grape_must', name: 'Grape must', note: 'optional; "Grapes" is sufficient' },
      { id: 'rectified_concentrated_grape_must', name: 'Rectified concentrated grape must' },
      { id: 'filling_dosage', name: 'Filling dosage' },
      { id: 'expedition_dosage', name: 'Expedition dosage' },
    ],
  },
  {
    id: 'gases',
    name: 'Gases and packaging gases',
    ingredients: [
      { id: 'argon', name: 'Argon', eNumber: 'E 938' },
      { id: 'nitrogen', name: 'Nitrogen', eNumber: 'E 941' },
      { id: 'carbon_dioxide', name: 'Carbon dioxide', eNumber: 'E 290', note: 'If used only as packaging gas, "Bottled under protective atmosphere" is sufficient. If added as additive (e.g., for sparkling wine), it must be listed.' },
      { id: 'protective_atmosphere', name: 'Bottled under protective atmosphere' },
    ],
  },
  {
    id: 'acidity_regulators',
    name: 'Acidity regulators',
    ingredients: [
      { id: 'tartaric_acid', name: 'Tartaric acid', eNumber: 'E 334' },
      { id: 'malic_acid', name: 'Malic acid', eNumber: 'E 296' },
      { id: 'lactic_acid', name: 'Lactic acid', eNumber: 'E 270' },
      { id: 'calcium_sulfate', name: 'Calcium sulfate', eNumber: 'E 516' },
      { id: 'citric_acid', name: 'Citric acid', eNumber: 'E 330' },
    ],
  },
  {
    id: 'stabilizers',
    name: 'Stabilizing agents',
    ingredients: [
      { id: 'citric_acid_stabilizer', name: 'Citric acid', eNumber: 'E 330' },
      { id: 'metatartaric_acid', name: 'Metatartaric acid', eNumber: 'E 353' },
      { id: 'gum_arabic', name: 'Gum arabic', eNumber: 'E 414' },
      { id: 'yeast_mannoproteins', name: 'Yeast mannoproteins' },
      { id: 'carboxymethylcellulose', name: 'Carboxymethylcellulose', eNumber: 'E 466' },
      { id: 'potassium_polyaspartate', name: 'Potassium polyaspartate', eNumber: 'E 456' },
      { id: 'fumaric_acid', name: 'Fumaric acid', eNumber: 'E 297' },
    ],
  },
  {
    id: 'preservatives',
    name: 'Preservatives and antioxidants',
    ingredients: [
      { id: 'potassium_sorbate', name: 'Potassium sorbate', eNumber: 'E 202' },
      { id: 'lysozyme', name: 'Lysozyme', eNumber: 'E 1105' },
      { id: 'ascorbic_acid', name: 'L-Ascorbic acid', eNumber: 'E 300' },
      { id: 'dmdc', name: 'Dimethyl dicarbonate (DMDC)' },
      { id: 'sulfites', name: 'Sulfites', note: '"Sulfites" can be used as a generic term for all sulfur compounds. You can declare them individually (e.g., sulfur dioxide) or collectively as "Sulfites".' },
      { id: 'sulfur_dioxide', name: 'Sulfur dioxide' },
      { id: 'potassium_bisulfite', name: 'Potassium bisulfite' },
      { id: 'potassium_metabisulfite', name: 'Potassium metabisulfite' },
    ],
  },
  {
    id: 'processing_aids',
    name: 'Processing aids',
    ingredients: [
      { id: 'egg', name: 'Egg', isAllergen: true },
      { id: 'milk', name: 'Milk', isAllergen: true },
      { id: 'casein', name: 'Casein', isAllergen: true },
      { id: 'albumin', name: 'Albumin', isAllergen: true },
      { id: 'isinglass', name: 'Isinglass (fish bladder)', isAllergen: true },
      { id: 'bentonite', name: 'Bentonite' },
      { id: 'gelatin', name: 'Gelatin' },
      { id: 'pea_protein', name: 'Pea protein' },
      { id: 'potato_protein', name: 'Potato protein' },
      { id: 'pvpp', name: 'PVPP (Polyvinylpolypyrrolidone)' },
    ],
  },
];

export const getAllIngredients = (): WineIngredient[] => {
  return wineIngredientCategories.flatMap((cat) => cat.ingredients);
};

export const getIngredientById = (id: string): WineIngredient | undefined => {
  return getAllIngredients().find((ing) => ing.id === id);
};

export const getIngredientCategory = (ingredientId: string): string | undefined => {
  for (const category of wineIngredientCategories) {
    if (category.ingredients.some(ing => ing.id === ingredientId)) {
      return category.id;
    }
  }
  return undefined;
};
