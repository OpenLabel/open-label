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
 * Fragrance allergens that must be labelled on detergents when intentionally
 * added above 0.01% by weight: Regulation (EU) 2026/405, Annex V Part A
 * point 1(h)(iv) and Part D (105 entries). Transcribed from the Official
 * Journal text. `ref` is the official reference number in Part D and is stable;
 * `id` follows the same readable snake_case pattern as toyFragrances.ts.
 * `name` is the Common Ingredients Glossary (INCI) name where Part D gives one,
 * otherwise the chemical name. Several entries cover more than one substance,
 * so `cas` and `ec` can list more than one number, separated by "; ".
 */

export interface DetergentFragrance {
  id: string;
  ref: number;
  name: string;
  chemical_name: string;
  cas: string;
  ec: string;
}

export const DETERGENT_FRAGRANCES: DetergentFragrance[] = [
  { id: 'benzyl_alcohol', ref: 1, name: 'Benzyl Alcohol', chemical_name: 'Benzyl alcohol', cas: '100-51-6', ec: '202-859-9' },
  { id: '6_methyl_coumarin', ref: 2, name: '6-Methyl Coumarin', chemical_name: '6-Methylcoumarin', cas: '92-48-8', ec: '202-158-8' },
  { id: 'amyl_cinnamal', ref: 3, name: 'Amyl cinnamal', chemical_name: '2-Benzylideneheptanal', cas: '122-40-7', ec: '204-541-5' },
  { id: 'cinnamyl_alcohol', ref: 4, name: 'Cinnamyl alcohol', chemical_name: 'Cinnamyl alcohol', cas: '104-54-1', ec: '203-212-3' },
  { id: 'citral', ref: 5, name: 'Citral; Geranial; Neral', chemical_name: '3,7-Dimethyl-2,6-octadienal; (E)-3,7-dimethylocta-2,6-dienal; (Z)-3,7-dimethylocta-2,6-dienal', cas: '5392-40-5; 141-27-5; 106-26-3', ec: '226-394-6; 205-476-5; 203-379-2' },
  { id: 'eugenol', ref: 6, name: 'Eugenol', chemical_name: 'Phenol, 2-methoxy-4-(2-propenyl)', cas: '97-53-0', ec: '202-589-1' },
  { id: 'hydroxycitronellal', ref: 7, name: 'Hydroxycitronellal', chemical_name: '7-Hydroxycitronellal', cas: '107-75-5', ec: '203-518-7' },
  { id: 'isoeugenol', ref: 8, name: 'Isoeugenol', chemical_name: 'Phenol, 2-methoxy-4-(1-propenyl); (E)-2-methoxy-4-(prop-1-enyl)phenol; (trans-Isoeugenol); (Z)-2-methoxy-4-(prop-1-enyl)phenol; (cis-Isoeugenol)', cas: '97-54-1; 5932-68-3; 5912-86-7', ec: '202-590-7; 227-678-2; 227-633-7' },
  { id: 'amylcinnamyl_alcohol', ref: 9, name: 'Amylcinnamyl alcohol', chemical_name: '2-Pentyl-3-phenylprop-2-en-1-ol', cas: '101-85-9', ec: '202-982-8' },
  { id: 'benzyl_salicylate', ref: 10, name: 'Benzyl salicylate', chemical_name: 'Benzyl salicylate', cas: '118-58-1', ec: '204-262-9' },
  { id: 'cinnamal', ref: 11, name: 'Cinnamal', chemical_name: '2-Propenal, 3-phenyl-', cas: '104-55-2', ec: '203-213-9' },
  { id: 'coumarin', ref: 12, name: 'Coumarin', chemical_name: '2H-1-Benzopyran-2-one', cas: '91-64-5', ec: '202-086-7' },
  { id: 'geraniol', ref: 13, name: 'Geraniol', chemical_name: '2,6-Octadien-1-ol, 3,7-dimethyl-, (2E)-', cas: '106-24-1', ec: '203-377-1' },
  { id: 'anise_alcohol', ref: 14, name: 'Anise alcohol', chemical_name: '4-Methoxybenzyl alcohol', cas: '105-13-5', ec: '203-273-6' },
  { id: 'benzyl_cinnamate', ref: 15, name: 'Benzyl cinnamate', chemical_name: '2-Propenoic acid, 3-phenyl-, phenylmethyl ester', cas: '103-41-3', ec: '203-109-3' },
  { id: 'farnesol', ref: 16, name: 'Farnesol', chemical_name: '2,6,10-Dodecatrien-1-ol, 3,7,11-trimethyl-', cas: '4602-84-0', ec: '225-004-1' },
  { id: 'linalool', ref: 17, name: 'Linalool', chemical_name: '1,6-Octadien-3-ol, 3,7-dimethyl-', cas: '78-70-6', ec: '201-134-4' },
  { id: 'benzyl_benzoate', ref: 18, name: 'Benzyl benzoate', chemical_name: 'Benzyl benzoate', cas: '120-51-4', ec: '204-402-9' },
  { id: 'citronellol', ref: 19, name: 'Citronellol', chemical_name: 'Citronellol/(±) 3,7-Dimethyl-6-octen-1-ol; (3R)-3,7-dimethyloct-6-en-1-ol; (3S)-3,7-dimethyloct-6-en-1-ol', cas: '106-22-9; 26489-01-0; 1117-61-9; 7540-51-4', ec: '203-375-0; 247-737-6; 214-250-5; 231-415-7' },
  { id: 'hexyl_cinnamal', ref: 20, name: 'Hexyl cinnamal', chemical_name: '2-Benzylideneoctanal', cas: '101-86-0', ec: '202-983-3' },
  { id: 'limonene', ref: 21, name: 'Limonene', chemical_name: '1-methyl-4-prop-1-en-2-yl-cyclohexene; dl-limonene (racemic); Dipentene; (R)-p-mentha-1,8-diene; (d-limonene); (S)-p-mentha-1,8-diene; (l-limonene)', cas: '138-86-3; 7705-14-8; 5989-27-5; 5989-54-8', ec: '205-341-0; 231-732-0; 227-813-5; 227-815-6' },
  { id: 'methyl_2_octynoate', ref: 22, name: 'Methyl 2-Octynoate', chemical_name: 'Methyl Oct-2-ynoate; Methyl heptine carbonate', cas: '111-12-6', ec: '203-836-6' },
  { id: 'alpha_isomethyl_ionone', ref: 23, name: 'alpha-Isomethyl ionone', chemical_name: '3-Methyl-4-(2,6,6-trimethyl-2-cyclohexen-1-yl)-3-buten-2-one', cas: '127-51-5', ec: '204-846-3' },
  { id: 'evernia_prunastri_extract', ref: 24, name: 'Evernia prunastri extract', chemical_name: 'Oak moss extract', cas: '90028-68-5', ec: '289-861-3' },
  { id: 'evernia_furfuracea_extract', ref: 25, name: 'Evernia furfuracea extract', chemical_name: 'Treemoss extract', cas: '90028-67-4', ec: '289-860-8' },
  { id: 'pinus_mugo_leaf_oil', ref: 26, name: 'Pinus Mugo Leaf Oil; Pinus Mugo Twig Leaf Extract; Pinus Mugo Twig Oil', chemical_name: 'Pinus mugo leaf and twig oil and extract', cas: '90082-72-7', ec: '290-163-6' },
  { id: 'pinus_pumila_needle_extract', ref: 27, name: 'Pinus Pumila Needle Extract; Pinus Pumila Twig Leaf Extract; Pinus Pumila Twig Leaf Oil', chemical_name: 'Pinus pumila leaf and twig oil and extract', cas: '97676-05-6', ec: '307-681-6' },
  { id: 'cedrus_atlantica_bark_extract', ref: 28, name: 'Cedrus Atlantica Bark Extract; Cedrus Atlantica Bark Oil; Cedrus Atlantica Bark Water; Cedrus Atlantica Leaf Extract; Cedrus Atlantica Wood Extract; Cedrus Atlantica Wood Oil', chemical_name: 'Cedrus atlantica oil and extract', cas: '92201-55-3; 8023-85-6', ec: '295-985-9' },
  { id: 'turpentine', ref: 29, name: 'Turpentine', chemical_name: 'Turpentine gum (Pinus spp.); Turpentine oil and rectified oil; Turpentine, steam distilled (Pinus spp.)', cas: '9005-90-7; 8006-64-2; 8052-14-0', ec: '232-688-5; 232-350-7' },
  { id: 'alpha_terpinene', ref: 30, name: 'Alpha-Terpinene', chemical_name: 'p-Mentha-1,3-diene', cas: '99-86-5', ec: '202-795-1' },
  { id: 'terpinolene', ref: 31, name: 'Terpinolene', chemical_name: 'p-Mentha-1,4(8)-diene', cas: '586-62-9', ec: '209-578-0' },
  { id: 'myroxylon_balsamum_pereirae_balsam_extract', ref: 32, name: 'Myroxylon Balsamum Pereirae Balsam Extract; Myroxylon Balsamum Pereirae Balsam Oil; Myroxylon Pereirae Oil; Myroxylon Pereirae Resin Extract; Myroxylon Pereirae Resin', chemical_name: 'Myroxylon balsamum var. pereirae; extracts and distillates; Balsam Peru oil, absolute and anhydrol (Balsam Oil Peru); Exudation of Myroxylon pereirae (Royle) Klotzsch (Peru balsam, crude)', cas: '8007-00-9', ec: '232-352-8' },
  { id: 'alpha_damascone', ref: 33, name: 'Alpha-Damascone; cis-Rose ketone 1; trans-Rose ketone 1; Rose ketone 4 (Damascone); Rose ketone 3 (delta-Damascone); trans-Rose ketone 3; cis-Rose ketone 2 (cis-beta-Damascone); trans-Rose ketone 2 (trans-beta-Damascone)', chemical_name: '1-(2,6,6-trimethyl-2-cyclohexen-1-yl)-2-buten-1-one; 1-(2,6,6-Trimethylcyclohexa-1,3-dien-1-yl)-2-buten-1-one; 1-(2,6,6-Trimethyl-3-cyclohexen-1-yl)-2-buten-1-one; (Z)-1-(2,6,6-trimethyl-1-cyclohexen-1-yl)-2-buten-1-one; (E)-1-(2,6,6-Trimethyl-1-cyclohexen-1-yl)-2-buten-1-one', cas: '43052-87-5; 23726-94-5; 24720-09-0; 23696-85-7; 57378-68-4; 71048-82-3; 23726-92-3; 23726-91-2', ec: '245-845-8; 246-430-4; 245-833-2; 260-709-8; 275-156-8; 245-843-7; 245-842-1' },
  { id: '3_propylidenephthalide', ref: 34, name: '3-Propylidenephthalide', chemical_name: '3-Propylidene-1(3H)-isobenzofuranone; 3-Propylidenephthalide', cas: '17369-59-4', ec: '241-402-8' },
  { id: 'lippia_citriodora_absolute', ref: 35, name: 'Lippia citriodora absolute', chemical_name: 'Verbena absolute', cas: '8024-12-2; 85116-63-8', ec: '285-515-0' },
  { id: 'lippia_citriodora_leaf', ref: 36, name: 'Lippia citriodora leaf; Lippia citriodora flower oil; Lippia citriodora oil', chemical_name: 'Verbena essential oils (Lippia citriodora Kunth.) and derivatives other than absolute', cas: '8024-12-2', ec: '285-515-0' },
  { id: 'methyl_salicylate', ref: 37, name: 'Methyl Salicylate', chemical_name: 'Methyl 2-hydroxybenzoate', cas: '119-36-8', ec: '204-317-7' },
  { id: 'acetyl_cedrene', ref: 38, name: 'Acetyl Cedrene', chemical_name: '[3R-(3α,3aβ,7β,8aα)]-1-(2,3,4,7,8,8a-hexahydro-3,6,8,8-tetramethyl-1H-3a,7-methanoazulen-5-yl)ethan-1-one', cas: '32388-55-9', ec: '251-020-3' },
  { id: 'amyl_salicylate', ref: 39, name: 'Amyl Salicylate', chemical_name: 'Pentyl-2-hydroxy-benzoate', cas: '2050-08-0', ec: '218-080-2' },
  { id: 'anethole', ref: 40, name: 'Anethole', chemical_name: '1-Methoxy-4-(1E)-1-propen-1-yl-benzene (trans-Anethole)', cas: '104-46-1; 4180-23-8', ec: '203-205-5; 224-052-0' },
  { id: 'benzaldehyde', ref: 41, name: 'Benzaldehyde', chemical_name: 'Benzaldehyde', cas: '100-52-7', ec: '202-860-4' },
  { id: 'camphor', ref: 42, name: 'Camphor', chemical_name: 'Bornan-2-one; 1,7,7-Trimethylbi-cyclo[2.2.1]-2-heptanone', cas: '76-22-2; 21368-68-3; 464-49-3; 464-48-2', ec: '200-945-0; 244-350-4; 207-355-2; 207-354-7' },
  { id: 'beta_caryophyllene', ref: 43, name: 'Beta-Caryophyllene', chemical_name: '(1R,4E,9S)-4,11,11-Trimethyl-8-methylenebicyclo[7.2.0]undec-4-ene', cas: '87-44-5', ec: '201-746-1' },
  { id: 'carvone', ref: 44, name: 'Carvone', chemical_name: '2-methyl-5-(prop-1-en-2-yl)cyclohex-2-en-1-one;(5R)-2-Methyl-5-prop-1-en-2-ylcyclohex-2-en-1-one;(5S)-2-Methyl-5-prop-1-en-2-ylcyclohex-2-en-1-one', cas: '99-49-0; 6485-40-1; 2244-16-8', ec: '202-759-5; 229-352-5; 218-827-2' },
  { id: 'dimethyl_phenethyl_acetate', ref: 45, name: 'Dimethyl Phenethyl Acetate', chemical_name: '2-Methyl-1-phenyl-2-propyl acetate; Dimethylbenzyl Carbinyl Acetate', cas: '151-05-3', ec: '205-781-3' },
  { id: 'hexadecanolactone', ref: 46, name: 'Hexadecanolactone', chemical_name: 'Oxacyclohepta-decan-2-one', cas: '109-29-5', ec: '203-662-0' },
  { id: 'hexamethylindanopyran', ref: 47, name: 'Hexamethylindanopyran', chemical_name: '1,3,4,6,7,8-Hexahydro-4,6,6,7,8,8-hexamethylcyclopenta-γ-2-benzopyran', cas: '1222-05-5', ec: '214-946-9' },
  { id: 'linalyl_acetate', ref: 48, name: 'Linalyl Acetate', chemical_name: '3,7-Dimethyl octa-1,6-diene-3-yl acetate', cas: '115-95-7', ec: '204-116-4' },
  { id: 'menthol', ref: 49, name: 'Menthol', chemical_name: 'Menthol; dl-menthol; l-menthol; d-menthol', cas: '89-78-1; 1490-04-6; 2216-51-5; 15356-60-2', ec: '201-939-0; 216-074-4; 218-690-9; 239-387-8' },
  { id: 'trimethylcyclopentenyl_methylisopentenol', ref: 50, name: 'Trimethylcyclopentenyl Methylisopentenol', chemical_name: '3-Methyl-5-(2,2,3-Trimethyl-3-Cyclopentenyl)pent-4-en-2-ol', cas: '67801-20-1', ec: '267-140-4' },
  { id: 'salicylaldehyde', ref: 51, name: 'Salicylaldehyde', chemical_name: 'o-Hydroxy-benzaldehyde', cas: '90-02-8', ec: '201-961-0' },
  { id: 'santalol', ref: 52, name: 'Santalol', chemical_name: '5-(2,3-Dimethyl-tricyclo[2.2.1.02,6]-hept-3-yl)-2-methylpent-2-en-1-ol (alpha-Santalol); (1S-(1a,2a(Z),4a))-2-Methyl-5-(2-methyl-3-methylenebicyclo[2.2.1]hept-2-yl)-2-penten-1-ol (beta-Santalol)', cas: '11031-45-1; 115-71-9; 77-42-9', ec: '234-262-4; 204-102-8; 201-027-2' },
  { id: 'sclareol', ref: 53, name: 'Sclareol', chemical_name: '[1R-(1alpha)]-alpha-Ethenyldecahydro-2-hydroxy-a,2,5,5,8a-pentamethyl-1-naphthalenepropanol', cas: '515-03-7', ec: '208-194-0' },
  { id: 'terpineol', ref: 54, name: 'Terpineol', chemical_name: '2-(4-methylcyclohex-3-en-1-yl)propan-2-ol; p-Menth-1-en-8-ol (alpha-Terpineol); 1-methyl-4-(1-methylvinyl)cyclohexan-1-ol (beta-Terpineol); 1-methyl-4-(1-methylethylidene)cyclohexan-1-ol (gamma-Terpineol)', cas: '8000-41-7; 98-55-5; 138-87-4; 586-81-2', ec: '232-268-1; 202-680-6; 205-342-6; 209-584-3' },
  { id: 'tetramethyl_acetyloctahydronaphthalenes', ref: 55, name: 'Tetramethyl acetyloctahydronaphthalenes', chemical_name: '1-(1,2,3,4,5,6,7,8-octahydro-2,3,8,8-tetramethyl-2-naphthyl)ethan-1-one; 1-(1,2,3,4,5,6,7,8-octahydro-2,3,5,5-tetramethyl-2-naphthyl)ethan-1-one; 1-(1,2,3,5,6,7,8,8a-octahydro-2,3,8,8-tetramethyl-2-naphthyl)ethan-1-one; 1-(1,2,3,4,6,7,8,8a-octahydro-2,3,8,8-tetramethyl-2-naphthyl)ethan-1-one', cas: '54464-57-2; 54464-59-4; 68155-66-8; 68155-67-9', ec: '259-174-3; 259-175-9; 268-978-3; 268-979-9' },
  { id: 'trimethylbenzenepropanol', ref: 56, name: 'Trimethylbenzenepropanol', chemical_name: '3-(2,2-Dimethyl-3-hydroxypropyl)toluene', cas: '103694-68-4', ec: '403-140-4' },
  { id: 'vanillin', ref: 57, name: 'Vanillin', chemical_name: '4-Hydroxy-3-methoxybenz-aldehyde', cas: '121-33-5', ec: '204-465-2' },
  { id: 'cananga_odorata_flower_extract', ref: 58, name: 'Cananga Odorata Flower Extract; Cananga Odorata Flower Oil', chemical_name: 'Cananga odorata flower oil and extract; Ylang Ylang flower oil and extract', cas: '83863-30-3; 8006-81-3; 68606-83-7; 93686-30-7', ec: '281-092-1; 297-681-1' },
  { id: 'cinnamomum_cassia_leaf_oil', ref: 59, name: 'Cinnamomum Cassia Leaf Oil', chemical_name: 'Cinnamomum cassia leaf Oil', cas: '8007-80-5; 84961-46-6', ec: '284-635-0' },
  { id: 'cinnamomum_zeylanicum_bark_oil', ref: 60, name: 'Cinnamomum Zeylanicum Bark Oil', chemical_name: 'Cinnamomum zeylanicum bark oil', cas: '8015-91-6; 84649-98-9', ec: '283-479-0' },
  { id: 'citrus_aurantium_amara_flower_oil', ref: 61, name: 'Citrus Aurantium Amara Flower Oil; Citrus Aurantium Dulcis Flower Oil', chemical_name: 'Citrus aurantium amara and dulcis flower oil', cas: '72968-50-4; 8028-48-6; 8016-38-4', ec: '277-143-2; 232-433-8' },
  { id: 'citrus_aurantium_amara_peel_oil', ref: 62, name: 'Citrus Aurantium Amara Peel Oil; Citrus Aurantium Dulcis Peel Oil; Citrus Sinensis Peel Oil', chemical_name: 'Citrus aurantium amara and dulcis peel oil', cas: '68916-04-1; 72968-50-4; 97766-30-8; 8028-48-6; 8008-57-9', ec: '277-143-2; 307-891-8; 232-433-8' },
  { id: 'citrus_aurantium_bergamia_peel_oil', ref: 63, name: 'Citrus Aurantium Bergamia Peel Oil', chemical_name: 'Citrus aurantium bergamia oil (Bergamot oil)', cas: '8007-75-8; 89957-91-5; 68648-33-9; 85049-52-1', ec: '616-915-9; 289-612-9' },
  { id: 'citrus_limon_peel_oil', ref: 64, name: 'Citrus Limon Peel Oil', chemical_name: 'Citrus limon oil', cas: '84929-31-7; 8008-56-8', ec: '284-515-8' },
  { id: 'cymbopogon_schoenanthus_oil', ref: 65, name: 'Cymbopogon Schoenanthus Oil; Cymbopogon Flexuosus Oil; Cymbopogon Citratus Leaf Oil', chemical_name: 'Cymbopogon citratus /schoenanthus/flexuosus oils', cas: '8007-02-1; 89998-16-3; 91844-92-7', ec: '289-754-1; 295-161-9' },
  { id: 'eucalyptus_globulus_leaf_oil', ref: 66, name: 'Eucalyptus Globulus Leaf Oil; Eucalyptus Globulus Leaf/Twig Oil', chemical_name: 'Eucalyptus globulus oil', cas: '97926-40-4; 8000-48-4', ec: '308-257-3; 616-775-9' },
  { id: 'eugenia_caryophyllus_leaf_oil', ref: 67, name: 'Eugenia Caryophyllus Leaf Oil; Eugenia Caryophyllus Flower Oil; Eugenia Caryophyllus Stem oil; Eugenia Caryophyllus Bud oil', chemical_name: 'Eugenia caryophyllus oil', cas: '8000-34-8; 8015-97-2; 84961-50-2', ec: '616-772-2; 284-638-7' },
  { id: 'jasminum_grandiflorum_flower_extract', ref: 68, name: 'Jasminum Grandiflorum Flower Extract; Jasminum Officinale Oil; Jasminum Officinale Flower Extract', chemical_name: 'Jasminum grandiflorum /officinale oil and extract', cas: '84776-64-7; 90045-94-6; 8022-96-6; 8024-43-9', ec: '283-993-5; 289-960-1' },
  { id: 'juniperus_virginiana_oil', ref: 69, name: 'Juniperus Virginiana Oil; Juniperus Virginiana Wood Oil', chemical_name: 'Juniperus virginiana oil', cas: '8000-27-9; 85085-41-2', ec: '285-370-3' },
  { id: 'laurus_nobilis_leaf_oil', ref: 70, name: 'Laurus Nobilis Leaf Oil', chemical_name: 'Laurus nobilis oil', cas: '8002-41-3; 8007-48-5; 84603-73-6', ec: '283-272-5' },
  { id: 'lavandula_hybrida_oil', ref: 71, name: 'Lavandula Hybrida Oil; Lavandula Hybrida Extract; Lavandula Hybrida Flower Extract; Lavandula Intermedia Flower/Leaf/Stem Extract; Lavandula Intermedia Flower/Leaf/Stem Oil; Lavandula Intermedia Oil; Lavandula Angustifolia Oil; Lavandula Angustifolia Flower/Leaf/Stem Extract', chemical_name: 'Lavandula hybrida oil/extract; Lavandula intermedia oil/extract; Lavandula angustifolia oil/extract', cas: '91722-69-9; 8022-15-9; 93455-96-0; 93455-97-1; 92623-76-2; 84776-65-8; 8000-28-0; 90063-37-9', ec: '294-470-6; 296-408-3; 283-994-0; 289-995-2' },
  { id: 'mentha_piperita_oil', ref: 72, name: 'Mentha Piperita Oil', chemical_name: 'Mentha piperita oil', cas: '8006-90-4; 84082-70-2', ec: '282-015-4' },
  { id: 'mentha_viridis_leaf_oil', ref: 73, name: 'Mentha Viridis Leaf Oil', chemical_name: 'Mentha spicata oil (spearmint oil)', cas: '8008-79-5; 84696-51-5', ec: '616-927-4; 283-656-2' },
  { id: 'narcissus_poeticus_extract', ref: 74, name: 'Narcissus Poeticus Extract; Narcissus Pseudonarcissus Flower Extract; Narcissus Jonquilla Extract; Narcissus Tazetta Extract', chemical_name: 'Narcissus poeticus/pseudonarcissus/jonquilla/tazetta extract', cas: '90064-26-9; 68917-12-4; 90064-27-0; 90064-25-8', ec: '290-087-3; 290-088-9; 290-086-8' },
  { id: 'pelargonium_graveolens_flower_oil', ref: 75, name: 'Pelargonium Graveolens Flower Oil', chemical_name: 'Pelargonium graveolens oil', cas: '90082-51-2; 8000-46-2', ec: '290-140-0' },
  { id: 'pogostemon_cablin_oil', ref: 76, name: 'Pogostemon Cablin Oil', chemical_name: 'Pogostemon cablin oil', cas: '8014-09-3; 84238-39-1', ec: '282-493-4' },
  { id: 'rosa_damascena_flower_oil', ref: 77, name: 'Rosa Damascena Flower Oil; Rosa Damascena Flower Extract; Rosa Alba Flower Oil; Rosa Alba Flower Extract; Rosa Canina Flower Oil; Rosa Centifolia Flower Oil; Rosa Centifolia Flower Extract; Rosa Gallica Flower Oil; Rosa Moschata Flower Oil; Rosa Rugosa Flower Oil', chemical_name: 'Rosa damascena flower oil/extract; Rosa alba flower oil/extract; Rosa canina flower oil; Rosa centifolia oil/extract; Rosa gallica flower oil; Rosa moschata flower oil; Rosa rugosa flower oil', cas: '8007-01-0; 90106-38-0; 93334-48-6; 84696-47-9; 84604-12-6; 84604-13-7; 92347-25-6', ec: '290-260-3; 297-122-1; 283-652-0; 283-289-8; 283-290-3; 296-213-3' },
  { id: 'santalum_album_oil', ref: 78, name: 'Santalum Album Oil', chemical_name: 'Santalum album oil', cas: '8006-87-9; 84787-70-2', ec: '284-111-1' },
  { id: 'eugenyl_acetate', ref: 79, name: 'Eugenyl Acetate', chemical_name: 'Phenol, 2-methoxy-4-(2-propenyl)-, acetate', cas: '93-28-7', ec: '202-235-6' },
  { id: 'geranyl_acetate', ref: 80, name: 'Geranyl Acetate', chemical_name: '2,6-Octadien-1-ol, 3,7-dimethyl-,1-acetate, (2E)-', cas: '105-87-3', ec: '203-341-5' },
  { id: 'isoeugenyl_acetate', ref: 81, name: 'Isoeugenyl Acetate', chemical_name: '2-Methoxy-4-prop-1-enylphenyl acetate', cas: '93-29-8', ec: '202-236-1' },
  { id: 'pinene', ref: 82, name: 'Pinene', chemical_name: '2,6,6-Trimethylbi-cyclo[3.1.1]hept-2-ene (alpha-Pinene); 6,6-Dimethyl- 2-methylenebicyclo[3.1.1]heptane (beta-Pinene)', cas: '80-56-8; 7785-70-8; 127-91-3; 18172-67-3', ec: '201-291-9; 232-087-8; 204-872-5; 242-060-2' },
  { id: 'allyl_isothiocyanate', ref: 83, name: 'Allyl isothiocyanate', chemical_name: 'Allyl isothiocyanate', cas: '57-06-7', ec: '200-309-2' },
  { id: '4_benzyloxyphenol_and_4_ethoxyphenol', ref: 84, name: '4-Benzyloxyphenol and 4-ethoxyphenol', chemical_name: '4-Benzyloxyphenol and 4-ethoxyphenol', cas: '103-16-2; 622-62-8', ec: '203-083-3; 210-748-1' },
  { id: 'benzylidene_acetone', ref: 85, name: '4-Phenylbut-3-en-2-one (Benzylidene acetone)', chemical_name: '4-Phenylbut-3-en-2-one (Benzylidene acetone)', cas: '122-57-6', ec: '204-555-1' },
  { id: 'cyclamen_alcohol', ref: 86, name: 'Cyclamen alcohol', chemical_name: 'Cyclamen alcohol', cas: '4756-19-8', ec: '225-289-2' },
  { id: 'diethyl_maleate', ref: 87, name: 'Diethyl maleate', chemical_name: 'Diethyl maleate', cas: '141-05-9', ec: '205-451-9' },
  { id: 'dihydrocoumarin', ref: 88, name: 'Dihydrocoumarin', chemical_name: '3,4-Dihydrocoumarin', cas: '119-84-6', ec: '204-354-9' },
  { id: 'pseudomethylionone', ref: 89, name: 'Pseudomethylionone', chemical_name: '7,11-Dimethyl-4,6,10-dodecatrien-3-one', cas: '26651-96-7', ec: '247-878-3' },
  { id: 'pseudoionone', ref: 90, name: 'Pseudoionone', chemical_name: '6,10-Dimethyl-3,5,9-undecatrien-2-one', cas: '141-10-6', ec: '205-457-1' },
  { id: 'ethyl_acrylate', ref: 91, name: 'Ethyl acrylate', chemical_name: 'Ethyl acrylate', cas: '140-88-5', ec: '205-438-8' },
  { id: 'ficus_carica_extract', ref: 92, name: 'Ficus carica extract', chemical_name: 'Fig leaf absolute (Ficus carica L.)', cas: '68916-52-9', ec: '' },
  { id: 'trans_2_heptenal', ref: 93, name: 'trans-2-Heptenal', chemical_name: 'trans-2-Heptenal', cas: '18829-55-5', ec: '242-608-0' },
  { id: 'trans_2_hexenal_diethyl_acetal', ref: 94, name: 'trans-2-Hexenal diethyl acetal', chemical_name: 'trans-2-Hexenal diethyl acetal', cas: '67746-30-9', ec: '266-989-8' },
  { id: 'trans_2_hexenal_dimethyl_acetal', ref: 95, name: 'trans-2-Hexenal dimethyl acetal', chemical_name: 'trans-2-Hexenal dimethyl acetal', cas: '18318-83-7', ec: '242-204-4' },
  { id: 'hydroabietyl_alcohol', ref: 96, name: 'Hydroabietyl alcohol', chemical_name: 'Hydroabietyl alcohol', cas: '13393-93-6', ec: '236-476-3' },
  { id: 'methylanisylideneacetone', ref: 97, name: '1-(4-Methoxyphenyl)-1-penten-3-one (alpha-Methylanisylideneacetone)', chemical_name: '1-(4-Methoxyphenyl)-1-penten-3-one (alpha-Methylanisylideneacetone)', cas: '104-27-8', ec: '203-190-5' },
  { id: 'acetyl_isovaleryl', ref: 98, name: '5-Methyl-2,3-hexanedione (Acetyl isovaleryl)', chemical_name: '5-Methyl-2,3-hexanedione (Acetyl isovaleryl)', cas: '13706-86-0', ec: '237-241-8' },
  { id: 'pseudo_isomethyl_ionone', ref: 99, name: '3,6,10-Trimethyl-3,5,9-undecatrien-2-one (Pseudo- Isomethyl ionone)', chemical_name: '3,6,10-Trimethyl-3,5,9-undecatrien-2-one (Pseudo- Isomethyl ionone)', cas: '1117-41-5', ec: '214-245-8' },
  { id: '7_ethoxy_4_methylcoumarin', ref: 100, name: '7-Ethoxy-4-methylcoumarin', chemical_name: '7-Ethoxy-4-methylcoumarin', cas: '87-05-8', ec: '201-721-5' },
  { id: 'hexahydrocoumarin', ref: 101, name: 'Hexahydrocoumarin', chemical_name: 'Hexahydrocoumarin', cas: '700-82-3', ec: '211-851-4' },
  { id: 'hicc', ref: 102, name: '3- and 4-(4-Hydroxy-4-methylpentyl) cyclohex-3-ene-1-carbaldehyde (HICC)', chemical_name: '3- and 4-(4-Hydroxy-4-methylpentyl) cyclohex-3-ene-1-carbaldehyde (HICC)', cas: '51414-25-6; 31906-04-4', ec: '257-187-9; 250-863-4' },
  { id: 'atranol', ref: 103, name: '2,6-Dihydroxy-4-methyl-benzaldehyde (atranol)', chemical_name: '2,6-Dihydroxy-4-methyl-benzaldehyde (atranol)', cas: '526-37-4', ec: '' },
  { id: 'chloroatranol', ref: 104, name: '3-Chloro-2,6-Dihydroxy-4-methyl-benzaldehyde (chloroatranol)', chemical_name: '3-Chloro-2,6-Dihydroxy-4-methyl-benzaldehyde (chloroatranol)', cas: '57074-21-2', ec: '' },
  { id: 'tert_butylbenzyl_propionaldehyde', ref: 105, name: '2-(4-tert-butylbenzyl) propionaldehyde', chemical_name: '2-(4-tert-butylbenzyl) propionaldehyde', cas: '80-54-6', ec: '201-289-8' },
];

export interface SelectedDetergentFragrance {
  id: string;
  name: string;
  cas: string;
}

export function getDetergentFragranceById(id: string): DetergentFragrance | undefined {
  return DETERGENT_FRAGRANCES.find((f) => f.id === id);
}

/**
 * English text of the allergen picker (src/components/detergents/DetergentAllergenPicker.tsx).
 * The translation keys are `detergents.allergenPicker.<name>`; the locale seed script reads this.
 */
export const DETERGENT_ALLERGEN_PICKER_COPY = {
  empty: 'No allergens added yet.',
  summary: '{{count}} allergen(s) declared.',
  addButton: 'Add allergen',
  dialogTitle: 'Select fragrance allergens',
  searchPlaceholder: 'Search by name, CAS, EC or number...',
  clearSearch: 'Clear search',
  noResults: 'No allergens match "{{q}}".',
  done: 'Done',
  cas: 'CAS',
  removeAria: 'Remove {{name}}',
} as const;
