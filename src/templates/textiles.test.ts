import { describe, it, expect } from 'vitest';
import { TextilesTemplate, textilesTemplate } from './textiles';

describe('TextilesTemplate', () => {
  it('has correct properties', () => {
    expect(textilesTemplate.id).toBe('textiles');
    expect(textilesTemplate.name).toBe('Textiles');
    expect(textilesTemplate.icon).toBe('👕');
  });

  it('is an instance of TextilesTemplate', () => {
    expect(textilesTemplate).toBeInstanceOf(TextilesTemplate);
  });

  it('has 6 sections', () => {
    expect(textilesTemplate.sections).toHaveLength(6);
  });

  it('has no duplicate question IDs', () => {
    const ids = textilesTemplate.sections.flatMap(s => s.questions.map(q => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have valid types', () => {
    const validTypes = ['text', 'textarea', 'select', 'checkbox', 'number'];
    for (const s of textilesTemplate.sections) {
      for (const q of s.questions) {
        expect(validTypes).toContain(q.type);
      }
    }
  });

  it('select questions have options', () => {
    for (const s of textilesTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select') {
          expect(q.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('getRequiredLogos returns correct logos', () => {
    expect(textilesTemplate.getRequiredLogos!({})).toEqual([]);
    expect(textilesTemplate.getRequiredLogos!({ gots_certified: true })).toContain('gots');
    expect(textilesTemplate.getRequiredLogos!({ oeko_tex: true })).toContain('oeko-tex');
    expect(textilesTemplate.getRequiredLogos!({ grs_certified: true })).toContain('grs');
    expect(textilesTemplate.getRequiredLogos!({ bluesign_certified: true })).toContain('bluesign');
    expect(textilesTemplate.getRequiredLogos!({ fair_trade_certified: true })).toContain('fair-trade');
    expect(textilesTemplate.getRequiredLogos!({ made_in_eu: true })).toContain('made-in-eu');
  });

  it('getRequiredLogos returns all logos when all certifications present', () => {
    const logos = textilesTemplate.getRequiredLogos!({
      gots_certified: true, oeko_tex: true, grs_certified: true,
      bluesign_certified: true, fair_trade_certified: true, made_in_eu: true,
    });
    expect(logos).toHaveLength(6);
  });
});
