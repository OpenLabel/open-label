import { describe, it, expect } from 'vitest';
import type { TemplateQuestion, TemplateSection, CategoryTemplate } from './base';
import { BaseTemplate, evaluateShowWhen } from './base';

describe('base template types', () => {
  it('accepts the base set of question types', () => {
    const q: TemplateQuestion = { id: 't', label: 'T', type: 'text' };
    expect(q.type).toBe('text');
    const m: TemplateQuestion = {
      id: 'm',
      label: 'M',
      type: 'multi_select',
      options: [{ value: 'a', label: 'A' }],
    };
    expect(m.type).toBe('multi_select');
  });

  it('accepts showWhen and badge', () => {
    const q: TemplateQuestion = {
      id: 'x',
      label: 'X',
      type: 'text',
      showWhen: { field: 'y', equals: 'yes' },
      badge: 'where_applicable',
    };
    expect(q.showWhen?.equals).toBe('yes');
    expect(q.badge).toBe('where_applicable');
  });

  it('evaluateShowWhen handles undefined (always visible)', () => {
    expect(evaluateShowWhen(undefined, {})).toBe(true);
  });

  it('evaluateShowWhen matches equality', () => {
    expect(
      evaluateShowWhen({ field: 'a', equals: 'yes' }, { a: 'yes' }),
    ).toBe(true);
    expect(
      evaluateShowWhen({ field: 'a', equals: 'yes' }, { a: 'no' }),
    ).toBe(false);
  });

  it('evaluateShowWhen with array of allowed values', () => {
    expect(
      evaluateShowWhen({ field: 'a', equals: ['x', 'y'] }, { a: 'y' }),
    ).toBe(true);
    expect(
      evaluateShowWhen({ field: 'a', equals: ['x', 'y'] }, { a: 'z' }),
    ).toBe(false);
  });

  it('evaluateShowWhen with includes=true on array values', () => {
    expect(
      evaluateShowWhen(
        { field: 'a', equals: 'x', includes: true },
        { a: ['x', 'y'] },
      ),
    ).toBe(true);
    expect(
      evaluateShowWhen(
        { field: 'a', equals: 'z', includes: true },
        { a: ['x', 'y'] },
      ),
    ).toBe(false);
    expect(
      evaluateShowWhen(
        { field: 'a', equals: ['z', 'x'], includes: true },
        { a: ['x'] },
      ),
    ).toBe(true);
  });

  it('TemplateSection accepts questions', () => {
    const s: TemplateSection = { title: 'S', questions: [] };
    expect(s.questions).toEqual([]);
  });

  it('CategoryTemplate accepts getRequiredLogos', () => {
    const tpl: CategoryTemplate = {
      id: 't',
      name: 'T',
      description: 'd',
      icon: '📦',
      sections: [],
      getRequiredLogos: () => ['x'],
    };
    expect(tpl.getRequiredLogos!({})).toEqual(['x']);
  });

  it('BaseTemplate can be extended', () => {
    class Test extends BaseTemplate {
      id = 'x';
      name = 'X';
      description = 'd';
      icon = '🔧';
      sections: TemplateSection[] = [];
    }
    const t = new Test();
    expect(t.id).toBe('x');
  });
});
