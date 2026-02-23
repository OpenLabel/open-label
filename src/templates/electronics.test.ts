import { describe, it, expect } from 'vitest';
import { ElectronicsTemplate, electronicsTemplate } from './electronics';

describe('ElectronicsTemplate', () => {
  it('has correct properties', () => {
    expect(electronicsTemplate.id).toBe('electronics');
    expect(electronicsTemplate.name).toBe('Electronics & ICT');
    expect(electronicsTemplate.icon).toBe('📱');
  });

  it('is an instance of ElectronicsTemplate', () => {
    expect(electronicsTemplate).toBeInstanceOf(ElectronicsTemplate);
  });

  it('has 7 sections', () => {
    expect(electronicsTemplate.sections).toHaveLength(7);
  });

  it('has no duplicate question IDs', () => {
    const ids = electronicsTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of electronicsTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of electronicsTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns weee when weee_compliant', () => {
    expect(electronicsTemplate.getRequiredLogos!({ weee_compliant: true })).toContain('weee');
  });

  it('getRequiredLogos returns eu-energy when energy_class set', () => {
    expect(electronicsTemplate.getRequiredLogos!({ energy_class: 'A' })).toContain('eu-energy');
  });

  it('getRequiredLogos returns empty for no data', () => {
    expect(electronicsTemplate.getRequiredLogos!({})).toEqual([]);
  });
});
