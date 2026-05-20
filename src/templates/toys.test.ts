import { describe, it, expect } from 'vitest';
import { ToysTemplate, toysTemplate, TOY_CATEGORIES, TOY_LEGISLATION } from './toys';
import { evaluateShowWhen } from './base';

describe('ToysTemplate', () => {
  it('has correct identity', () => {
    expect(toysTemplate.id).toBe('toys');
    expect(toysTemplate.name).toBe('Toys');
    expect(toysTemplate.icon).toBe('🧸');
    expect(toysTemplate.description).toContain('2025/2509');
  });

  it('is an instance of ToysTemplate', () => {
    expect(toysTemplate).toBeInstanceOf(ToysTemplate);
  });

  it('has all expected sections', () => {
    const titles = toysTemplate.sections.map((s) => s.title);
    expect(titles).toContain('Product identity');
    expect(titles).toContain('Manufacturer');
    expect(titles).toContain('Compliance');
    expect(titles).toContain('Allergenic fragrances');
    expect(titles).toContain('Safety incident reporting');
  });

  it('has no duplicate question IDs', () => {
    const ids = toysTemplate.sections.flatMap((s) => s.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('select questions have options', () => {
    for (const s of toysTemplate.sections) {
      for (const q of s.questions) {
        if (q.type === 'select' || q.type === 'multi_select') {
          // fragrance picker has empty options (custom component renders)
          if (q.id === 'allergenic_fragrances') continue;
          expect(q.options && q.options.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('TSR pre-selected as default legislation', () => {
    const q = toysTemplate.sections
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'applicable_legislation');
    expect(q?.defaultValue).toEqual(['TSR']);
  });

  it('auth rep fields are hidden when has_auth_rep is no', () => {
    const q = toysTemplate.sections
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'auth_rep_legal_name');
    expect(evaluateShowWhen(q?.showWhen, { has_auth_rep: 'no' })).toBe(false);
    expect(evaluateShowWhen(q?.showWhen, { has_auth_rep: 'yes' })).toBe(true);
  });

  it('safety_email shown only when email channel selected', () => {
    const q = toysTemplate.sections
      .flatMap((s) => s.questions)
      .find((q) => q.id === 'safety_email');
    expect(
      evaluateShowWhen(q?.showWhen, { safety_channels: ['phone'] }),
    ).toBe(false);
    expect(
      evaluateShowWhen(q?.showWhen, { safety_channels: ['email', 'phone'] }),
    ).toBe(true);
  });

  it('getRequiredLogos returns ce when ce_marked', () => {
    expect(toysTemplate.getRequiredLogos!({ ce_marked: true })).toContain('ce');
    expect(toysTemplate.getRequiredLogos!({})).toEqual([]);
  });

  it('TOY_CATEGORIES includes mandatory entries', () => {
    const values = TOY_CATEGORIES.map((c) => c.value);
    expect(values).toContain('plush');
    expect(values).toContain('electronic');
    expect(values).toContain('other');
  });

  it('TOY_LEGISLATION includes Toy Safety Regulation', () => {
    expect(TOY_LEGISLATION.find((l) => l.value === 'TSR')).toBeTruthy();
  });
});
