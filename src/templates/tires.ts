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

export class TiresTemplate extends BaseTemplate {
  id = 'tires';
  name = 'Tires';
  description = 'Digital Product Passport for tires (ESPR Priority Group - high impact on microplastics)';
  icon = '🛞';
  
  sections: TemplateSection[] = [
    {
      title: 'Tire Identification',
      description: 'Basic tire specifications',
      questions: [
        {
          id: 'tire_type',
          label: 'Tire Type',
          type: 'select',
          required: true,
          options: [
            { value: 'passenger', label: 'Passenger Car Tire' },
            { value: 'suv', label: 'SUV/4x4 Tire' },
            { value: 'truck', label: 'Truck/Commercial Tire' },
            { value: 'bus', label: 'Bus Tire' },
            { value: 'motorcycle', label: 'Motorcycle Tire' },
            { value: 'agricultural', label: 'Agricultural Tire' },
            { value: 'industrial', label: 'Industrial/Forklift Tire' },
            { value: 'other', label: 'Other' }
          ]
        },
        {
          id: 'tire_size',
          label: 'Tire Size',
          type: 'text',
          required: true,
          placeholder: 'e.g., 225/45 R17 94W'
        },
        {
          id: 'dot_code',
          label: 'DOT Code',
          type: 'text',
          placeholder: 'Manufacturing date and plant code'
        },
        {
          id: 'ece_approval',
          label: 'ECE Approval Number',
          type: 'text'
        }
      ]
    },
    {
      title: 'Performance Data',
      description: 'Mileage, wear, and efficiency ratings',
      questions: [
        {
          id: 'estimated_mileage_km',
          label: 'Estimated Mileage Life (km)',
          type: 'number',
          placeholder: 'e.g., 50000'
        },
        {
          id: 'treadwear_rating',
          label: 'Treadwear Rating (UTQG)',
          type: 'number',
          placeholder: 'e.g., 500'
        },
        {
          id: 'abrasion_rate',
          label: 'Abrasion Rate (mg/km)',
          type: 'number',
          helpText: 'New metric measuring microplastic release (tire dust) per km'
        },
        {
          id: 'rolling_resistance_class',
          label: 'Rolling Resistance Class (Energy Efficiency)',
          type: 'select',
          required: true,
          options: [
            { value: 'A', label: 'A (Most Efficient)' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'E', label: 'E (Least Efficient)' }
          ]
        },
        {
          id: 'wet_grip_class',
          label: 'Wet Grip Class',
          type: 'select',
          required: true,
          options: [
            { value: 'A', label: 'A (Best Grip)' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'E', label: 'E (Least Grip)' }
          ]
        },
        {
          id: 'noise_class',
          label: 'External Noise Class',
          type: 'select',
          options: [
            { value: 'A', label: 'A (Quietest)' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C (Loudest)' }
          ]
        },
        {
          id: 'noise_db',
          label: 'Noise Level (dB)',
          type: 'number',
          placeholder: 'e.g., 70'
        }
      ]
    },
    {
      title: 'Material Composition',
      description: 'Rubber and material mix',
      questions: [
        {
          id: 'natural_rubber_percentage',
          label: 'Natural Rubber (%)',
          type: 'number',
          placeholder: 'Percentage of natural rubber'
        },
        {
          id: 'synthetic_rubber_percentage',
          label: 'Synthetic Rubber (%)',
          type: 'number',
          placeholder: 'Percentage of synthetic rubber'
        },
        {
          id: 'recycled_content',
          label: 'Recycled Content (%)',
          type: 'number',
          placeholder: 'Percentage of recycled materials'
        },
        {
          id: 'silica_content',
          label: 'Silica-Based Compound?',
          type: 'checkbox',
          helpText: 'Modern compound for better wet grip and lower rolling resistance'
        }
      ]
    },
    {
      title: 'Retreading History',
      description: 'For truck/bus tires - retreading tracking',
      questions: [
        {
          id: 'retreading_count',
          label: 'Number of Times Retreaded',
          type: 'number',
          placeholder: '0 for new tires',
          helpText: 'Vital for safety and value retention of commercial tires'
        },
        {
          id: 'retreading_history',
          label: 'Retreading History',
          type: 'textarea',
          placeholder: 'Digital log: dates, retreader, type of retread'
        },
        {
          id: 'max_retreads_allowed',
          label: 'Maximum Retreads Allowed',
          type: 'number',
          placeholder: 'Per manufacturer specification'
        },
        {
          id: 'casing_condition',
          label: 'Casing Condition (if retreaded)',
          type: 'select',
          options: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'na', label: 'N/A (New Tire)' }
          ]
        }
      ]
    },
    {
      title: 'Seasonal & Usage',
      description: 'Season rating and usage specifications',
      questions: [
        {
          id: 'season_type',
          label: 'Season Type',
          type: 'select',
          options: [
            { value: 'summer', label: 'Summer' },
            { value: 'winter', label: 'Winter (3PMSF)' },
            { value: 'all_season', label: 'All-Season' },
            { value: 'all_weather', label: 'All-Weather (3PMSF)' }
          ]
        },
        {
          id: 'three_peak_mountain',
          label: '3PMSF (Three-Peak Mountain Snowflake) Rated?',
          type: 'checkbox',
          helpText: 'Certified for severe snow conditions'
        },
        {
          id: 'run_flat',
          label: 'Run-Flat Technology?',
          type: 'checkbox'
        },
        {
          id: 'load_index',
          label: 'Load Index',
          type: 'number',
          placeholder: 'e.g., 94'
        },
        {
          id: 'speed_rating',
          label: 'Speed Rating',
          type: 'text',
          placeholder: 'e.g., W (270 km/h)'
        }
      ]
    },
    {
      title: 'End-of-Life',
      description: 'Recycling and disposal',
      questions: [
        {
          id: 'recyclable',
          label: 'End-of-Life Recyclable?',
          type: 'checkbox'
        },
        {
          id: 'recycling_options',
          label: 'Recycling Options',
          type: 'textarea',
          placeholder: 'Crumb rubber, pyrolysis, energy recovery, etc.'
        },
        {
          id: 'take_back_program',
          label: 'Manufacturer Take-Back Program?',
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
          label: 'Manufacturer/Brand',
          type: 'text',
          required: true
        },
        {
          id: 'model_name',
          label: 'Model/Pattern Name',
          type: 'text',
          required: true
        },
        {
          id: 'manufacturing_plant',
          label: 'Manufacturing Plant Location',
          type: 'text'
        },
        {
          id: 'production_date',
          label: 'Production Week/Year (from DOT)',
          type: 'text',
          placeholder: 'e.g., Week 23, 2024'
        }
      ]
    }
  ];

  getRequiredLogos(data: Record<string, unknown>): string[] {
    const logos: string[] = [];
    if (data.three_peak_mountain) logos.push('3pmsf');
    if (data.rolling_resistance_class) logos.push('eu-tire-label');
    return logos;
  }
}

export const tiresTemplate = new TiresTemplate();
