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
 * Canonical list of known ingredient IDs used by the wine-label-ocr edge function.
 * This is the single source of truth — the edge function mirrors this list.
 * The sync test in wineIngredients.integrity.test.ts verifies they stay aligned.
 */
export const KNOWN_INGREDIENT_IDS: string[] = [
  // General
  "grapes",
  "saccharose",
  "aleppo_pine_resin",
  "caramel",
  "concentrated_grape_must",
  "grape_must",
  "rectified_concentrated_grape_must",
  "filling_dosage",
  "expedition_dosage",
  // Gases
  "argon",
  "nitrogen",
  "carbon_dioxide",
  "protective_atmosphere",
  // Acidity regulators
  "tartaric_acid",
  "malic_acid",
  "lactic_acid",
  "calcium_sulfate",
  "citric_acid",
  // Stabilizers
  "citric_acid_stabilizer",
  "metatartaric_acid",
  "gum_arabic",
  "yeast_mannoproteins",
  "carboxymethylcellulose",
  "potassium_polyaspartate",
  "fumaric_acid",
  // Preservatives
  "potassium_sorbate",
  "lysozyme",
  "ascorbic_acid",
  "dmdc",
  "sulfites",
  "sulfur_dioxide",
  "potassium_bisulfite",
  "potassium_metabisulfite",
  // Processing aids
  "egg",
  "milk",
  "casein",
  "albumin",
  "isinglass",
  "bentonite",
  "gelatin",
  "pea_protein",
  "potato_protein",
  "pvpp",
];
