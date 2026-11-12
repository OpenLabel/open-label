/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import type { PassportFormData } from '@/types/passport';
import { BATTERY_SAMPLE_TRANSLATIONS } from './batterySampleTranslations';

/** Demo battery passport (Regulation (EU) 2023/1542). All data is fictitious. */
export function buildSampleBatteryPassport(): PassportFormData {
  return {
    name: 'Demo e-bike battery 36 V',
    category: 'battery',
    image_url: null,
    description:
      '<p>Demonstration battery passport for a fictitious e-bike battery. All data shown here is fictitious and intended for preview only. This is not a certification, an approval or a complete regulatory passport.</p>',
    language: 'en',
    category_data: {
      battery_category: 'lmt',

      product_name: 'Demo e-bike battery 36 V',
      battery_model: 'DEMO-36-14',
      battery_unique_identifier: 'DEMO-36-14-000123',
      manufacture_place: 'Lyon, France',
      manufacture_date: '2027-03',
      battery_weight_kg: 3.2,

      manufacturer_name: 'Example Battery Works SAS',
      manufacturer_trade_name: 'Example Battery',
      manufacturer_address: '1 Example Street, 69000 Lyon, France',
      manufacturer_website: 'https://battery.example',
      manufacturer_email: 'passport@battery.example',

      battery_chemistry: 'li_nmc',
      hazardous_substances: 'Lithium hexafluorophosphate (LiPF6) in the electrolyte.',
      critical_raw_materials: ['cobalt', 'lithium', 'natural_graphite', 'nickel', 'manganese'],
      extinguishing_agent: 'Water in large quantities.',

      rated_capacity_ah: 14,
      voltage_min: 30,
      voltage_nominal: 36,
      voltage_max: 42,
      voltage_temperature_range: '0 to 45 °C',
      original_power_capability_w: 500,
      expected_lifetime_cycles: 1000,
      lifetime_reference_test: 'IEC 62660-1',
      idle_temperature_range: '-20 to 60 °C (IEC 62133-2)',
      calendar_life_warranty: '2 years',
      round_trip_efficiency_initial: 95,
      round_trip_efficiency_50: 92,
      internal_resistance_cell: 25,
      internal_resistance_pack: 120,
      cycle_life_c_rate: '0.5C',

      carbon_footprint_status: 'not_yet_applicable',

      separate_collection_symbol: true,
      cadmium_lead_symbol: 'none',
      eu_declaration_of_conformity: 'https://battery.example/doc/DEMO-36-14.pdf',

      waste_battery_information:
        'Charge and store the battery at room temperature to extend its life. Do not throw it away with household waste: return it free of charge to the retailer or to a battery collection point. Damaged lithium batteries can catch fire, so cover the terminals with tape and keep them away from heat. The crossed-out wheeled bin symbol means separate collection. The substances in batteries can harm health and the environment if the battery is dumped.',
      collection_point_link: 'https://battery.example/recycling',

      ...BATTERY_SAMPLE_TRANSLATIONS,
    },
  };
}
