import { describe, it, expect } from 'vitest';
import { ConstructionTemplate, constructionTemplate } from './construction';

describe('ConstructionTemplate', () => {
  it('has correct properties', () => {
    expect(constructionTemplate.id).toBe('construction');
    expect(constructionTemplate.name).toBe('Construction Products');
    expect(constructionTemplate.icon).toBe('🏗️');
    expect(constructionTemplate.description).toContain('CPR');
  });

  it('is an instance of ConstructionTemplate', () => {
    expect(constructionTemplate).toBeInstanceOf(ConstructionTemplate);
  });

  it('has 5 sections', () => {
    expect(constructionTemplate.sections).toHaveLength(5);
  });

  it('has no duplicate question IDs', () => {
    const ids = constructionTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of constructionTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of constructionTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns ce when ce_marked', () => {
    expect(constructionTemplate.getRequiredLogos!({ ce_marked: true })).toContain('ce');
  });

  it('getRequiredLogos returns epd when epd_available', () => {
    expect(constructionTemplate.getRequiredLogos!({ epd_available: true })).toContain('epd');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(constructionTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
