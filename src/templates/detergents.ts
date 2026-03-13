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

export class DetergentsTemplate extends BaseTemplate {
  id = 'detergents';
  name = 'Detergents & Chemicals';
  description = 'Digital Product Passport for detergents, paints, and chemicals per EU CLP/Detergents Regulation';
  icon = '🧴';
  
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
            { value: 'laundry', label: 'Laundry Detergent' },
            { value: 'dishwashing', label: 'Dishwashing Detergent' },
            { value: 'surface', label: 'Surface Cleaner' },
            { value: 'glass', label: 'Glass Cleaner' },
            { value: 'bathroom', label: 'Bathroom Cleaner' },
            { value: 'floor', label: 'Floor Cleaner' },
            { value: 'paint', label: 'Paint/Coating' },
            { value: 'adhesive', label: 'Adhesive' },
            { value: 'solvent', label: 'Solvent' },
            { value: 'other', label: 'Other Chemical Product' }
          ]
        },
        {
          id: 'net_content',
          label: 'Net Content',
          type: 'text',
          required: true,
          placeholder: 'e.g., 1L, 500ml, 2kg'
        },
        {
          id: 'ufi_code',
          label: 'UFI Code (Unique Formula Identifier)',
          type: 'text',
          placeholder: 'e.g., N1QV-R02N-J00M-WQD5',
          helpText: '16-character code for poison center identification'
        }
      ]
    },
    {
      title: 'Safety Data Sheet (Digital)',
      description: 'Digitized SDS replacing paper leaflets',
      questions: [
        {
          id: 'hazard_statements',
          label: 'Hazard Statements (H-codes)',
          type: 'textarea',
          placeholder: 'e.g., H315 - Causes skin irritation',
          helpText: 'Instant access to chemical safety warnings via QR code'
        },
        {
          id: 'precautionary_statements',
          label: 'Precautionary Statements (P-codes)',
          type: 'textarea',
          placeholder: 'e.g., P280 - Wear protective gloves'
        },
        {
          id: 'signal_word',
          label: 'Signal Word',
          type: 'select',
          options: [
            { value: 'danger', label: 'Danger' },
            { value: 'warning', label: 'Warning' },
            { value: 'none', label: 'No Signal Word' }
          ]
        },
        {
          id: 'ghs_pictograms',
          label: 'GHS Pictograms Required',
          type: 'textarea',
          placeholder: 'List: Corrosive, Irritant, Environmental hazard, etc.'
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
          placeholder: 'Specific listing of fragrance allergens',
          helpText: 'Required for concentrations ≥0.01%'
        },
        {
          id: 'contains_preservatives',
          label: 'Contains Preservatives?',
          type: 'checkbox'
        },
        {
          id: 'preservatives_list',
          label: 'Preservatives',
          type: 'textarea',
          placeholder: 'e.g., MIT, BIT, Kathon'
        }
      ]
    },
    {
      title: 'Environmental Data',
      description: 'Biodegradability and environmental impact',
      questions: [
        {
          id: 'surfactant_biodegradability',
          label: 'Surfactant Biodegradability (%)',
          type: 'number',
          placeholder: 'e.g., 95',
          helpText: 'How quickly surfactants break down in water systems'
        },
        {
          id: 'biodegradability_test',
          label: 'Biodegradability Test Standard',
          type: 'text',
          placeholder: 'e.g., OECD 301B, ISO 14593'
        },
        {
          id: 'eco_label',
          label: 'EU Ecolabel Certified?',
          type: 'checkbox'
        },
        {
          id: 'phosphate_free',
          label: 'Phosphate-Free?',
          type: 'checkbox'
        },
        {
          id: 'microplastic_free',
          label: 'Microplastic-Free?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Dosage & Use (Detergents)',
      description: 'Digital dosage instructions',
      questions: [
        {
          id: 'is_concentrated',
          label: 'Concentrated Formula?',
          type: 'checkbox'
        },
        {
          id: 'concentration_factor',
          label: 'Concentration Factor (vs. standard)',
          type: 'text',
          placeholder: 'e.g., 2x, 3x concentrated'
        },
        {
          id: 'dosage_soft_water',
          label: 'Dosage - Soft Water (ml)',
          type: 'number',
          placeholder: 'Per standard load'
        },
        {
          id: 'dosage_medium_water',
          label: 'Dosage - Medium Water (ml)',
          type: 'number',
          placeholder: 'Per standard load'
        },
        {
          id: 'dosage_hard_water',
          label: 'Dosage - Hard Water (ml)',
          type: 'number',
          placeholder: 'Per standard load'
        },
        {
          id: 'dosage_instructions',
          label: 'Digital Dosage Instructions',
          type: 'textarea',
          placeholder: 'Wash cycle optimization based on water hardness and load size',
          helpText: 'To prevent product overuse'
        }
      ]
    },
    {
      title: 'Packaging & Recycling',
      description: 'Packaging recyclability',
      questions: [
        {
          id: 'packaging_material',
          label: 'Primary Packaging Material',
          type: 'select',
          options: [
            { value: 'hdpe', label: 'HDPE (02)' },
            { value: 'pet', label: 'PET (01)' },
            { value: 'pp', label: 'PP (05)' },
            { value: 'metal', label: 'Metal' },
            { value: 'glass', label: 'Glass' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'packaging_recyclable',
          label: 'Packaging Recyclable?',
          type: 'checkbox'
        },
        {
          id: 'recycled_packaging_content',
          label: 'Recycled Content in Packaging (%)',
          type: 'number'
        },
        {
          id: 'refill_available',
          label: 'Refill Pack Available?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Manufacturer Information',
      description: 'Producer and responsible person details',
      questions: [
        {
          id: 'brand_name',
          label: 'Brand Name',
          type: 'text',
          required: true
        },
        {
          id: 'manufacturer_name',
          label: 'Manufacturer Name',
          type: 'text',
          required: true
        },
        {
          id: 'manufacturer_address',
          label: 'Manufacturer Address',
          type: 'textarea',
          required: true
        },
        {
          id: 'emergency_contact',
          label: 'Emergency Contact (Poison Center)',
          type: 'text',
          placeholder: 'Phone number for emergencies'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.eco_label) logos.push('eu-ecolabel');
    return logos;
  }
}

export const detergentsTemplate = new DetergentsTemplate();
