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

export class ElectronicsTemplate extends BaseTemplate {
  id = 'electronics';
  name = 'Electronics & ICT';
  description = 'Digital Product Passport for electronics with Right to Repair focus';
  icon = '📱';
  
  sections: TemplateSection[] = [
    {
      title: 'Product Identification',
      description: 'Basic product information',
      questions: [
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'select',
          required: true,
          options: [
            { value: 'smartphone', label: 'Smartphone' },
            { value: 'tablet', label: 'Tablet' },
            { value: 'laptop', label: 'Laptop/Notebook' },
            { value: 'desktop', label: 'Desktop Computer' },
            { value: 'monitor', label: 'Monitor/Display' },
            { value: 'tv', label: 'Television' },
            { value: 'washing_machine', label: 'Washing Machine' },
            { value: 'refrigerator', label: 'Refrigerator' },
            { value: 'dishwasher', label: 'Dishwasher' },
            { value: 'vacuum', label: 'Vacuum Cleaner' },
            { value: 'other', label: 'Other Electronics' }
          ]
        },
        {
          id: 'model_identifier',
          label: 'Model Identifier',
          type: 'text',
          required: true,
          placeholder: 'e.g., XYZ-2024-Pro'
        },
        {
          id: 'serial_number',
          label: 'Serial Number',
          type: 'text'
        }
      ]
    },
    {
      title: 'Repairability & Right to Repair',
      description: 'Repair score and spare parts availability',
      questions: [
        {
          id: 'repairability_score',
          label: 'Repairability Index Score (1-10)',
          type: 'select',
          required: true,
          helpText: 'Score based on disassembly depth and spare parts availability',
          options: [
            { value: '10', label: '10 - Excellent repairability' },
            { value: '9', label: '9' },
            { value: '8', label: '8' },
            { value: '7', label: '7' },
            { value: '6', label: '6' },
            { value: '5', label: '5 - Average' },
            { value: '4', label: '4' },
            { value: '3', label: '3' },
            { value: '2', label: '2' },
            { value: '1', label: '1 - Poor repairability' }
          ]
        },
        {
          id: 'disassembly_depth',
          label: 'Disassembly Depth',
          type: 'select',
          options: [
            { value: 'tool_free', label: 'Tool-free (snap-fit)' },
            { value: 'standard_tools', label: 'Standard tools only' },
            { value: 'special_tools', label: 'Special tools required' },
            { value: 'non_repairable', label: 'Not user-repairable' }
          ]
        },
        {
          id: 'spare_parts_years',
          label: 'Spare Parts Availability (years)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 7',
          helpText: 'How long spare parts will be available after purchase'
        },
        {
          id: 'spare_parts_list',
          label: 'Available Spare Parts',
          type: 'textarea',
          placeholder: 'List key spare parts (e.g., Screen, Battery, Charging port)'
        }
      ]
    },
    {
      title: 'Software Support',
      description: 'Security updates and software support duration',
      questions: [
        {
          id: 'software_updates_years',
          label: 'Security Updates Duration (years)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 5',
          helpText: 'Guaranteed duration of security updates'
        },
        {
          id: 'os_updates_years',
          label: 'OS/Feature Updates Duration (years)',
          type: 'number',
          placeholder: 'e.g., 3'
        },
        {
          id: 'end_of_support_date',
          label: 'Expected End of Support Date',
          type: 'text',
          placeholder: 'YYYY-MM'
        }
      ]
    },
    {
      title: 'Energy Efficiency',
      description: 'Energy consumption and efficiency ratings',
      questions: [
        {
          id: 'energy_class',
          label: 'EU Energy Efficiency Class',
          type: 'select',
          options: [
            { value: 'A', label: 'A (Most Efficient)' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'E', label: 'E' },
            { value: 'F', label: 'F' },
            { value: 'G', label: 'G (Least Efficient)' }
          ]
        },
        {
          id: 'power_consumption_active',
          label: 'Power Consumption - Active (W)',
          type: 'number',
          placeholder: 'e.g., 45'
        },
        {
          id: 'power_consumption_standby',
          label: 'Power Consumption - Standby (W)',
          type: 'number',
          placeholder: 'e.g., 0.5'
        },
        {
          id: 'annual_energy_kwh',
          label: 'Annual Energy Consumption (kWh)',
          type: 'number',
          placeholder: 'Based on standard usage'
        }
      ]
    },
    {
      title: 'Critical Materials',
      description: 'Content of critical raw materials',
      questions: [
        {
          id: 'contains_tantalum',
          label: 'Contains Tantalum?',
          type: 'checkbox'
        },
        {
          id: 'contains_gold',
          label: 'Contains Gold?',
          type: 'checkbox'
        },
        {
          id: 'contains_rare_earths',
          label: 'Contains Rare Earth Elements?',
          type: 'checkbox'
        },
        {
          id: 'critical_materials_list',
          label: 'Critical Materials Details',
          type: 'textarea',
          placeholder: 'List critical materials and approximate quantities'
        },
        {
          id: 'conflict_minerals_compliant',
          label: 'Conflict Minerals Regulation Compliant?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Recycling & End-of-Life',
      description: 'WEEE compliance and recycling information',
      questions: [
        {
          id: 'weee_compliant',
          label: 'WEEE Compliant?',
          type: 'checkbox',
          required: true
        },
        {
          id: 'recycling_instructions',
          label: 'Recycling Instructions',
          type: 'textarea',
          placeholder: 'How to properly dispose/recycle this product'
        },
        {
          id: 'battery_removable',
          label: 'Battery User-Removable?',
          type: 'checkbox'
        },
        {
          id: 'take_back_program',
          label: 'Manufacturer Take-Back Program Available?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Manufacturer Information',
      description: 'Producer details',
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
          label: 'EU Responsible Person',
          type: 'text',
          helpText: 'Required if manufacturer is outside EU'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.weee_compliant) logos.push('weee');
    if (data.energy_class) logos.push('eu-energy');
    return logos;
  }
}

export const electronicsTemplate = new ElectronicsTemplate();
