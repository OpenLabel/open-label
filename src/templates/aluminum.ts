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

export class AluminumTemplate extends BaseTemplate {
  id = 'aluminum';
  name = 'Aluminum';
  description = 'Digital Product Passport for aluminum products (ESPR Priority Group 2025-2030)';
  icon = '🥫';
  
  sections: TemplateSection[] = [
    {
      title: 'Coil/Batch Identification',
      description: 'Unlike consumer goods, aluminum is tracked by coil or batch',
      questions: [
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'select',
          required: true,
          options: [
            { value: 'sheet', label: 'Sheet/Plate' },
            { value: 'coil', label: 'Coil/Strip' },
            { value: 'foil', label: 'Foil' },
            { value: 'extrusion', label: 'Extrusion Profile' },
            { value: 'casting', label: 'Casting' },
            { value: 'wire', label: 'Wire/Rod' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'coil_batch_id',
          label: 'Coil/Batch ID',
          type: 'text',
          required: true,
          placeholder: 'Unique coil or batch identifier'
        },
        {
          id: 'alloy_designation',
          label: 'Alloy Designation',
          type: 'text',
          required: true,
          placeholder: 'e.g., 6061-T6, 5052-H32, 3003-O'
        }
      ]
    },
    {
      title: 'Smelting Energy Source',
      description: 'Energy source declaration - critical for carbon footprint',
      questions: [
        {
          id: 'smelting_energy_source',
          label: 'Primary Smelting Energy Source',
          type: 'select',
          required: true,
          helpText: 'This massively impacts the carbon footprint',
          options: [
            { value: 'hydro', label: 'Hydropower' },
            { value: 'solar', label: 'Solar' },
            { value: 'wind', label: 'Wind' },
            { value: 'nuclear', label: 'Nuclear' },
            { value: 'natural_gas', label: 'Natural Gas' },
            { value: 'coal', label: 'Coal' },
            { value: 'grid_mix', label: 'Grid Mix' }
          ]
        },
        {
          id: 'renewable_percentage',
          label: 'Renewable Energy Percentage (%)',
          type: 'number',
          placeholder: 'Percentage of smelting energy from renewables'
        },
        {
          id: 'carbon_intensity',
          label: 'Carbon Intensity (kg CO2e/kg Al)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 4.0 for hydro, 16.0+ for coal'
        }
      ]
    },
    {
      title: 'Alloy Composition',
      description: 'Precise chemical breakdown for recycler sorting',
      questions: [
        {
          id: 'aluminum_content',
          label: 'Aluminum Content (%)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 97.5'
        },
        {
          id: 'magnesium_content',
          label: 'Magnesium Content (%)',
          type: 'number',
          placeholder: 'Key for alloy family identification'
        },
        {
          id: 'silicon_content',
          label: 'Silicon Content (%)',
          type: 'number'
        },
        {
          id: 'iron_content',
          label: 'Iron Content (%)',
          type: 'number'
        },
        {
          id: 'copper_content',
          label: 'Copper Content (%)',
          type: 'number'
        },
        {
          id: 'zinc_content',
          label: 'Zinc Content (%)',
          type: 'number'
        },
        {
          id: 'full_composition',
          label: 'Full Chemical Composition',
          type: 'textarea',
          placeholder: 'Complete chemical analysis per mill test certificate'
        }
      ]
    },
    {
      title: 'Scrap Content',
      description: 'Pre-consumer vs post-consumer recycled content',
      questions: [
        {
          id: 'total_recycled_content',
          label: 'Total Recycled Content (%)',
          type: 'number',
          required: true,
          placeholder: 'Combined scrap percentage'
        },
        {
          id: 'pre_consumer_scrap',
          label: 'Pre-Consumer Scrap (%)',
          type: 'number',
          placeholder: 'Factory waste (new scrap)',
          helpText: 'Scrap from manufacturing/fabrication'
        },
        {
          id: 'post_consumer_scrap',
          label: 'Post-Consumer Scrap (%)',
          type: 'number',
          placeholder: 'Old scrap from recycled products',
          helpText: 'End-of-life recycled aluminum'
        },
        {
          id: 'primary_aluminum_percentage',
          label: 'Primary (Virgin) Aluminum (%)',
          type: 'number',
          placeholder: 'Percentage from primary smelting'
        }
      ]
    },
    {
      title: 'Producer Information',
      description: 'Smelter and producer details',
      questions: [
        {
          id: 'smelter_name',
          label: 'Primary Smelter Name',
          type: 'text',
          required: true
        },
        {
          id: 'smelter_country',
          label: 'Smelter Country',
          type: 'text',
          required: true
        },
        {
          id: 'producer_name',
          label: 'Product Manufacturer/Processor',
          type: 'text'
        },
        {
          id: 'production_date',
          label: 'Production Date',
          type: 'text',
          placeholder: 'YYYY-MM-DD'
        },
        {
          id: 'asi_certified',
          label: 'ASI (Aluminium Stewardship Initiative) Certified?',
          type: 'checkbox',
          helpText: 'Third-party sustainability certification'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.asi_certified) logos.push('asi');
    return logos;
  }
}

export const aluminumTemplate = new AluminumTemplate();
