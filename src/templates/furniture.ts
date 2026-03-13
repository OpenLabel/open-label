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

export class FurnitureTemplate extends BaseTemplate {
  id = 'furniture';
  name = 'Furniture & Mattresses';
  description = 'Digital Product Passport for furniture with EUDR and circularity focus';
  icon = '🛋️';
  
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
            { value: 'seating', label: 'Seating (chairs, sofas)' },
            { value: 'tables', label: 'Tables & Desks' },
            { value: 'storage', label: 'Storage & Shelving' },
            { value: 'beds', label: 'Beds & Bed Frames' },
            { value: 'mattresses', label: 'Mattresses' },
            { value: 'office', label: 'Office Furniture' },
            { value: 'outdoor', label: 'Outdoor Furniture' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'model_sku',
          label: 'Model/SKU',
          type: 'text'
        }
      ]
    },
    {
      title: 'Material Traceability - Wood',
      description: 'EUDR (EU Deforestation Regulation) compliance',
      questions: [
        {
          id: 'contains_wood',
          label: 'Contains Wood/Timber?',
          type: 'checkbox'
        },
        {
          id: 'wood_species',
          label: 'Wood Species',
          type: 'text',
          placeholder: 'e.g., Oak, Pine, Birch'
        },
        {
          id: 'wood_origin_country',
          label: 'Wood Origin Country',
          type: 'text'
        },
        {
          id: 'eudr_compliant',
          label: 'EUDR Compliant (Deforestation-Free)?',
          type: 'checkbox',
          helpText: 'Proves wood is not from deforested areas'
        },
        {
          id: 'fsc_certified',
          label: 'FSC Certified?',
          type: 'checkbox'
        },
        {
          id: 'pefc_certified',
          label: 'PEFC Certified?',
          type: 'checkbox'
        },
        {
          id: 'wood_certification_number',
          label: 'Forest Certification Number',
          type: 'text'
        }
      ]
    },
    {
      title: 'Fabric & Foam Composition',
      description: 'Upholstery and padding materials',
      questions: [
        {
          id: 'upholstery_type',
          label: 'Upholstery Material',
          type: 'select',
          options: [
            { value: 'leather', label: 'Leather' },
            { value: 'fabric', label: 'Fabric' },
            { value: 'synthetic', label: 'Synthetic/Faux Leather' },
            { value: 'none', label: 'No Upholstery' }
          ]
        },
        {
          id: 'fabric_composition',
          label: 'Fabric Composition',
          type: 'textarea',
          placeholder: 'e.g., 80% Polyester, 20% Cotton'
        },
        {
          id: 'foam_type',
          label: 'Foam/Padding Type',
          type: 'text',
          placeholder: 'e.g., Polyurethane foam, Memory foam'
        },
        {
          id: 'foam_recycled_content',
          label: 'Foam Recycled Content (%)',
          type: 'number',
          placeholder: 'e.g., 10'
        }
      ]
    },
    {
      title: 'Substances of Concern',
      description: 'Flame retardants, PFAS, and other chemicals',
      questions: [
        {
          id: 'contains_flame_retardants',
          label: 'Contains Flame Retardants?',
          type: 'checkbox',
          helpText: 'Mandatory declaration'
        },
        {
          id: 'flame_retardant_type',
          label: 'Flame Retardant Type',
          type: 'text',
          placeholder: 'Chemical name if applicable'
        },
        {
          id: 'pfas_free',
          label: 'PFAS-Free (water/stain repellent)?',
          type: 'checkbox',
          helpText: 'Declaration regarding forever chemicals in fabric treatments'
        },
        {
          id: 'formaldehyde_class',
          label: 'Formaldehyde Emission Class',
          type: 'select',
          options: [
            { value: 'E0', label: 'E0 (≤0.5 mg/L)' },
            { value: 'E1', label: 'E1 (≤1.5 mg/L)' },
            { value: 'E2', label: 'E2 (>1.5 mg/L)' },
            { value: 'na', label: 'Not applicable' }
          ]
        }
      ]
    },
    {
      title: 'Spare Parts & Repair',
      description: 'Circularity and repairability information',
      questions: [
        {
          id: 'spare_parts_available',
          label: 'Spare Parts Available?',
          type: 'checkbox'
        },
        {
          id: 'spare_parts_list',
          label: 'Available Spare Parts',
          type: 'textarea',
          placeholder: 'List: legs, castors, hinges, fabric covers, etc.'
        },
        {
          id: 'spare_parts_ordering',
          label: 'How to Order Spare Parts',
          type: 'textarea',
          placeholder: 'Website, phone number, or process'
        },
        {
          id: 'spare_parts_years',
          label: 'Spare Parts Availability (years)',
          type: 'number',
          placeholder: 'How long parts will be available'
        }
      ]
    },
    {
      title: 'Disassembly & Recycling',
      description: 'End-of-life instructions',
      questions: [
        {
          id: 'disassembly_instructions',
          label: 'Disassembly Instructions',
          type: 'textarea',
          placeholder: 'How to separate wood, metal, and textile components',
          helpText: 'Guides for separating materials for recycling'
        },
        {
          id: 'recyclable_percentage',
          label: 'Recyclable at End-of-Life (%)',
          type: 'number'
        },
        {
          id: 'take_back_program',
          label: 'Manufacturer Take-Back Program?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Refurbishment History',
      description: 'For second-hand sales',
      questions: [
        {
          id: 'is_refurbished',
          label: 'Is this a Refurbished Product?',
          type: 'checkbox'
        },
        {
          id: 'refurbishment_details',
          label: 'Refurbishment/Repair History',
          type: 'textarea',
          placeholder: 'Digital log of repairs or reupholstering',
          helpText: 'Important for second-hand sales value'
        }
      ]
    },
    {
      title: 'Manufacturer Information',
      description: 'Producer details',
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
          id: 'manufacturer_country',
          label: 'Country of Manufacture',
          type: 'text',
          required: true
        },
        {
          id: 'warranty_years',
          label: 'Warranty Period (years)',
          type: 'number'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.fsc_certified) logos.push('fsc');
    if (data.pefc_certified) logos.push('pefc');
    if (data.eudr_compliant) logos.push('eudr');
    return logos;
  }
}

export const furnitureTemplate = new FurnitureTemplate();
