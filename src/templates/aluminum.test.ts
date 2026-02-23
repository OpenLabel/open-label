import { describe, it, expect } from 'vitest';
import { AluminumTemplate, aluminumTemplate } from './aluminum';

describe('AluminumTemplate', () => {
  it('has correct properties', () => {
    expect(aluminumTemplate.id).toBe('aluminum');
    expect(aluminumTemplate.name).toBe('Aluminum');
    expect(aluminumTemplate.icon).toBe('🥫');
  });

  it('is an instance of AluminumTemplate', () => {
    expect(aluminumTemplate).toBeInstanceOf(AluminumTemplate);
  });

  it('has 5 sections', () => {
    expect(aluminumTemplate.sections).toHaveLength(5);
  });

  it('has no duplicate question IDs', () => {
    const ids = aluminumTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of aluminumTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('getRequiredLogos returns asi when asi_certified', () => {
    expect(aluminumTemplate.getRequiredLogos!({ asi_certified: true })).toContain('asi');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(aluminumTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
