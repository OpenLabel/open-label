import { describe, it, expect } from 'vitest';
import { IronSteelTemplate, ironSteelTemplate } from './iron_steel';

describe('IronSteelTemplate', () => {
  it('has correct properties', () => {
    expect(ironSteelTemplate.id).toBe('iron_steel');
    expect(ironSteelTemplate.name).toBe('Iron & Steel');
    expect(ironSteelTemplate.icon).toBe('🔩');
  });

  it('is an instance of IronSteelTemplate', () => {
    expect(ironSteelTemplate).toBeInstanceOf(IronSteelTemplate);
  });

  it('has 6 sections', () => {
    expect(ironSteelTemplate.sections).toHaveLength(6);
  });

  it('has no duplicate question IDs', () => {
    const ids = ironSteelTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of ironSteelTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('getRequiredLogos returns verified-carbon for third_party', () => {
    expect(ironSteelTemplate.getRequiredLogos!({ carbon_calculation_method: 'third_party' })).toContain('verified-carbon');
  });

  it('getRequiredLogos returns empty for other methods', () => {
    expect(ironSteelTemplate.getRequiredLogos!({ carbon_calculation_method: 'actual' })).toEqual([]);
    expect(ironSteelTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
