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

import { BaseTemplate, TemplateSection } from './base';

export class ConstructionTemplate extends BaseTemplate {
  id = 'construction';
  name = 'Construction Products';
  description = 'Digital Product Passport for construction products per EU Regulation 2024/3110 (CPR)';
  icon = '🏗️';
  
  sections: TemplateSection[] = [
    {
      title: 'Product Identification',
      description: 'Unique product identification per ISO 15459',
      questions: [
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'select',
          required: true,
          options: [
            { value: 'cement', label: 'Cement & Concrete' },
            { value: 'steel_structural', label: 'Structural Steel' },
            { value: 'insulation', label: 'Insulation Materials' },
            { value: 'glass', label: 'Glass & Glazing' },
            { value: 'timber', label: 'Timber & Wood Products' },
            { value: 'roofing', label: 'Roofing Materials' },
            { value: 'flooring', label: 'Flooring' },
            { value: 'facade', label: 'Facade Elements' },
            { value: 'doors_windows', label: 'Doors & Windows' },
            { value: 'other', label: 'Other Construction Product' }
          ]
        },
        {
          id: 'unique_product_id',
          label: 'Unique Product ID (GS1 GTIN)',
          type: 'text',
          required: true,
          placeholder: 'e.g., 01234567890123',
          helpText: 'Must use standardized identifiers per ISO 15459'
        },
        {
          id: 'batch_number',
          label: 'Batch/Lot Number',
          type: 'text',
          placeholder: 'Manufacturing batch reference'
        }
      ]
    },
    {
      title: 'Declaration of Performance (DoPC)',
      description: 'Intended use and performance characteristics',
      questions: [
        {
          id: 'intended_use',
          label: 'Intended Use',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the intended application (e.g., load-bearing wall, thermal insulation)'
        },
        {
          id: 'fire_resistance_class',
          label: 'Fire Resistance Class',
          type: 'select',
          options: [
            { value: 'A1', label: 'A1 - Non-combustible' },
            { value: 'A2', label: 'A2 - Limited combustibility' },
            { value: 'B', label: 'B - Very limited contribution to fire' },
            { value: 'C', label: 'C - Limited contribution to fire' },
            { value: 'D', label: 'D - Acceptable contribution to fire' },
            { value: 'E', label: 'E - Acceptable reaction to fire' },
            { value: 'F', label: 'F - No performance determined' },
            { value: 'na', label: 'Not applicable' }
          ]
        },
        {
          id: 'load_bearing_capacity',
          label: 'Load-Bearing Capacity',
          type: 'text',
          placeholder: 'e.g., 500 kN/m²'
        },
        {
          id: 'acoustic_absorption',
          label: 'Acoustic Absorption Class',
          type: 'select',
          options: [
            { value: 'A', label: 'Class A (αw ≥ 0.90)' },
            { value: 'B', label: 'Class B (αw 0.80-0.85)' },
            { value: 'C', label: 'Class C (αw 0.60-0.75)' },
            { value: 'D', label: 'Class D (αw 0.30-0.55)' },
            { value: 'E', label: 'Class E (αw 0.15-0.25)' },
            { value: 'na', label: 'Not applicable' }
          ]
        },
        {
          id: 'thermal_conductivity',
          label: 'Thermal Conductivity (λ W/mK)',
          type: 'number',
          placeholder: 'e.g., 0.035'
        }
      ]
    },
    {
      title: 'Environmental Data',
      description: 'Global Warming Potential and resource efficiency',
      questions: [
        {
          id: 'gwp_a1_a3',
          label: 'Global Warming Potential A1-A3 (kg CO2e/unit)',
          type: 'number',
          required: true,
          placeholder: 'Lifecycle carbon from raw materials to manufacturing',
          helpText: 'Mandatory declaration of GWP for lifecycle stages A1-A3'
        },
        {
          id: 'epd_available',
          label: 'Environmental Product Declaration (EPD) available?',
          type: 'checkbox',
          helpText: 'Third-party verified environmental data'
        },
        {
          id: 'epd_reference',
          label: 'EPD Reference Number',
          type: 'text',
          placeholder: 'e.g., EPD-ABC-123456'
        },
        {
          id: 'recycled_content',
          label: 'Recycled Content (%)',
          type: 'number',
          placeholder: 'Percentage of secondary materials used'
        },
        {
          id: 'recyclability',
          label: 'End-of-Life Recyclability (%)',
          type: 'number',
          placeholder: 'Percentage that can be recycled'
        }
      ]
    },
    {
      title: 'Compliance & Certifications',
      description: 'CE marking and additional certifications',
      questions: [
        {
          id: 'ce_marked',
          label: 'CE Marked?',
          type: 'checkbox',
          required: true,
          helpText: 'Mandatory for construction products in the EU'
        },
        {
          id: 'notified_body',
          label: 'Notified Body Number',
          type: 'text',
          placeholder: 'e.g., 0123'
        },
        {
          id: 'harmonized_standard',
          label: 'Harmonized Standard Reference',
          type: 'text',
          placeholder: 'e.g., EN 12620, EN 13162'
        }
      ]
    },
    {
      title: 'Manufacturer Information',
      description: 'Data must be retained for 10 years',
      questions: [
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
          id: 'manufacturing_plant',
          label: 'Manufacturing Plant Location',
          type: 'text'
        },
        {
          id: 'production_date',
          label: 'Production Date',
          type: 'text',
          placeholder: 'YYYY-MM-DD'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.ce_marked) logos.push('ce');
    if (data.epd_available) logos.push('epd');
    return logos;
  }
}

export const constructionTemplate = new ConstructionTemplate();
