import { describe, it, expect } from 'vitest';
import { DetergentsTemplate, detergentsTemplate } from './detergents';

describe('DetergentsTemplate', () => {
  it('has correct properties', () => {
    expect(detergentsTemplate.id).toBe('detergents');
    expect(detergentsTemplate.name).toBe('Detergents & Chemicals');
    expect(detergentsTemplate.icon).toBe('🧴');
  });

  it('is an instance of DetergentsTemplate', () => {
    expect(detergentsTemplate).toBeInstanceOf(DetergentsTemplate);
  });

  it('has 7 sections', () => {
    expect(detergentsTemplate.sections).toHaveLength(7);
  });

  it('has no duplicate question IDs', () => {
    const ids = detergentsTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of detergentsTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('getRequiredLogos returns eu-ecolabel when eco_label', () => {
    expect(detergentsTemplate.getRequiredLogos!({ eco_label: true })).toContain('eu-ecolabel');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(detergentsTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
