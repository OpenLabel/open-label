import { describe, it, expect } from 'vitest';
import { BatteryTemplate, batteryTemplate } from './battery';

describe('BatteryTemplate', () => {
  it('has correct properties', () => {
    expect(batteryTemplate.id).toBe('battery');
    expect(batteryTemplate.name).toBe('Battery');
    expect(batteryTemplate.icon).toBe('🔋');
    expect(batteryTemplate.description).toContain('EU Battery Regulation 2023/1542');
  });

  it('is an instance of BatteryTemplate', () => {
    expect(batteryTemplate).toBeInstanceOf(BatteryTemplate);
  });

  it('has 6 sections', () => {
    expect(batteryTemplate.sections).toHaveLength(6);
  });

  it('has expected section titles', () => {
    const titles = batteryTemplate.sections.map(s => s.title);
    expect(titles).toContain('Battery Identification');
    expect(titles).toContain('Carbon Footprint & Sustainability');
    expect(titles).toContain('Performance & Durability');
    expect(titles).toContain('Supply Chain Due Diligence');
    expect(titles).toContain('Recycling & End-of-Life');
    expect(titles).toContain('Manufacturer Information');
  });

  it('has no duplicate question IDs', () => {
    const ids = batteryTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const section of batteryTemplate.sections) {
      for (const q of section.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const section of batteryTemplate.sections) {
      for (const q of section.questions) {
        if (q.type === 'select') {
          expect(q.options).toBeDefined();
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns weee when separate_collection_required', () => {
    expect(batteryTemplate.getRequiredLogos!({ separate_collection_required: true })).toContain('weee');
  });

  it('getRequiredLogos returns carbon-class when carbon_footprint_class set', () => {
    expect(batteryTemplate.getRequiredLogos!({ carbon_footprint_class: 'A' })).toContain('carbon-class');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(batteryTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
