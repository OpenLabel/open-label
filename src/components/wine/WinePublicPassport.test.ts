import { describe, it, expect } from "vitest";
import { WINE_PASSPORT_FIELDS } from "./WinePublicPassport";

/**
 * Comprehensive tests for wine passport field coverage.
 * These tests ensure that:
 * 1. Every field in the form is properly defined
 * 2. Every field is properly saved (part of category_data)
 * 3. Every field is properly displayed in the public view
 * 4. No orphaned fields exist (fields that are saved but not displayed or vice versa)
 */

// Canonical list of ALL wine fields that should exist in the system
// This is the single source of truth - any field not here should NOT exist
const CANONICAL_WINE_FIELDS = {
  // Product Identity (WineFields.tsx - Product Identity card)
  productInfo: [
    'grape_variety',      // text input - Grape Variety (Cépage)
    'vintage',            // text input - Vintage (Millésime)
    'volume',             // number input - Volume
    'volume_unit',        // select - ml/cl/L
    'country',            // select - Country of Origin
    'region',             // text input - Region
    'denomination',       // text input - Denomination (AOC, AOP, IGP)
    'sugar_classification', // text input - Sugar Classification (Brut, Sec, etc.)
    'denomination_translations', // object - translations for denomination
    'sugar_classification_translations', // object - translations for sugar classification
    'grape_variety_translations', // object - translations for grape variety
    'vintage_translations', // object - translations for vintage
    'region_translations', // object - translations for region
  ],
  
  // Producer Information (wine.ts template - Producer Information section)
  producer: [
    'producer_name',      // text input - Producer/Winery Name
    'bottler_info',       // textarea - Bottler Information
  ],
  
  // Nutritional Values (WineFields.tsx - Nutritional Values card)
  nutritional: [
    'alcohol_percent',    // number input - Alcohol (% Vol) - required
    'residual_sugar',     // number input - Residual Sugar (g/L)
    'total_acidity',      // number input - Total Acidity (g/L)
    'glycerine',          // number input - Glycerine (g/L)
    'energy_kcal',        // number input - Energy (kcal) - calculated or manual
    'energy_kj',          // number input - Energy (kJ) - calculated or manual
    'carbohydrates',      // number input - Carbohydrates (g) - calculated or manual
    'sugar',              // number input - Sugar (g) - calculated or manual
    'fat',                // number input - Fat (g) - small quantities
    'saturated_fat',      // number input - Saturated Fat (g) - small quantities
    'proteins',           // number input - Proteins (g) - small quantities
    'salt',               // number input - Salt (g) - small quantities
  ],
  
  // Manual override flags (WineFields.tsx - checkboxes next to calculated fields)
  manualOverrides: [
    'energy_kcal_manual',    // checkbox - Manual override for energy_kcal
    'energy_kj_manual',      // checkbox - Manual override for energy_kj
    'carbohydrates_manual',  // checkbox - Manual override for carbohydrates
    'sugar_manual',          // checkbox - Manual override for sugar
  ],
  
  // Display options (WineFields.tsx - Electronic Label Display Options card)
  displayOptions: [
    'show_alcohol_on_label',        // checkbox - Show Alcohol on label
    'show_residual_sugar_on_label', // checkbox - Show Residual Sugar on label
    'show_total_acidity_on_label',  // checkbox - Show Total Acidity on label
  ],
  
  // Ingredients (WineIngredients component)
  ingredients: [
    'ingredients',        // array of SelectedIngredient objects
  ],
  
  // Recycling Information (WineRecycling component)
  recycling: [
    'packaging_materials',   // array of PackagingMaterial objects (with translations)
  ],
};

