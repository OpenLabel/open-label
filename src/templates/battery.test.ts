/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from 'vitest';
import { BatteryTemplate, batteryTemplate, BATTERY_RESTRICTED_FIELD_IDS } from './battery';
import { categoryList } from './index';

const questions = batteryTemplate.sections.flatMap((s) => s.questions);
const byId = (id: string) => questions.find((q) => q.id === id);

describe('BatteryTemplate (Regulation (EU) 2023/1542)', () => {
  it('has the expected identity', () => {
    expect(batteryTemplate).toBeInstanceOf(BatteryTemplate);
    expect(batteryTemplate.id).toBe('battery');
    expect(batteryTemplate.icon).toBe('🔋');
    expect(batteryTemplate.description).toContain('2023/1542');
  });

  it('is selectable in the category list', () => {
    expect(categoryList.find((c) => c.value === 'battery')?.status).toBe('active');
  });

  it('offers only the battery categories that need a passport (Article 77(1))', () => {
    const values = byId('battery_category')!.options!.map((o) => o.value);
    expect(values).toEqual(['ev', 'lmt', 'industrial']);
  });

  it('has no duplicate question ids', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is fully key-driven', () => {
    for (const s of batteryTemplate.sections) {
      expect(s.titleKey).toMatch(/^battery\.sections\./);
      if (s.description) expect(s.descriptionKey).toMatch(/^battery\.sections\./);
    }
    for (const q of questions) {
      expect(q.labelKey, q.id).toBe(`battery.fields.${q.id}.label`);
      if (q.helpText) expect(q.helpKey, q.id).toBe(`battery.fields.${q.id}.help`);
      if (q.placeholder) expect(q.placeholderKey, q.id).toBe(`battery.fields.${q.id}.placeholder`);
      for (const o of q.options ?? []) expect(o.labelKey, `${q.id}.${o.value}`).toMatch(/^battery\.options\./);
    }
  });

  it('keeps every Annex XIII point 2 to 4 field off the public passport', () => {
    const restrictedSections = batteryTemplate.sections.filter((s) => s.id?.startsWith('restricted_') || s.id === 'individual');
    const ids = restrictedSections.flatMap((s) => s.questions.map((q) => q.id));
    expect(ids.length).toBeGreaterThan(0);
    for (const s of restrictedSections) for (const q of s.questions) expect(q.internal, q.id).toBe(true);
    expect([...BATTERY_RESTRICTED_FIELD_IDS].sort()).toEqual(ids.sort());
  });

  it('marks no public field as internal', () => {
    const publicSections = batteryTemplate.sections.filter((s) => !(s.id?.startsWith('restricted_') || s.id === 'individual'));
    for (const s of publicSections) for (const q of s.questions) expect(q.internal, q.id).toBeFalsy();
  });

  it('shows the EV-only capacity threshold only for EV batteries', () => {
    expect(byId('capacity_threshold_exhaustion')!.showWhen).toEqual({ field: 'battery_category', equals: 'ev' });
  });

  it('adds no self-declared logos', () => {
    expect(batteryTemplate.getRequiredLogos!()).toEqual([]);
  });

  it('points the restricted-access notice at the manufacturer contact', () => {
    expect(batteryTemplate.restrictedAccessNotice?.contactFieldId).toBe('manufacturer_email');
    expect(byId('manufacturer_email')).toBeDefined();
  });
});
