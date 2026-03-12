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

export class TextilesTemplate extends BaseTemplate {
  id = 'textiles';
  name = 'Textiles';
  description = 'Digital Product Passport for textile products per EU Strategy for Sustainable Textiles';
  icon = '👕';
  
  sections: TemplateSection[] = [
    {
      title: 'Fiber Composition',
      description: 'Mandatory fiber content labeling per EU Regulation 1007/2011',
      questions: [
        {
          id: 'primary_fiber',
          label: 'Primary Fiber Type',
          type: 'select',
          required: true,
          options: [
            { value: 'cotton', label: 'Cotton' },
            { value: 'organic_cotton', label: 'Organic Cotton' },
            { value: 'polyester', label: 'Polyester' },
            { value: 'recycled_polyester', label: 'Recycled Polyester' },
            { value: 'wool', label: 'Wool' },
            { value: 'linen', label: 'Linen' },
            { value: 'silk', label: 'Silk' },
            { value: 'viscose', label: 'Viscose/Rayon' },
            { value: 'lyocell', label: 'Lyocell/Tencel' },
            { value: 'nylon', label: 'Nylon/Polyamide' },
            { value: 'elastane', label: 'Elastane/Spandex' },
            { value: 'hemp', label: 'Hemp' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'primary_fiber_percentage',
          label: 'Primary Fiber Percentage (%)',
          type: 'number',
          required: true,
          placeholder: 'e.g., 80'
        },
        {
          id: 'secondary_fiber',
          label: 'Secondary Fiber Type (if applicable)',
          type: 'text',
          placeholder: 'e.g., Elastane'
        },
        {
          id: 'secondary_fiber_percentage',
          label: 'Secondary Fiber Percentage (%)',
          type: 'number',
          placeholder: 'e.g., 20'
        },
        {
          id: 'full_composition',
          label: 'Full Composition Statement',
          type: 'textarea',
          placeholder: 'e.g., 80% Cotton, 15% Polyester, 5% Elastane',
          required: true
        }
      ]
    },
    {
      title: 'Sustainability & Certifications',
      description: 'Environmental certifications and sustainability claims',
      questions: [
        {
          id: 'gots_certified',
          label: 'GOTS Certified (Global Organic Textile Standard)?',
          type: 'checkbox',
          helpText: 'Organic content and environmental/social criteria'
        },
        {
          id: 'oeko_tex',
          label: 'OEKO-TEX Standard 100 Certified?',
          type: 'checkbox',
          helpText: 'Tested for harmful substances'
        },
        {
          id: 'grs_certified',
          label: 'GRS Certified (Global Recycled Standard)?',
          type: 'checkbox',
          helpText: 'Recycled content verification'
        },
        {
          id: 'recycled_content_percentage',
          label: 'Recycled Content Percentage (%)',
          type: 'number',
          placeholder: 'e.g., 50'
        },
        {
          id: 'bluesign_certified',
          label: 'bluesign® Certified?',
          type: 'checkbox',
          helpText: 'Sustainable textile production'
        },
        {
          id: 'fair_trade_certified',
          label: 'Fair Trade Certified?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Care Instructions',
      description: 'Washing and care information',
      questions: [
        {
          id: 'washing_temp',
          label: 'Maximum Washing Temperature',
          type: 'select',
          options: [
            { value: 'hand', label: 'Hand wash only' },
            { value: '30', label: '30°C' },
            { value: '40', label: '40°C' },
            { value: '60', label: '60°C' },
            { value: '95', label: '95°C' },
            { value: 'dry_clean', label: 'Dry clean only' }
          ]
        },
        {
          id: 'can_tumble_dry',
          label: 'Can be tumble dried?',
          type: 'checkbox'
        },
        {
          id: 'can_iron',
          label: 'Can be ironed?',
          type: 'checkbox'
        },
        {
          id: 'iron_temp',
          label: 'Maximum Iron Temperature',
          type: 'select',
          options: [
            { value: 'low', label: 'Low (110°C)' },
            { value: 'medium', label: 'Medium (150°C)' },
            { value: 'high', label: 'High (200°C)' }
          ]
        },
        {
          id: 'care_instructions_text',
          label: 'Additional Care Instructions',
          type: 'textarea',
          placeholder: 'Any special care instructions'
        }
      ]
    },
    {
      title: 'Origin & Manufacturing',
      description: 'Country of origin and manufacturing details',
      questions: [
        {
          id: 'country_of_origin',
          label: 'Country of Origin',
          type: 'text',
          required: true,
          placeholder: 'Where the product was manufactured'
        },
        {
          id: 'made_in_eu',
          label: 'Made in EU?',
          type: 'checkbox'
        },
        {
          id: 'manufacturing_facility',
          label: 'Manufacturing Facility Name',
          type: 'text'
        },
        {
          id: 'supply_chain_transparent',
          label: 'Full supply chain transparency available?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Environmental Impact',
      description: 'Environmental footprint information',
      questions: [
        {
          id: 'water_usage',
          label: 'Water Usage (liters per unit)',
          type: 'number',
          placeholder: 'e.g., 2700 for cotton t-shirt'
        },
        {
          id: 'carbon_footprint',
          label: 'Carbon Footprint (kg CO2e)',
          type: 'number',
          placeholder: 'Per unit of product'
        },
        {
          id: 'durability_score',
          label: 'Durability Score (1-5)',
          type: 'select',
          options: [
            { value: '1', label: '1 - Low durability' },
            { value: '2', label: '2 - Below average' },
            { value: '3', label: '3 - Average' },
            { value: '4', label: '4 - Above average' },
            { value: '5', label: '5 - High durability' }
          ]
        },
        {
          id: 'recyclable',
          label: 'Recyclable at end of life?',
          type: 'checkbox'
        },
        {
          id: 'take_back_program',
          label: 'Take-back program available?',
          type: 'checkbox'
        }
      ]
    },
    {
      title: 'Brand & Product Information',
      description: 'Manufacturer and product details',
      questions: [
        {
          id: 'brand_name',
          label: 'Brand Name',
          type: 'text',
          required: true
        },
        {
          id: 'product_type',
          label: 'Product Type',
          type: 'text',
          required: true,
          placeholder: 'e.g., T-shirt, Dress, Jeans'
        },
        {
          id: 'size',
          label: 'Size',
          type: 'text',
          placeholder: 'e.g., M, 42, 10'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    
    if (data.gots_certified) logos.push('gots');
    if (data.oeko_tex) logos.push('oeko-tex');
    if (data.grs_certified) logos.push('grs');
    if (data.bluesign_certified) logos.push('bluesign');
    if (data.fair_trade_certified) logos.push('fair-trade');
    if (data.made_in_eu) logos.push('made-in-eu');
    
    return logos;
  }
}

export const textilesTemplate = new TextilesTemplate();
