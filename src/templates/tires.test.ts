import { describe, it, expect } from 'vitest';
import { TiresTemplate, tiresTemplate } from './tires';

describe('TiresTemplate', () => {
  it('has correct properties', () => {
    expect(tiresTemplate.id).toBe('tires');
    expect(tiresTemplate.name).toBe('Tires');
    expect(tiresTemplate.icon).toBe('🛞');
  });

  it('is an instance of TiresTemplate', () => {
    expect(tiresTemplate).toBeInstanceOf(TiresTemplate);
  });

  it('has 7 sections', () => {
    expect(tiresTemplate.sections).toHaveLength(7);
  });

  it('has no duplicate question IDs', () => {
    const ids = tiresTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of tiresTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('getRequiredLogos returns correct logos', () => {
    expect(tiresTemplate.getRequiredLogos!({})).toEqual([]);
    expect(tiresTemplate.getRequiredLogos!({ three_peak_mountain: true })).toContain('3pmsf');
    expect(tiresTemplate.getRequiredLogos!({ rolling_resistance_class: 'A' })).toContain('eu-tire-label');
  });
});
