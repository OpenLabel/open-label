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
 * Seed list of allergenic fragrances relevant to toy labelling per
 * Regulation (EU) 2025/2509. The final implementing act may modify
 * this list; keep editable.
 */

export interface ToyFragrance {
  id: string;
  name: string;
  cas: string;
}

export const TOY_FRAGRANCES: ToyFragrance[] = [
  { id: 'acetylcedrene', name: 'Acetylcedrene', cas: '32388-55-9' },
  { id: 'amyl_salicylate', name: 'Amyl salicylate', cas: '2050-08-0' },
  { id: 'anisyl_alcohol', name: 'Anisyl alcohol', cas: '105-13-5' },
  { id: 'benzaldehyde', name: 'Benzaldehyde', cas: '100-52-7' },
  { id: 'benzyl_benzoate', name: 'Benzyl benzoate', cas: '120-51-4' },
  { id: 'benzyl_cinnamate', name: 'Benzyl cinnamate', cas: '103-41-3' },
  { id: 'beta_caryophyllene', name: 'Beta-caryophyllene', cas: '87-44-5' },
  { id: 'camphor', name: 'Camphor', cas: '76-22-2; 464-49-3' },
  { id: 'cananga_ylang_ylang', name: 'Cananga odorata and Ylang-ylang oil', cas: '83863-30-3; 8006-81-3' },
  { id: 'carvone', name: 'Carvone', cas: '99-49-0; 6485-40-1; 2244-16-8' },
  { id: 'cedrus_atlantica_bark_oil', name: 'Cedrus atlantica bark oil', cas: '92201-55-3; 8000-27-9' },
  { id: 'cinnamomum_cassia_leaf_oil', name: 'Cinnamomum cassia leaf oil', cas: '8007-80-5' },
  { id: 'cinnamomum_zeylanicum_bark_oil', name: 'Cinnamomum zeylanicum bark oil', cas: '84649-98-9' },
  { id: 'citrus_aurantium_amara_flower_oil', name: 'Citrus aurantium amara flower oil', cas: '8016-38-4' },
  { id: 'citrus_aurantium_amara_peel_oil', name: 'Citrus aurantium amara peel oil', cas: '72968-50-4' },
  { id: 'citrus_bergamia_peel_oil', name: 'Citrus bergamia peel oil expressed', cas: '89957-91-5' },
  { id: 'citrus_limonum_peel_oil', name: 'Citrus limonum peel oil expressed', cas: '84929-31-7' },
  { id: 'citrus_sinensis_peel_oil', name: 'Citrus sinensis / Aurantium dulcis peel oil expressed', cas: '97766-30-8; 8028-48-6' },
  { id: 'citronellol', name: 'Citronellol', cas: '106-22-9; 1117-61-9; 7540-51-4' },
  { id: 'cymbopogon_oils', name: 'Cymbopogon citratus / schoenanthus oils', cas: '89998-14-1; 8007-02-1; 89998-16-3' },
  { id: 'd_limonene', name: 'd-Limonene', cas: '5989-27-5' },
  { id: 'dmbca', name: 'Dimethylbenzyl carbinyl acetate (DMBCA)', cas: '151-05-3' },
  { id: 'eucalyptus_leaf_oil', name: 'Eucalyptus spp. leaf oil', cas: '92502-70-0; 8000-48-4' },
  { id: 'eugenia_caryophyllus_oil', name: 'Eugenia caryophyllus leaf/flower oil', cas: '8000-34-8' },
  { id: 'farnesol', name: 'Farnesol', cas: '4602-84-0' },
  { id: 'hexadecanolactone', name: 'Hexadecanolactone', cas: '109-29-5' },
  { id: 'hexamethylindanopyran', name: 'Hexamethylindanopyran', cas: '1222-05-5' },
  { id: 'hexyl_cinnamal', name: 'Hexyl cinnamaldehyde / Hexyl cinnamal', cas: '101-86-0' },
  { id: 'jasminum_extract', name: 'Jasminum grandiflorum / officinale extract/oil', cas: '84776-64-7; 90045-94-6; 8022-96-6' },
  { id: 'juniperus_virginiana_oil', name: 'Juniperus virginiana oil', cas: '8000-27-9; 85085-41-2' },
  { id: 'laurus_nobilis_fruit_oil', name: 'Laurus nobilis fruit oil', cas: '8007-48-5' },
  { id: 'laurus_nobilis_leaf_oil', name: 'Laurus nobilis leaf oil', cas: '8002-41-3' },
  { id: 'laurus_nobilis_seed_oil', name: 'Laurus nobilis seed oil', cas: '84603-73-6' },
  { id: 'lavandula_hybrida_oil', name: 'Lavandula hybrida oil/extract', cas: '91722-69-9' },
  { id: 'lavandula_officinalis_oil', name: 'Lavandula officinalis oil/extract', cas: '84776-65-8' },
  { id: 'lilial', name: 'Lilial / Butylphenyl methylpropional', cas: '80-54-6' },
  { id: 'linalool', name: 'Linalool', cas: '78-70-6' },
  { id: 'linalyl_acetate', name: 'Linalyl acetate', cas: '115-95-7' },
  { id: 'mentha_piperita_oil', name: 'Mentha piperita oil', cas: '8006-90-4; 84082-70-2' },
  { id: 'mentha_spicata_oil', name: 'Mentha spicata oil', cas: '84696-51-5' },
  { id: 'menthol', name: 'Menthol', cas: '1490-04-6; 89-78-1; 2216-51-5' },
  { id: 'methyl_salicylate', name: 'Methyl salicylate', cas: '119-36-8' },
  { id: 'narcissus_extract', name: 'Narcissus spp. extract/oil', cas: '90064-25-8' },
  { id: 'pelargonium_graveolens_oil', name: 'Pelargonium graveolens flower oil', cas: '90082-51-2; 8000-46-2' },
  { id: 'pinus_mugo_oil', name: 'Pinus mugo oil/extract', cas: '90082-72-7' },
  { id: 'pinus_pumila_oil', name: 'Pinus pumila oil/extract', cas: '97676-05-6' },
  { id: 'pogostemon_cablin_oil', name: 'Pogostemon cablin oil', cas: '8014-09-3; 84238-39-1' },
  { id: 'propylidene_phthalide', name: 'Propylidene phthalide', cas: '17369-59-4' },
  { id: 'rose_oil', name: 'Rose flower oil / Rosa spp. extract', cas: '8007-01-0; 93334-48-6; 84696-47-9' },
  { id: 'damascenone', name: 'Rose ketone-4 / Damascenone', cas: '23696-85-7' },
  { id: 'alpha_damascone', name: 'alpha-Damascone', cas: '43052-87-5; 23726-94-5' },
  { id: 'cis_beta_damascone', name: 'cis-beta-Damascone', cas: '23726-92-3' },
  { id: 'delta_damascone', name: 'delta-Damascone', cas: '57378-68-4' },
  { id: 'salicylaldehyde', name: 'Salicylaldehyde', cas: '90-02-8' },
  { id: 'santalum_album_oil', name: 'Santalum album oil', cas: '84787-70-2; 8006-87-9' },
  { id: 'alpha_santalol', name: 'alpha-Santalol', cas: '115-71-9' },
  { id: 'beta_santalol', name: 'beta-Santalol', cas: '77-42-9' },
  { id: 'sclareol', name: 'Sclareol', cas: '515-03-7' },
  { id: 'alpha_pinene', name: 'alpha-Pinene', cas: '80-56-8' },
  { id: 'beta_pinene', name: 'beta-Pinene', cas: '127-91-3' },
  { id: 'alpha_terpineol', name: 'alpha-Terpineol', cas: '10482-56-1; 98-55-5' },
  { id: 'terpineol_mixture', name: 'Terpineol, mixture of isomers', cas: '8000-41-7' },
  { id: 'terpinolene', name: 'Terpinolene', cas: '586-62-9' },
  { id: 'tetramethyl_acetyloctahydro_naphthalenes', name: 'Tetramethyl acetyloctahydro naphthalenes', cas: '54464-57-2; 54464-59-4; 68155-66-8; 68155-67-9' },
  { id: 'trans_anethole', name: 'trans-Anethole', cas: '4180-23-8' },
  { id: 'majantol', name: 'Trimethyl benzenepropanol / Majantol', cas: '103694-68-4' },
  { id: 'turpentine_oil', name: 'Turpentine oil', cas: '8006-64-2; 9005-90-7; 8052-14-0' },
  { id: 'vanillin', name: 'Vanillin', cas: '121-33-5' },
  { id: 'alpha_isomethyl_ionone', name: 'alpha-Isomethyl ionone', cas: '127-51-5' },
  { id: 'trimethyl_cyclopenten_pentenol', name: '3-methyl-5-(2,2,3-trimethyl-3-cyclopenten-1-yl)pent-4-en-2-ol', cas: '67801-20-1' },
  { id: 'dl_limonene', name: '(DL)-Limonene', cas: '138-86-3' },
];

export interface SelectedFragrance {
  id: string;
  name: string;
  cas: string;
  concentration_mg_kg?: number | '';
  component?: string;
  above_threshold?: boolean;
  supplier_declaration_uploaded?: boolean;
  test_report_uploaded?: boolean;
}

export function getFragranceById(id: string): ToyFragrance | undefined {
  return TOY_FRAGRANCES.find((f) => f.id === id);
}

export function generateAllergenDeclaration(
  hasAllergens: string | undefined,
  selected: SelectedFragrance[] = [],
): string {
  if (hasAllergens !== 'yes' || selected.length === 0) {
    return 'No allergenic fragrances subject to labelling requirements are declared as present at or above 10 mg/kg.';
  }
  const names = selected.map((s) => s.name).join(', ');
  return `The following allergenic fragrances subject to labelling requirements are present at or above 10 mg/kg: ${names}.`;
}
