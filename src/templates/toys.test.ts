import { describe, it, expect } from 'vitest';
import { ToysTemplate, toysTemplate } from './toys';

describe('ToysTemplate', () => {
  it('has correct properties', () => {
    expect(toysTemplate.id).toBe('toys');
    expect(toysTemplate.name).toBe('Toys');
    expect(toysTemplate.icon).toBe('🧸');
    expect(toysTemplate.description).toContain('EU Regulation 2025/2509');
  });

  it('is an instance of ToysTemplate', () => {
    expect(toysTemplate).toBeInstanceOf(ToysTemplate);
  });

  it('has 7 sections', () => {
    expect(toysTemplate.sections).toHaveLength(7);
  });

  it('has no duplicate question IDs', () => {
    const ids = toysTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of toysTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of toysTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns ce when ce_marked', () => {
    expect(toysTemplate.getRequiredLogos!({ ce_marked: true })).toContain('ce');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(toysTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
