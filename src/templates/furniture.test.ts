import { describe, it, expect } from 'vitest';
import { FurnitureTemplate, furnitureTemplate } from './furniture';

describe('FurnitureTemplate', () => {
  it('has correct properties', () => {
    expect(furnitureTemplate.id).toBe('furniture');
    expect(furnitureTemplate.name).toBe('Furniture & Mattresses');
    expect(furnitureTemplate.icon).toBe('🛋️');
  });

  it('is an instance of FurnitureTemplate', () => {
    expect(furnitureTemplate).toBeInstanceOf(FurnitureTemplate);
  });

  it('has 8 sections', () => {
    expect(furnitureTemplate.sections).toHaveLength(8);
  });

  it('has no duplicate question IDs', () => {
    const ids = furnitureTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of furnitureTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('getRequiredLogos returns correct logos', () => {
    expect(furnitureTemplate.getRequiredLogos!({})).toEqual([]);
    expect(furnitureTemplate.getRequiredLogos!({ fsc_certified: true })).toContain('fsc');
    expect(furnitureTemplate.getRequiredLogos!({ pefc_certified: true })).toContain('pefc');
    expect(furnitureTemplate.getRequiredLogos!({ eudr_compliant: true })).toContain('eudr');
  });
});
