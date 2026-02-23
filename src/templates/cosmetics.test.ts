import { describe, it, expect } from 'vitest';
import { CosmeticsTemplate, cosmeticsTemplate } from './cosmetics';

describe('CosmeticsTemplate', () => {
  it('has correct properties', () => {
    expect(cosmeticsTemplate.id).toBe('cosmetics');
    expect(cosmeticsTemplate.name).toBe('Cosmetics');
    expect(cosmeticsTemplate.icon).toBe('💄');
  });

  it('is an instance of CosmeticsTemplate', () => {
    expect(cosmeticsTemplate).toBeInstanceOf(CosmeticsTemplate);
  });

  it('has 7 sections', () => {
    expect(cosmeticsTemplate.sections).toHaveLength(7);
  });

  it('has no duplicate question IDs', () => {
    const ids = cosmeticsTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of cosmeticsTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of cosmeticsTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns correct logos', () => {
    expect(cosmeticsTemplate.getRequiredLogos!({})).toEqual([]);
    expect(cosmeticsTemplate.getRequiredLogos!({ cruelty_free: true })).toContain('leaping-bunny');
    expect(cosmeticsTemplate.getRequiredLogos!({ vegan: true })).toContain('vegan');
    expect(cosmeticsTemplate.getRequiredLogos!({ organic_certified: true })).toContain('cosmos');
  });
});
