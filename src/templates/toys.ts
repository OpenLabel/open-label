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

export class ToysTemplate extends BaseTemplate {
  id = 'toys';
  name = 'Toys';
  description = 'Digital Product Passport for toys per EU Regulation 2025/2509';
  icon = '🧸';
  
  sections: TemplateSection[] = [
    {
      title: 'Product Identification & Visual',
      description: 'Visual identification to prevent counterfeit matching',
      questions: [
        {
          id: 'product_name',
          label: 'Product Name',
          type: 'text',
          required: true
        },
        {
          id: 'product_type',
          label: 'Toy Category',
          type: 'select',
          required: true,
          options: [
            { value: 'plush', label: 'Plush/Soft Toys' },
            { value: 'plastic', label: 'Plastic Toys' },
            { value: 'wooden', label: 'Wooden Toys' },
            { value: 'electronic', label: 'Electronic Toys' },
            { value: 'outdoor', label: 'Outdoor/Activity Toys' },
            { value: 'construction', label: 'Construction/Building Sets' },
            { value: 'dolls', label: 'Dolls & Action Figures' },
            { value: 'games', label: 'Games & Puzzles' },
            { value: 'arts_crafts', label: 'Arts & Crafts' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'age_range',
          label: 'Recommended Age Range',
          type: 'text',
          required: true,
          placeholder: 'e.g., 3+ years, 6-12 years'
        },
        {
          id: 'color_image_required',
          label: 'Color product image uploaded?',
          type: 'checkbox',
          helpText: 'Required: passport must include color image to verify physical product'
        }
      ]
    },
    {
      title: 'Digital Declaration of Conformity',
      description: 'The DPP replaces paper documentation',
      questions: [
        {
          id: 'ce_marked',
          label: 'CE Marked?',
          type: 'checkbox',
          required: true,
          helpText: 'Mandatory for toys sold in the EU'
        },
        {
          id: 'en71_compliant',
          label: 'EN 71 (Toy Safety Standard) Compliant?',
          type: 'checkbox',
          required: true
        },
        {
          id: 'notified_body',
          label: 'Notified Body Number (if applicable)',
          type: 'text',
          placeholder: 'e.g., 0123'
        },
        {
          id: 'conformity_declaration_reference',
          label: 'Declaration of Conformity Reference',
          type: 'text'
        }
      ]
    },
    {
      title: 'Chemical Transparency',
      description: 'PFAS ban and substance declarations',
      questions: [
        {
          id: 'pfas_free',
          label: 'PFAS-Free Declaration',
          type: 'checkbox',
          required: true,
          helpText: 'Forever chemicals are now banned in toys'
        },
        {
          id: 'bpa_free',
          label: 'BPA-Free?',
          type: 'checkbox'
        },
        {
          id: 'phthalate_free',
          label: 'Phthalate-Free?',
          type: 'checkbox'
        },
        {
          id: 'migration_tested',
          label: 'Substance Migration Testing Passed?',
          type: 'checkbox',
          helpText: 'Proves chemicals do not migrate when chewed'
        },
        {
          id: 'lead_cadmium_compliant',
          label: 'Lead & Cadmium Limits Compliant?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Allergen Declaration',
      description: 'Fragrance allergens (expanded list)',
      questions: [
        {
          id: 'contains_fragrances',
          label: 'Contains Fragrances?',
          type: 'checkbox'
        },
        {
          id: 'fragrance_allergens_list',
          label: 'Fragrance Allergens Present (if any)',
          type: 'textarea',
          placeholder: 'List any fragrance allergens ≥10 mg/kg',
          helpText: 'Mandatory disclosure per EU requirements'
        },
        {
          id: 'nickel_release_compliant',
          label: 'Nickel Release Limits Compliant?',
          type: 'checkbox',
          helpText: 'For metal components in contact with skin'
        }
      ]
    },
    {
      title: 'Safety Warnings',
      description: 'Age warnings and hazard information',
      questions: [
        {
          id: 'small_parts_warning',
          label: 'Small Parts Warning Required?',
          type: 'checkbox',
          helpText: 'Choking hazard for children under 3'
        },
        {
          id: 'supervision_required',
          label: 'Adult Supervision Required?',
          type: 'checkbox'
        },
        {
          id: 'additional_warnings',
          label: 'Additional Safety Warnings',
          type: 'textarea',
          placeholder: 'Any other safety warnings or precautions'
        }
      ]
    },
    {
      title: 'Responsible Person',
      description: 'EU Economic Operator responsible for safety',
      questions: [
        {
          id: 'manufacturer_name',
          label: 'Manufacturer Name',
          type: 'text',
          required: true
        },
        {
          id: 'eu_responsible_person',
          label: 'EU Responsible Person Name',
          type: 'text',
          required: true,
          helpText: 'Crucial for imported toys - the EU entity responsible for safety'
        },
        {
          id: 'eu_responsible_person_address',
          label: 'EU Responsible Person Address',
          type: 'textarea',
          required: true
        },
        {
          id: 'eu_responsible_person_contact',
          label: 'EU Responsible Person Contact',
          type: 'text',
          placeholder: 'Email or phone'
        }
      ]
    },
    {
      title: 'Country of Origin',
      description: 'Manufacturing location',
      questions: [
        {
          id: 'country_of_origin',
          label: 'Country of Manufacture',
          type: 'text',
          required: true
        },
        {
          id: 'production_date',
          label: 'Production Date/Batch',
          type: 'text'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.ce_marked) logos.push('ce');
    return logos;
  }
}

export const toysTemplate = new ToysTemplate();
