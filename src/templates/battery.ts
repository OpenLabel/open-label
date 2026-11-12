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

// Battery passport, Regulation (EU) 2023/1542 (Article 77 and Annex XIII).
// The English fallback texts come from the `battery` namespace of en.json, so
// every label, help text, option and section title has an i18n key and the
// wording lives in one place.

import en from '@/i18n/locales/en.json';
import { BaseTemplate, QuestionBadge, ShowWhenCondition, TemplateQuestion, TemplateSection } from './base';

type FieldStrings = { label: string; help?: string; placeholder?: string };
const T = en.battery as unknown as {
  sections: Record<string, { title: string; description: string }>;
  fields: Record<string, FieldStrings>;
  options: Record<string, Record<string, string>>;
  restrictedNotice: { title: string; body: string; bodyNoContact: string };
};

interface FieldOpts {
  options?: string;
  required?: boolean;
  badge?: QuestionBadge;
  showWhen?: ShowWhenCondition;
  translatable?: boolean;
  internal?: boolean;
}

function q(id: string, type: TemplateQuestion['type'], opts: FieldOpts = {}): TemplateQuestion {
  const s = T.fields[id];
  const k = `battery.fields.${id}`;
  const out: TemplateQuestion = { id, type, label: s.label, labelKey: `${k}.label` };
  if (s.help) { out.helpText = s.help; out.helpKey = `${k}.help`; }
  if (s.placeholder) { out.placeholder = s.placeholder; out.placeholderKey = `${k}.placeholder`; }
  if (opts.options) {
    const group = opts.options;
    out.options = Object.entries(T.options[group]).map(([value, label]) => ({
      value, label, labelKey: `battery.options.${group}.${value}`,
    }));
  }
  if (opts.required) out.required = true;
  if (opts.badge) out.badge = opts.badge;
  if (opts.showWhen) out.showWhen = opts.showWhen;
  if (opts.translatable) out.translatable = true;
  if (opts.internal) out.internal = true;
  return out;
}

function section(id: string, questions: TemplateQuestion[]): TemplateSection {
  return {
    id,
    title: T.sections[id].title,
    titleKey: `battery.sections.${id}.title`,
    description: T.sections[id].description,
    descriptionKey: `battery.sections.${id}.description`,
    questions,
  };
}

const REQ: FieldOpts = { required: true, badge: 'required' };

export const BATTERY_RESTRICTED_FIELD_IDS = [
  "battery_detailed_composition",
  "battery_spare_parts",
  "battery_dismantling_information",
  "battery_safety_measures",
  "battery_test_reports",
  "battery_status",
  "battery_state_of_health",
  "battery_state_of_health_date",
  "battery_usage_information",
  "battery_status_change_values",
] as const;

export const BATTERY_RESTRICTED_NOTICE = {
  title: T.restrictedNotice.title,
  titleKey: 'battery.restrictedNotice.title',
  body: T.restrictedNotice.body,
  bodyKey: 'battery.restrictedNotice.body',
  bodyNoContact: T.restrictedNotice.bodyNoContact,
  bodyNoContactKey: 'battery.restrictedNotice.bodyNoContact',
  contactFieldId: 'manufacturer_email',
};

