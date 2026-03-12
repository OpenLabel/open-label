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

export class IronSteelTemplate extends BaseTemplate {
  id = 'iron_steel';
  name = 'Iron & Steel';
  description = 'Digital Product Passport for iron and steel products (Delegated Act expected Q2 2026)';
  icon = '🔩';
  
  sections: TemplateSection[] = [
    {
      title: 'Product Identification',
      description: 'Steel grade and product specifications',
      questions: [
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'select',
          required: true,
          options: [
            { value: 'flat', label: 'Flat Products (sheets, plates, coils)' },
            { value: 'long', label: 'Long Products (bars, rods, sections)' },
            { value: 'tube', label: 'Tubes & Pipes' },
            { value: 'wire', label: 'Wire Products' },
            { value: 'casting', label: 'Castings' },
            { value: 'forging', label: 'Forgings' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'steel_grade',
          label: 'Steel Grade/Specification',
          type: 'text',
          required: true,
          placeholder: 'e.g., S355J2, AISI 304, EN 10025-2'
        },
        {
          id: 'batch_coil_id',
          label: 'Batch/Coil/Heat Number',
          type: 'text',
          required: true,
          placeholder: 'Unique tracking identifier'
        }
      ]
    },
    {
      title: 'Carbon Intensity',
      description: 'Embedded emissions aligned with CBAM requirements',
      questions: [
        {
          id: 'carbon_intensity',
          label: 'Carbon Intensity (kg CO2e/tonne)',
          type: 'number',
          required: true,
          placeholder: 'Embedded emissions per tonne of steel',
          helpText: 'Required for CBAM compliance'
        },
        {
          id: 'carbon_calculation_method',
          label: 'Carbon Calculation Method',
          type: 'select',
          options: [
            { value: 'actual', label: 'Actual emissions (facility-specific)' },
            { value: 'default', label: 'Default values (CBAM)' },
            { value: 'third_party', label: 'Third-party verified' }
          ]
        },
        {
          id: 'scope_1_emissions',
          label: 'Scope 1 Emissions (kg CO2e/tonne)',
          type: 'number',
          placeholder: 'Direct emissions from production'
        },
        {
          id: 'scope_2_emissions',
          label: 'Scope 2 Emissions (kg CO2e/tonne)',
          type: 'number',
          placeholder: 'Indirect emissions from purchased energy'
        }
      ]
    },
    {
      title: 'Energy Source',
      description: 'Fuel used in smelting and production',
      questions: [
        {
          id: 'production_route',
          label: 'Production Route',
          type: 'select',
          required: true,
          options: [
            { value: 'bof', label: 'Blast Furnace - Basic Oxygen Furnace (BF-BOF)' },
            { value: 'eaf', label: 'Electric Arc Furnace (EAF)' },
            { value: 'dri_eaf', label: 'Direct Reduced Iron - EAF' },
            { value: 'hydrogen_dri', label: 'Hydrogen-based DRI' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'primary_energy_source',
          label: 'Primary Energy Source',
          type: 'select',
          options: [
            { value: 'coal', label: 'Coal/Coke' },
            { value: 'natural_gas', label: 'Natural Gas' },
            { value: 'hydrogen_grey', label: 'Grey Hydrogen' },
            { value: 'hydrogen_green', label: 'Green Hydrogen' },
            { value: 'electricity_grid', label: 'Grid Electricity' },
            { value: 'electricity_renewable', label: 'Renewable Electricity' }
          ]
        },
        {
          id: 'renewable_energy_percentage',
          label: 'Renewable Energy Share (%)',
          type: 'number',
          placeholder: 'Percentage of energy from renewable sources'
        }
      ]
    },
    {
      title: 'Scrap Content',
      description: 'Recycled material content',
      questions: [
        {
          id: 'total_scrap_content',
          label: 'Total Scrap Content (%)',
          type: 'number',
          required: true,
          placeholder: 'Combined pre- and post-consumer scrap'
        },
        {
          id: 'pre_consumer_scrap',
          label: 'Pre-Consumer Scrap (%)',
          type: 'number',
          placeholder: 'Factory/manufacturing waste',
          helpText: 'Scrap from manufacturing processes'
        },
        {
          id: 'post_consumer_scrap',
          label: 'Post-Consumer Scrap (%)',
          type: 'number',
          placeholder: 'End-of-life recycled products',
          helpText: 'Scrap from old recycled products'
        }
      ]
    },
    {
      title: 'Alloy Chemistry',
      description: 'Precise chemical composition for grade verification',
      questions: [
        {
          id: 'carbon_content',
          label: 'Carbon Content (%)',
          type: 'number',
          placeholder: 'e.g., 0.20'
        },
        {
          id: 'manganese_content',
          label: 'Manganese Content (%)',
          type: 'number',
          placeholder: 'e.g., 1.50'
        },
        {
          id: 'silicon_content',
          label: 'Silicon Content (%)',
          type: 'number'
        },
        {
          id: 'chromium_content',
          label: 'Chromium Content (%)',
          type: 'number',
          helpText: 'For stainless steels'
        },
        {
          id: 'nickel_content',
          label: 'Nickel Content (%)',
          type: 'number'
        },
        {
          id: 'full_chemistry',
          label: 'Full Chemical Composition',
          type: 'textarea',
          placeholder: 'Complete chemical analysis'
        }
      ]
    },
    {
      title: 'Manufacturer & Origin',
      description: 'Production facility information',
      questions: [
        {
          id: 'manufacturer_name',
          label: 'Steel Producer Name',
          type: 'text',
          required: true
        },
        {
          id: 'production_facility',
          label: 'Production Facility Location',
          type: 'text',
          required: true
        },
        {
          id: 'country_of_origin',
          label: 'Country of Origin',
          type: 'text',
          required: true
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
    if (data.carbon_calculation_method === 'third_party') logos.push('verified-carbon');
    return logos;
  }
}

export const ironSteelTemplate = new IronSteelTemplate();