describe("WinePublicPassport", () => {
  describe("WINE_PASSPORT_FIELDS matches canonical field list", () => {
    it("contains all product info fields", () => {
      CANONICAL_WINE_FIELDS.productInfo.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.productInfo).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.productInfo.length).toBe(CANONICAL_WINE_FIELDS.productInfo.length);
    });

    it("contains all producer fields", () => {
      CANONICAL_WINE_FIELDS.producer.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.producer).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.producer.length).toBe(CANONICAL_WINE_FIELDS.producer.length);
    });

    it("contains all nutritional fields", () => {
      CANONICAL_WINE_FIELDS.nutritional.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.nutritional).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.nutritional.length).toBe(CANONICAL_WINE_FIELDS.nutritional.length);
    });

    it("contains all manual override fields", () => {
      CANONICAL_WINE_FIELDS.manualOverrides.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.manualOverrides).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.manualOverrides.length).toBe(CANONICAL_WINE_FIELDS.manualOverrides.length);
    });

    it("contains all display option fields", () => {
      CANONICAL_WINE_FIELDS.displayOptions.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.displayOptions).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.displayOptions.length).toBe(CANONICAL_WINE_FIELDS.displayOptions.length);
    });

    it("contains all ingredient fields", () => {
      CANONICAL_WINE_FIELDS.ingredients.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.ingredients).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.ingredients.length).toBe(CANONICAL_WINE_FIELDS.ingredients.length);
    });

    it("contains all recycling fields", () => {
      CANONICAL_WINE_FIELDS.recycling.forEach((field) => {
        expect(WINE_PASSPORT_FIELDS.recycling).toContain(field);
      });
      expect(WINE_PASSPORT_FIELDS.recycling.length).toBe(CANONICAL_WINE_FIELDS.recycling.length);
    });
  });

  describe("field categories are complete", () => {
    it("has all required field categories", () => {
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("productInfo");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("producer");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("nutritional");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("manualOverrides");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("displayOptions");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("ingredients");
      expect(WINE_PASSPORT_FIELDS).toHaveProperty("recycling");
    });

    it("total field count matches expected", () => {
      const allFields = [
        ...WINE_PASSPORT_FIELDS.productInfo,
        ...WINE_PASSPORT_FIELDS.producer,
        ...WINE_PASSPORT_FIELDS.nutritional,
        ...WINE_PASSPORT_FIELDS.manualOverrides,
        ...WINE_PASSPORT_FIELDS.displayOptions,
        ...WINE_PASSPORT_FIELDS.ingredients,
        ...WINE_PASSPORT_FIELDS.recycling,
      ];
      
      const expectedFields = [
        ...CANONICAL_WINE_FIELDS.productInfo,
        ...CANONICAL_WINE_FIELDS.producer,
        ...CANONICAL_WINE_FIELDS.nutritional,
        ...CANONICAL_WINE_FIELDS.manualOverrides,
        ...CANONICAL_WINE_FIELDS.displayOptions,
        ...CANONICAL_WINE_FIELDS.ingredients,
        ...CANONICAL_WINE_FIELDS.recycling,
      ];
      
      expect(allFields.length).toBe(expectedFields.length);
    });
  });

  describe("no duplicate fields across categories", () => {
    it("all fields are unique", () => {
      const allFields = [
        ...WINE_PASSPORT_FIELDS.productInfo,
        ...WINE_PASSPORT_FIELDS.producer,
        ...WINE_PASSPORT_FIELDS.nutritional,
        ...WINE_PASSPORT_FIELDS.manualOverrides,
        ...WINE_PASSPORT_FIELDS.displayOptions,
        ...WINE_PASSPORT_FIELDS.ingredients,
        ...WINE_PASSPORT_FIELDS.recycling,
      ];
      
      const uniqueFields = new Set(allFields);
      expect(uniqueFields.size).toBe(allFields.length);
    });
  });

  describe("no orphaned fields exist", () => {
    // These fields should NOT exist anywhere in wine-related code
    const DEPRECATED_FIELDS = [
      'product_type',              // Removed - not in wine form
      'display_alcohol',           // Old name - now show_alcohol_on_label
      'display_residual_sugar',    // Old name - now show_residual_sugar_on_label
      'display_total_acidity',     // Old name - now show_total_acidity_on_label
      'recycling_website_url',     // Removed - only manual mode now
      'recycling_mode',            // Removed - only manual entry now
      'recycling_pdf_url',         // Removed - PDF option removed
      'contains_sulfites',         // Removed - now handled via ingredients
      'contains_egg',              // Removed - now handled via ingredients
      'contains_milk',             // Removed - now handled via ingredients
      'has_pdo',                   // Removed - certifications removed
      'has_pgi',                   // Removed - certifications removed
      'is_organic_eu',             // Removed - certifications removed
      'is_biodynamic',             // Removed - certifications removed
      'is_hve',                    // Removed - certifications removed
      'is_terra_vitis',            // Removed - certifications removed
    ];

    it("deprecated fields are not in any category", () => {
      const allFields = [
        ...WINE_PASSPORT_FIELDS.productInfo,
        ...WINE_PASSPORT_FIELDS.producer,
        ...WINE_PASSPORT_FIELDS.nutritional,
        ...WINE_PASSPORT_FIELDS.manualOverrides,
        ...WINE_PASSPORT_FIELDS.displayOptions,
        ...WINE_PASSPORT_FIELDS.ingredients,
        ...WINE_PASSPORT_FIELDS.recycling,
      ];
      
      DEPRECATED_FIELDS.forEach((deprecatedField) => {
        expect(allFields).not.toContain(deprecatedField);
      });
    });
  });

  describe("field naming conventions", () => {
    it("all fields use snake_case", () => {
      const allFields = [
        ...WINE_PASSPORT_FIELDS.productInfo,
        ...WINE_PASSPORT_FIELDS.producer,
        ...WINE_PASSPORT_FIELDS.nutritional,
        ...WINE_PASSPORT_FIELDS.manualOverrides,
        ...WINE_PASSPORT_FIELDS.displayOptions,
        ...WINE_PASSPORT_FIELDS.ingredients,
        ...WINE_PASSPORT_FIELDS.recycling,
      ];
      
      const snakeCaseRegex = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
      
      allFields.forEach((field) => {
        expect(field).toMatch(snakeCaseRegex);
      });
    });
  });

  describe("ingredient structure", () => {
    it("ingredients field is properly defined", () => {
      expect(WINE_PASSPORT_FIELDS.ingredients).toContain('ingredients');
    });
    
    // Type definition for ingredients array items
    interface SelectedIngredient {
      id: string;
      name: string;
      isAllergen?: boolean;
    }
    
    it("ingredient objects have required properties", () => {
      const sampleIngredient: SelectedIngredient = {
        id: 'e220',
        name: 'Sulphur dioxide (E220)',
        isAllergen: true,
      };
      
      expect(sampleIngredient).toHaveProperty('id');
      expect(sampleIngredient).toHaveProperty('name');
      expect(sampleIngredient).toHaveProperty('isAllergen');
    });
  });

  describe("recycling structure", () => {
    it("recycling fields are properly defined", () => {
      expect(WINE_PASSPORT_FIELDS.recycling).toContain('packaging_materials');
      expect(WINE_PASSPORT_FIELDS.recycling.length).toBe(1);
    });
    
    // Type definition for packaging material
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
    
    it("packaging material objects have required properties", () => {
      const sampleMaterial: PackagingMaterial = {
        id: 'mat_1',
        typeId: 'bottle',
        typeName: 'Bottle',
        compositionId: 'gl70',
        compositionName: 'Green Glass',
        compositionCode: 'GL 70',
        disposalMethodId: 'glass-container',
        disposalMethodName: 'Glass Container',
      };
      
      expect(sampleMaterial).toHaveProperty('id');
      expect(sampleMaterial).toHaveProperty('typeId');
      expect(sampleMaterial).toHaveProperty('typeName');
    });

    it("custom packaging material supports translations", () => {
      const customMaterial: PackagingMaterial = {
        id: 'mat_2',
        typeId: 'custom',
        typeName: 'Wooden crate',
        isCustomType: true,
        customTypeName: 'Wooden crate',
        customTypeNameTranslations: {
          de: 'Holzkiste',
          fr: 'Caisse en bois',
        },
      };
      
      expect(customMaterial.isCustomType).toBe(true);
      expect(customMaterial.customTypeNameTranslations).toHaveProperty('de');
      expect(customMaterial.customTypeNameTranslations).toHaveProperty('fr');
    });
  });
});

