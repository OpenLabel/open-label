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

export interface MaterialType {
  id: string;
  name: string;
  icon: string; // emoji as placeholder
}

export interface MaterialComposition {
  id: string;
  name: string;
  code: string;
  categoryId: string;
}

export interface DisposalMethod {
  id: string;
  name: string;
}

export const packagingMaterialTypes: MaterialType[] = [
  { id: 'bottle', name: 'Bottle', icon: '🍾' },
  { id: 'capsule', name: 'Capsule', icon: '⚫' },
  { id: 'cage', name: 'Cage', icon: '🔗' },
  { id: 'cork', name: 'Cork', icon: '🪵' },
  { id: 'cardboard', name: 'Cardboard', icon: '📦' },
  { id: 'bag', name: 'Bag', icon: '👜' },
  { id: 'tap', name: 'Tap', icon: '🚰' },
];

export const materialCompositions: MaterialComposition[] = [
  // Plastics (Individual Components)
  { id: 'pet_1', name: 'Polyethylene terephthalate', code: 'PET 1', categoryId: 'plastic' },
  { id: 'hdpe_2', name: 'High-density polyethylene', code: 'HDPE 2', categoryId: 'plastic' },
  { id: 'pvc_3', name: 'Polyvinyl chloride', code: 'PVC 3', categoryId: 'plastic' },
  { id: 'ldpe_4', name: 'Low-density polyethylene', code: 'LDPE 4', categoryId: 'plastic' },
  { id: 'pp_5', name: 'Polypropylene', code: 'PP 5', categoryId: 'plastic' },
  { id: 'ps_6', name: 'Polystyrene', code: 'PS 6', categoryId: 'plastic' },
  { id: 'o_7', name: 'Other plastics (polyamide, cellophane, etc.)', code: 'O 7', categoryId: 'plastic' },

  // Paper/Cardboard
  { id: 'pap_20', name: 'Corrugated cardboard', code: 'PAP 20', categoryId: 'paper' },
  { id: 'pap_21', name: 'Non-corrugated cardboard or sugarcane', code: 'PAP 21', categoryId: 'paper' },
  { id: 'pap_22', name: 'Paper', code: 'PAP 22', categoryId: 'paper' },

  // Metals
  { id: 'fe_40', name: 'Steel', code: 'FE 40', categoryId: 'metal' },
  { id: 'alu_41', name: 'Aluminum', code: 'ALU 41', categoryId: 'metal' },
  { id: 'tin_42', name: 'Tin', code: 'TIN 42', categoryId: 'metal' },

  // Wood/Cork
  { id: 'for_50', name: 'Wood', code: 'FOR 50', categoryId: 'wood' },
  { id: 'for_51', name: 'Cork', code: 'FOR 51', categoryId: 'wood' },

  // Textiles
  { id: 'tex_60', name: 'Cotton', code: 'TEX 60', categoryId: 'textile' },
  { id: 'tex_61', name: 'Jute', code: 'TEX 61', categoryId: 'textile' },
  { id: 'tex_62', name: 'Other textile materials', code: 'TEX 62', categoryId: 'textile' },

  // Glass
  { id: 'gl_70', name: 'Colorless glass', code: 'GL 70', categoryId: 'glass' },
  { id: 'gl_71', name: 'Green glass', code: 'GL 71', categoryId: 'glass' },
  { id: 'gl_72', name: 'Brown glass', code: 'GL 72', categoryId: 'glass' },
  { id: 'gl_73', name: 'Black glass', code: 'GL 73', categoryId: 'glass' },

  // Other Individual
  { id: 'wax_200301', name: 'Sealing wax', code: '20.03.01', categoryId: 'other' },

  // Composites - Paper/Cardboard based
  { id: 'c_80', name: 'Paper and cardboard/various metals', code: 'C/__80', categoryId: 'composite' },
  { id: 'c_81', name: 'Paper and cardboard/plastic', code: 'C/__81', categoryId: 'composite' },
  { id: 'c_82', name: 'Paper and cardboard/aluminum', code: 'C/__82', categoryId: 'composite' },
  { id: 'c_83', name: 'Paper and cardboard/tin', code: 'C/__83', categoryId: 'composite' },
  { id: 'c_84', name: 'Paper and cardboard/plastic/aluminum', code: 'C/__84', categoryId: 'composite' },
  { id: 'c_85', name: 'Paper and cardboard/plastic/aluminum/tin', code: 'C/__85', categoryId: 'composite' },

  // Composites - Wood based
  { id: 'c_86', name: 'Wood/plastic', code: 'C/__86', categoryId: 'composite' },

  // Composites - Plastic based
  { id: 'c_90', name: 'Plastic/aluminum', code: 'C/__90', categoryId: 'composite' },
  { id: 'c_91', name: 'Plastic/tin', code: 'C/__91', categoryId: 'composite' },
  { id: 'c_92', name: 'Plastic/various metals', code: 'C/__92', categoryId: 'composite' },

  // Composites - Glass based
  { id: 'c_95', name: 'Glass/plastic', code: 'C/__95', categoryId: 'composite' },
  { id: 'c_96', name: 'Glass/aluminum', code: 'C/__96', categoryId: 'composite' },
  { id: 'c_97', name: 'Glass/tin', code: 'C/__97', categoryId: 'composite' },
  { id: 'c_98', name: 'Glass/various metals', code: 'C/__98', categoryId: 'composite' },
];

export const materialCategories = [
  { id: 'individual', name: 'Individual Components', isHeader: true },
  { id: 'plastic', name: 'Plastics' },
  { id: 'paper', name: 'Paper/Cardboard' },
  { id: 'metal', name: 'Metals' },
  { id: 'wood', name: 'Wood/Cork' },
  { id: 'textile', name: 'Textiles' },
  { id: 'glass', name: 'Glass' },
  { id: 'other', name: 'Other' },
  { id: 'composite_header', name: 'Composite Components', isHeader: true },
  { id: 'composite', name: 'Composites' },
];

export const disposalMethods: DisposalMethod[] = [
  { id: 'plastic_collection', name: 'Plastic collection' },
  { id: 'dedicated_waste', name: 'Dedicated waste collection' },
  { id: 'paper_collection', name: 'Paper collection' },
  { id: 'steel_collection', name: 'Steel collection' },
  { id: 'glass_collection', name: 'Glass collection' },
  { id: 'residual_waste', name: 'Residual waste collection' },
  { id: 'organic_waste', name: 'Organic waste collection' },
  { id: 'textile_collection', name: 'Textile collection' },
];

export interface PackagingMaterial {
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
  isCustomComposition?: boolean;
  customCompositionName?: string;
  customCompositionCode?: string;
}

export const getCompositionsByCategory = () => {
  const categories = [
    { id: 'plastic', name: 'Plastics' },
    { id: 'paper', name: 'Paper/Cardboard' },
    { id: 'metal', name: 'Metals' },
    { id: 'wood', name: 'Wood/Cork' },
    { id: 'textile', name: 'Textiles' },
    { id: 'glass', name: 'Glass' },
    { id: 'other', name: 'Other' },
  ];

  const individualComponents = categories.map((cat) => ({
    ...cat,
    compositions: materialCompositions.filter((m) => m.categoryId === cat.id),
  })).filter(cat => cat.compositions.length > 0);

  const compositeComponents = [{
    id: 'composite',
    name: 'Composites',
    compositions: materialCompositions.filter((m) => m.categoryId === 'composite'),
  }];

  return {
    individual: individualComponents,
    composite: compositeComponents,
  };
};
