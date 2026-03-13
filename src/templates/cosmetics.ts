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

import { BaseTemplate, TemplateSection } from './base';

export class CosmeticsTemplate extends BaseTemplate {
  id = 'cosmetics';
  name = 'Cosmetics';
  description = 'Digital Product Passport for cosmetics (ESPR Priority Group - high consumer demand)';
  icon = '💄';
  
  sections: TemplateSection[] = [
    {
      title: 'Product Identification',
      description: 'Basic product information',
      questions: [
        {
          id: 'product_name',
          label: 'Product Name',
          type: 'text',
          required: true
        },
        {
          id: 'product_type',
          label: 'Product Category',
          type: 'select',
          required: true,
          options: [
            { value: 'skincare', label: 'Skincare' },
            { value: 'makeup', label: 'Makeup/Color Cosmetics' },
            { value: 'haircare', label: 'Haircare' },
            { value: 'fragrance', label: 'Fragrance/Perfume' },
            { value: 'bodycare', label: 'Body Care' },
            { value: 'suncare', label: 'Sun Care' },
            { value: 'oral', label: 'Oral Care' },
            { value: 'nail', label: 'Nail Care' },
            { value: 'deodorant', label: 'Deodorant/Antiperspirant' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'net_content',
          label: 'Net Content',
          type: 'text',
          required: true,
          placeholder: 'e.g., 50ml, 100g'
        },
        {
          id: 'batch_number',
          label: 'Batch/Lot Number',
          type: 'text'
        }
      ]
    },
    {
      title: 'Ingredient Transparency (INCI)',
      description: 'Full INCI list and special ingredient flagging',
      questions: [
        {
          id: 'inci_list',
          label: 'Full INCI List',
          type: 'textarea',
          required: true,
          placeholder: 'Complete International Nomenclature of Cosmetic Ingredients list',
          helpText: 'Digital access to full ingredient list'
        },
        {
          id: 'contains_nanomaterials',
          label: 'Contains Nanomaterials?',
          type: 'checkbox',
          helpText: 'Often used in sunscreens - requires explicit flagging'
        },
        {
          id: 'nanomaterials_list',
          label: 'Nanomaterials Present',
          type: 'textarea',
          placeholder: 'List any nanomaterials (e.g., Nano Titanium Dioxide)'
        },
        {
          id: 'contains_microplastics',
          label: 'Contains Microplastics?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Allergen Declaration',
      description: 'Fragrance allergens and sensitizers',
      questions: [
        {
          id: 'contains_fragrance',
          label: 'Contains Fragrance?',
          type: 'checkbox'
        },
        {
          id: 'fragrance_allergens',
          label: 'Fragrance Allergens (≥0.01%)',
          type: 'textarea',
          placeholder: 'List allergens: Limonene, Linalool, Citronellol, etc.',
          helpText: 'Specific listing required for concentrations ≥0.01%'
        },
        {
          id: 'contains_preservatives',
          label: 'Contains Preservatives?',
          type: 'checkbox'
        },
        {
          id: 'preservatives_list',
          label: 'Preservatives Used',
          type: 'textarea',
          placeholder: 'e.g., Phenoxyethanol, Benzyl Alcohol'
        }
      ]
    },
    {
      title: 'Certifications',
      description: 'Organic, cruelty-free, and other certifications',
      questions: [
        {
          id: 'cruelty_free',
          label: 'Cruelty-Free Certified?',
          type: 'checkbox'
        },
        {
          id: 'vegan',
          label: 'Vegan Certified?',
          type: 'checkbox'
        },
        {
          id: 'organic_certified',
          label: 'Organic Certified (COSMOS, ECOCERT, etc.)?',
          type: 'checkbox'
        },
        {
          id: 'organic_certification_body',
          label: 'Organic Certification Body',
          type: 'text',
          placeholder: 'e.g., COSMOS, ECOCERT, NATRUE'
        },
        {
          id: 'dermatologically_tested',
          label: 'Dermatologically Tested?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Packaging End-of-Life',
      description: 'Recycling instructions for packaging components',
      questions: [
        {
          id: 'packaging_materials',
          label: 'Packaging Materials',
          type: 'textarea',
          placeholder: 'List materials: pump (PP), bottle (PET), cap (PP)',
          helpText: 'How to separate components for recycling'
        },
        {
          id: 'packaging_recyclable',
          label: 'Packaging Recyclable?',
          type: 'checkbox'
        },
        {
          id: 'recycling_instructions',
          label: 'Recycling Instructions',
          type: 'textarea',
          placeholder: 'How to separate pump, cap, bottle for recycling'
        },
        {
          id: 'residue_cleaning_instructions',
          label: 'Container Cleaning Instructions',
          type: 'textarea',
          placeholder: 'How to clean container to ensure recyclability'
        },
        {
          id: 'refillable',
          label: 'Refillable Packaging?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'PAO & Expiry',
      description: 'Period After Opening and shelf life',
      questions: [
        {
          id: 'pao_months',
          label: 'Period After Opening (months)',
          type: 'number',
          placeholder: 'e.g., 12'
        },
        {
          id: 'best_before_date',
          label: 'Best Before Date (if <30 months)',
          type: 'text',
          placeholder: 'YYYY-MM'
        }
      ]
    },
    {
      title: 'Responsible Person',
      description: 'EU Responsible Person per Cosmetics Regulation',
      questions: [
        {
          id: 'brand_name',
          label: 'Brand Name',
          type: 'text',
          required: true
        },
        {
          id: 'responsible_person_name',
          label: 'EU Responsible Person Name',
          type: 'text',
          required: true,
          helpText: 'Required per EU Cosmetics Regulation 1223/2009'
        },
        {
          id: 'responsible_person_address',
          label: 'EU Responsible Person Address',
          type: 'textarea',
          required: true
        },
        {
          id: 'country_of_origin',
          label: 'Country of Origin',
          type: 'text'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.cruelty_free) logos.push('leaping-bunny');
    if (data.vegan) logos.push('vegan');
    if (data.organic_certified) logos.push('cosmos');
    return logos;
  }
}

export const cosmeticsTemplate = new CosmeticsTemplate();