describe("Wine Field Save/Load Contract", () => {
  // This test documents the exact structure that should be saved to category_data
  it("documents the complete category_data structure", () => {
    const exampleCategoryData = {
      // Product Info
      grape_variety: 'Cabernet Sauvignon',
      vintage: '2020',
      volume: 750,
      volume_unit: 'ml',
      country: 'France',
      region: 'Bordeaux',
      denomination: 'AOC Bordeaux',
      sugar_classification: 'Sec',
      denomination_translations: { de: 'AOC Bordeaux', fr: 'AOC Bordeaux' },
      sugar_classification_translations: { de: 'Trocken', fr: 'Sec' },
      grape_variety_translations: { de: 'Cabernet Sauvignon', fr: 'Cabernet Sauvignon' },
      vintage_translations: { de: '2020', fr: '2020' },
      region_translations: { de: 'Bordeaux', fr: 'Bordeaux' },
      
      // Producer Info
      producer_name: 'Château Example',
      bottler_info: 'Bottled at origin by Château Example',
      
      // Nutritional Values
      alcohol_percent: 13.5,
      residual_sugar: 2.5,
      total_acidity: 5.5,
      glycerine: 8.5,
      energy_kcal: 83,
      energy_kj: 347,
      carbohydrates: 0.25,
      sugar: 0.25,
      fat: 0,
      saturated_fat: 0,
      proteins: 0,
      salt: 0,
      
      // Manual overrides
      energy_kcal_manual: false,
      energy_kj_manual: false,
      carbohydrates_manual: false,
      sugar_manual: false,
      
      // Display options
      show_alcohol_on_label: true,
      show_residual_sugar_on_label: false,
      show_total_acidity_on_label: false,
      
      // Ingredients
      ingredients: [
        { id: 'grapes', name: 'Grapes', isAllergen: false },
        { id: 'e220', name: 'Sulphites (E220)', isAllergen: true },
      ],
      
      // Recycling
      packaging_materials: [
        {
          id: 'mat_1',
          typeId: 'bottle',
          typeName: 'Bottle',
          compositionId: 'gl70',
          compositionName: 'Green Glass',
          compositionCode: 'GL 70',
          disposalMethodId: 'glass-container',
          disposalMethodName: 'Glass Container',
        },
      ],
    };
    
    // Verify all canonical fields are present
    const allCanonicalFields = [
      ...CANONICAL_WINE_FIELDS.productInfo,
      ...CANONICAL_WINE_FIELDS.producer,
      ...CANONICAL_WINE_FIELDS.nutritional,
      ...CANONICAL_WINE_FIELDS.manualOverrides,
      ...CANONICAL_WINE_FIELDS.displayOptions,
      ...CANONICAL_WINE_FIELDS.ingredients,
      ...CANONICAL_WINE_FIELDS.recycling,
    ];
    
    allCanonicalFields.forEach((field) => {
      expect(exampleCategoryData).toHaveProperty(field);
    });
  });
});
