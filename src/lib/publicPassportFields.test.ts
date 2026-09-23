import { describe, it, expect } from 'vitest';
import {
  isPubliclyVisible,
  sectionHasPublicData,
  resolveDisplayValue,
  resolveFieldValue,
} from './publicPassportFields';
import type { TemplateQuestion, TemplateSection } from '@/templates/base';

const t = (key: string, fallback?: string) => fallback ?? key;

const internalQ: TemplateQuestion = {
  id: 'audit_certificate_file',
  label: 'Audit certificate',
  type: 'file',
  internal: true,
};

const publicQ: TemplateQuestion = {
  id: 'brand',
  label: 'Brand',
  type: 'text',
};

const multiQ: TemplateQuestion = {
  id: 'certifications',
  label: 'Certifications',
  type: 'multi_select',
  options: [
    { value: 'gots', label: 'GOTS' },
    { value: 'oeko_tex', label: 'OEKO-TEX' },
  ],
};

describe('isPubliclyVisible', () => {
  it('excludes internal questions', () => {
    expect(isPubliclyVisible(internalQ)).toBe(false);
  });
  it('includes normal questions', () => {
    expect(isPubliclyVisible(publicQ)).toBe(true);
  });
});

describe('sectionHasPublicData', () => {
  it('reports no public data when only internal fields are filled', () => {
    const section: TemplateSection = {
      title: 'Evidence',
      questions: [internalQ],
    };
    expect(sectionHasPublicData(section, { audit_certificate_file: 'x/y.pdf' })).toBe(false);
  });

  it('reports public data when a visible field is filled', () => {
    const section: TemplateSection = {
      title: 'Mixed',
      questions: [internalQ, publicQ],
    };
    expect(
      sectionHasPublicData(section, { audit_certificate_file: 'x/y.pdf', brand: 'Acme' }),
    ).toBe(true);
  });

  it('ignores empty values', () => {
    const section: TemplateSection = { title: 'Empty', questions: [publicQ] };
    expect(sectionHasPublicData(section, { brand: '' })).toBe(false);
  });
});

describe('resolveDisplayValue', () => {
  it('returns null for empty values', () => {
    expect(resolveDisplayValue(publicQ, '', t)).toBeNull();
    expect(resolveDisplayValue(publicQ, null, t)).toBeNull();
    expect(resolveDisplayValue(publicQ, undefined, t)).toBeNull();
  });

  it('handles booleans', () => {
    expect(resolveDisplayValue(publicQ, true, t)).toBe('common.yes');
    expect(resolveDisplayValue(publicQ, false, t)).toBe('common.no');
  });

  it('resolves select option labels', () => {
    const q: TemplateQuestion = {
      id: 's',
      label: 'S',
      type: 'select',
      options: [{ value: 'a', label: 'Alpha' }],
    };
    expect(resolveDisplayValue(q, 'a', t)).toBe('Alpha');
  });

  it('resolves multi_select values to labels, not raw codes', () => {
    expect(resolveDisplayValue(multiQ, ['gots', 'oeko_tex'], t)).toBe('GOTS, OEKO-TEX');
  });

  it('falls back to the raw string for unknown multi_select values', () => {
    expect(resolveDisplayValue(multiQ, ['gots', 'mystery'], t)).toBe('GOTS, mystery');
  });

  it('returns null for an empty array', () => {
    expect(resolveDisplayValue(multiQ, [], t)).toBeNull();
  });

  it('stringifies other values', () => {
    expect(resolveDisplayValue(publicQ, 42, t)).toBe('42');
  });
});
