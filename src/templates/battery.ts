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

export class BatteryTemplate extends BaseTemplate {
  id = 'battery';
  name = 'Battery';
  description = 'Digital Product Passport for batteries per EU Battery Regulation 2023/1542';
  icon = '🔋';
  
  sections: TemplateSection[] = [
    {
      title: 'Battery Identification',
      description: 'Basic battery identification per EU Battery Regulation',
      questions: [
        {
          id: 'battery_type',
          label: 'Battery Type',
          type: 'select',
          required: true,
          options: [
            { value: 'lmt', label: 'Light Means of Transport (LMT) Battery' },
            { value: 'ev', label: 'Electric Vehicle (EV) Battery' },
            { value: 'industrial', label: 'Industrial Battery (>2kWh)' },
            { value: 'portable', label: 'Portable Battery' },
            { value: 'starting', label: 'Starting, Lighting, Ignition (SLI) Battery' }
          ]
        },
        {
          id: 'battery_chemistry',
          label: 'Battery Chemistry',
          type: 'select',
          required: true,
          options: [
            { value: 'li-ion', label: 'Lithium-ion' },
            { value: 'li-po', label: 'Lithium Polymer' },
            { value: 'lfp', label: 'Lithium Iron Phosphate (LFP)' },
            { value: 'nmc', label: 'Nickel Manganese Cobalt (NMC)' },
            { value: 'lead-acid', label: 'Lead-acid' },
            { value: 'nimh', label: 'Nickel-Metal Hydride' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'capacity_kwh',
          label: 'Rated Capacity (kWh)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 50'
        },
        {
          id: 'voltage',
          label: 'Nominal Voltage (V)',
          type: 'number',
          placeholder: 'e.g., 400'
        }
      ]
    },
    {
      title: 'Carbon Footprint & Sustainability',
      description: 'Environmental impact information required by EU regulation',
      questions: [
        {
          id: 'carbon_footprint_declared',
          label: 'Has carbon footprint been calculated and declared?',
          type: 'checkbox',
          helpText: 'Mandatory for EV and industrial batteries from 2025'
        },
        {
          id: 'carbon_footprint_value',
          label: 'Carbon Footprint (kg CO2e/kWh)',
          type: 'number',
          placeholder: 'e.g., 75'
        },
        {
          id: 'carbon_footprint_class',
          label: 'Carbon Footprint Performance Class',
          type: 'select',
          options: [
            { value: 'A', label: 'Class A (Best)' },
            { value: 'B', label: 'Class B' },
            { value: 'C', label: 'Class C' },
            { value: 'D', label: 'Class D' },
            { value: 'E', label: 'Class E (Worst)' }
          ]
        },
        {
          id: 'recycled_content_cobalt',
          label: 'Recycled Cobalt Content (%)',
          type: 'number',
          placeholder: 'Minimum 16% required from 2031'
        },
        {
          id: 'recycled_content_lithium',
          label: 'Recycled Lithium Content (%)',
          type: 'number',
          placeholder: 'Minimum 6% required from 2031'
        },
        {
          id: 'recycled_content_nickel',
          label: 'Recycled Nickel Content (%)',
          type: 'number',
          placeholder: 'Minimum 6% required from 2031'
        }
      ]
    },
    {
      title: 'Performance & Durability',
      description: 'Battery performance and expected lifespan information',
      questions: [
        {
          id: 'cycle_life',
          label: 'Expected Cycle Life',
          type: 'number',
          placeholder: 'Number of charge cycles',
          helpText: 'e.g., 1500 cycles at 80% DoD'
        },
        {
          id: 'state_of_health',
          label: 'Minimum State of Health at end of life (%)',
          type: 'number',
          placeholder: 'e.g., 80'
        },
        {
          id: 'warranty_years',
          label: 'Warranty Period (years)',
          type: 'number',
          placeholder: 'e.g., 8'
        },
        {
          id: 'warranty_cycles',
          label: 'Warranty Cycles',
          type: 'number',
          placeholder: 'e.g., 160000 km or 1500 cycles'
        }
      ]
    },
    {
      title: 'Supply Chain Due Diligence',
      description: 'Responsible sourcing information',
      questions: [
        {
          id: 'due_diligence_policy',
          label: 'Supply chain due diligence policy in place?',
          type: 'checkbox',
          helpText: 'Required for all battery manufacturers'
        },
        {
          id: 'cobalt_source_verified',
          label: 'Cobalt sourcing verified for responsible mining?',
          type: 'checkbox'
        },
        {
          id: 'conflict_minerals_compliant',
          label: 'Compliant with conflict minerals regulation?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Recycling & End-of-Life',
      description: 'Information for battery recycling and disposal',
      questions: [
        {
          id: 'collection_scheme',
          label: 'Part of extended producer responsibility scheme?',
          type: 'checkbox',
          required: true
        },
        {
          id: 'recycling_instructions',
          label: 'Recycling Instructions',
          type: 'textarea',
          placeholder: 'Instructions for proper disposal and recycling'
        },
        {
          id: 'separate_collection_required',
          label: 'Requires separate collection (crossed-out bin symbol)?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Manufacturer Information',
      description: 'Producer and importer details',
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
          type: 'textarea'
        },
        {
          id: 'eu_responsible_person',
          label: 'EU Responsible Person (if non-EU manufacturer)',
          type: 'text'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    
    if (data.separate_collection_required) logos.push('weee');
    if (data.carbon_footprint_class) logos.push('carbon-class');
    
    return logos;
  }
}

export const batteryTemplate = new BatteryTemplate();
