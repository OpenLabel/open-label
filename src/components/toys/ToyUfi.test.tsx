/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import '@/i18n/config';
import { evaluateShowWhen } from '@/templates/base';
import { toysTemplate, UFI_FORMAT_REGEX } from '@/templates/toys';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test Operator', setup_complete: true, site_url: '' },
    loading: false,
    isSetupRequired: false,
    refetch: vi.fn(),
    saveConfig: vi.fn(),
  }),
  SiteConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { ToyPublicPassport } from './ToyPublicPassport';

const VALID = 'N1QV-R02N-J00M-WQDU';
const ufiQuestion = toysTemplate.sections
  .flatMap((s) => s.questions)
  .find((q) => q.id === 'ufi_code')!;

describe('Toys UFI field', () => {
  it('sits in product_identity right after public_instructions_warnings', () => {
    const sec = toysTemplate.sections.find((s) => s.id === 'product_identity')!;
    const ids = sec.questions.map((q) => q.id);
    expect(ids[ids.indexOf('public_instructions_warnings') + 1]).toBe('ufi_code');
    expect(ufiQuestion.required).toBe(false);
    expect(ufiQuestion.badge).toBe('where_applicable');
    expect(ufiQuestion.labelKey).toBe('toys.fields.ufi_code.label');
    expect(ufiQuestion.helpKey).toBe('toys.fields.ufi_code.help');
    expect(ufiQuestion.placeholderKey).toBe('toys.fields.ufi_code.placeholder');
  });

  it.each(['chemical_set', 'slime', 'arts_crafts'])('is shown for %s', (cat) => {
    expect(evaluateShowWhen(ufiQuestion.showWhen, { toy_category: cat })).toBe(true);
  });

  it.each(['plush', 'other', undefined])('is hidden for %s', (cat) => {
    expect(evaluateShowWhen(ufiQuestion.showWhen, { toy_category: cat })).toBe(false);
  });

  it('accepts a valid UFI containing U', () => {
    expect(UFI_FORMAT_REGEX.test(VALID)).toBe(true);
    expect(
      toysTemplate.getInlineWarnings({ toy_category: 'slime', ufi_code: VALID }),
    ).toEqual([]);
  });

  it.each(['B', 'I', 'L', 'O', 'Z'])('rejects a UFI containing %s with a warning', (ch) => {
    const code = `N1QV-R02N-J00M-WQD${ch}`;
    expect(UFI_FORMAT_REGEX.test(code)).toBe(false);
    const w = toysTemplate.getInlineWarnings({ toy_category: 'slime', ufi_code: code });
    expect(w).toHaveLength(1);
    expect(w[0].fieldId).toBe('ufi_code');
    expect(w[0].messageKey).toBe('toys.warnings.ufiFormat');
  });

  it('never blocks saving: the field is optional and the warning is not a required-field error', () => {
    const data = { toy_category: 'slime', ufi_code: 'BAD' };
    expect(toysTemplate.getInlineWarnings(data)).toHaveLength(1);
    const missing = toysTemplate.getMissingRequiredFields
      ? toysTemplate.getMissingRequiredFields(data).map((m: { id?: string } | string) =>
          typeof m === 'string' ? m : m.id,
        )
      : [];
    expect(missing).not.toContain('ufi_code');
  });
});

function renderToy(category_data: Record<string, unknown>) {
  return render(
    <MemoryRouter>
      <ToyPublicPassport
        passport={{
          name: 'Toy',
          image_url: null,
          description: null,
          category_data,
          updated_at: '2026-10-30T00:00:00.000Z',
        }}
      />
    </MemoryRouter>,
  );
}

describe('Toy public passport UFI', () => {
  it.each(['chemical_set', 'slime', 'arts_crafts'])('shows the UFI for %s', (cat) => {
    renderToy({ toy_category: cat, ufi_code: VALID });
    expect(screen.getByTestId('toy-public-ufi').textContent).toBe(`UFI: ${VALID}`);
  });

  it('hides a stale UFI for other categories', () => {
    renderToy({ toy_category: 'plush', ufi_code: VALID });
    expect(screen.queryByTestId('toy-public-ufi')).toBeNull();
  });

  it('hides the UFI row when empty', () => {
    renderToy({ toy_category: 'slime', ufi_code: '' });
    expect(screen.queryByTestId('toy-public-ufi')).toBeNull();
  });
});

describe('Toys UFI translations', () => {
  const dir = resolve(__dirname, '../../i18n/locales');
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const get = (o: unknown, path: string) =>
    path.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o);
  const keys = [
    'toys.fields.ufi_code.label',
    'toys.fields.ufi_code.help',
    'toys.fields.ufi_code.placeholder',
    'toys.warnings.ufiFormat',
    'toyPublic.rows.ufi',
  ];

  it('covers all 25 locales', () => {
    expect(files).toHaveLength(25);
  });

  it.each(files)('%s has every new key, with no em dashes', (f) => {
    const json = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
    for (const k of keys) {
      const v = get(json, k);
      expect(typeof v, `${f} ${k}`).toBe('string');
      expect((v as string).trim().length).toBeGreaterThan(0);
      expect(v as string).not.toContain('\u2014');
    }
  });
});
