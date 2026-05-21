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

/**
 * Canonical list of allergenic-fragrance IDs used by the toy-label-ocr
 * edge function. The edge function mirrors this list. The sync test in
 * toyFragrances.integrity.test.ts verifies they stay aligned.
 */
export const KNOWN_TOY_FRAGRANCE_IDS: string[] = [
  'acetylcedrene',
  'amyl_salicylate',
  'anisyl_alcohol',
  'benzaldehyde',
  'benzyl_benzoate',
  'benzyl_cinnamate',
  'beta_caryophyllene',
  'camphor',
  'cananga_ylang_ylang',
  'carvone',
  'cedrus_atlantica_bark_oil',
  'cinnamomum_cassia_leaf_oil',
  'cinnamomum_zeylanicum_bark_oil',
  'citrus_aurantium_amara_flower_oil',
  'citrus_aurantium_amara_peel_oil',
  'citrus_bergamia_peel_oil',
  'citrus_limonum_peel_oil',
  'citrus_sinensis_peel_oil',
  'citronellol',
  'cymbopogon_oils',
  'd_limonene',
  'dmbca',
  'eucalyptus_leaf_oil',
  'eugenia_caryophyllus_oil',
  'farnesol',
  'hexadecanolactone',
  'hexamethylindanopyran',
  'hexyl_cinnamal',
  'jasminum_extract',
  'juniperus_virginiana_oil',
  'laurus_nobilis_fruit_oil',
  'laurus_nobilis_leaf_oil',
  'laurus_nobilis_seed_oil',
  'lavandula_hybrida_oil',
  'lavandula_officinalis_oil',
  'lilial',
  'linalool',
  'linalyl_acetate',
  'mentha_piperita_oil',
  'mentha_spicata_oil',
  'menthol',
  'methyl_salicylate',
  'narcissus_extract',
  'pelargonium_graveolens_oil',
  'pinus_mugo_oil',
  'pinus_pumila_oil',
  'pogostemon_cablin_oil',
  'propylidene_phthalide',
  'rose_oil',
  'damascenone',
  'alpha_damascone',
  'cis_beta_damascone',
  'delta_damascone',
  'salicylaldehyde',
  'santalum_album_oil',
  'alpha_santalol',
  'beta_santalol',
  'sclareol',
  'alpha_pinene',
  'beta_pinene',
  'alpha_terpineol',
  'terpineol_mixture',
  'terpinolene',
  'tetramethyl_acetyloctahydro_naphthalenes',
  'trans_anethole',
  'majantol',
  'turpentine_oil',
  'vanillin',
  'alpha_isomethyl_ionone',
  'trimethyl_cyclopenten_pentenol',
  'dl_limonene',
];