const sections: TemplateSection[] = [
  section("scope", [
    q("battery_category", "select", { ...REQ, options: "category" }),
  ]),
  section("identity", [
    q("product_name", "text", { ...REQ, translatable: true }),
    q("battery_model", "text", { ...REQ }),
    q("battery_unique_identifier", "text", { ...REQ }),
    q("manufacture_place", "text", { ...REQ }),
    q("manufacture_date", "text", { ...REQ }),
    q("battery_weight_kg", "number", { ...REQ }),
    q("original_battery_passport", "text", { badge: "where_applicable" }),
  ]),
  section("operators", [
    q("manufacturer_name", "text", { ...REQ }),
    q("manufacturer_trade_name", "text"),
    q("manufacturer_address", "textarea", { ...REQ }),
    q("manufacturer_website", "text", { badge: "where_applicable" }),
    q("manufacturer_email", "text", { badge: "where_applicable" }),
    q("authorised_representative", "textarea", { badge: "where_applicable" }),
    q("importer", "textarea", { badge: "where_applicable" }),
  ]),
  section("composition", [
    q("battery_chemistry", "select", { ...REQ, options: "chemistry" }),
    q("battery_chemistry_other", "text", { showWhen: { field: "battery_chemistry", equals: "other" } }),
    q("hazardous_substances", "textarea", { ...REQ, translatable: true }),
    q("critical_raw_materials", "multi_select", { options: "crm", badge: "required" }),
    q("critical_raw_materials_other", "text", { showWhen: { field: "critical_raw_materials", equals: "other", includes: true } }),
    q("extinguishing_agent", "text", { ...REQ, translatable: true }),
    q("renewable_content_share", "number", { badge: "where_applicable" }),
  ]),
  section("performance", [
    q("rated_capacity_ah", "number", { ...REQ }),
    q("voltage_min", "number", { ...REQ }),
    q("voltage_nominal", "number", { ...REQ }),
    q("voltage_max", "number", { ...REQ }),
    q("voltage_temperature_range", "text", { badge: "where_applicable" }),
    q("original_power_capability_w", "number", { ...REQ }),
    q("power_capability_limits", "text", { badge: "where_applicable" }),
    q("expected_lifetime_cycles", "number", { ...REQ }),
    q("lifetime_reference_test", "text", { ...REQ }),
    q("capacity_threshold_exhaustion", "number", { badge: "required", showWhen: { field: "battery_category", equals: "ev" } }),
    q("idle_temperature_range", "text", { ...REQ }),
    q("calendar_life_warranty", "text", { badge: "where_applicable" }),
    q("round_trip_efficiency_initial", "number", { ...REQ }),
    q("round_trip_efficiency_50", "number", { ...REQ }),
    q("internal_resistance_cell", "number", { ...REQ }),
    q("internal_resistance_pack", "number", { ...REQ }),
    q("cycle_life_c_rate", "text", { ...REQ }),
  ]),
  section("sustainability", [
    q("carbon_footprint_status", "select", { options: "carbonStatus", badge: "tbd" }),
    q("carbon_footprint_value", "number", { showWhen: { field: "carbon_footprint_status", equals: "declared" } }),
    q("carbon_footprint_class", "text", { showWhen: { field: "carbon_footprint_status", equals: "declared" } }),
    q("carbon_footprint_study", "text", { showWhen: { field: "carbon_footprint_status", equals: "declared" } }),
    q("due_diligence_report", "textarea", { badge: "tbd" }),
    q("recycled_cobalt", "number", { badge: "tbd" }),
    q("recycled_lithium", "number", { badge: "tbd" }),
    q("recycled_nickel", "number", { badge: "tbd" }),
    q("recycled_lead", "number", { badge: "tbd" }),
  ]),
  section("labelling", [
    q("separate_collection_symbol", "checkbox", { badge: "required" }),
    q("cadmium_lead_symbol", "select", { ...REQ, options: "heavyMetal" }),
    q("eu_declaration_of_conformity", "text", { ...REQ }),
  ]),
  section("end_of_life", [
    q("waste_battery_information", "textarea", { ...REQ, translatable: true }),
    q("collection_point_link", "text"),
  ]),
  section("restricted_model", [
    q("battery_detailed_composition", "textarea", { internal: true }),
    q("battery_spare_parts", "textarea", { internal: true }),
    q("battery_dismantling_information", "textarea", { internal: true }),
    q("battery_safety_measures", "textarea", { internal: true }),
  ]),
  section("restricted_authorities", [
    q("battery_test_reports", "textarea", { internal: true }),
  ]),
  section("individual", [
    q("battery_status", "select", { options: "status", internal: true }),
    q("battery_state_of_health", "number", { internal: true }),
    q("battery_state_of_health_date", "text", { internal: true }),
    q("battery_usage_information", "textarea", { internal: true }),
    q("battery_status_change_values", "textarea", { internal: true }),
  ]),
];

export class BatteryTemplate extends BaseTemplate {
  id = 'battery';
  name = 'Batteries';
  description = "Battery passport for EV, LMT and industrial batteries above 2 kWh (Regulation (EU) 2023/1542)";
  icon = '🔋';
  sections: TemplateSection[] = sections;
  restrictedAccessNotice = BATTERY_RESTRICTED_NOTICE;

  // No logos are added automatically: the separate collection symbol and the
  // CE marking belong on the battery itself, not on a self-declared badge.
  getRequiredLogos(): string[] {
    return [];
  }
}

export const batteryTemplate = new BatteryTemplate();
