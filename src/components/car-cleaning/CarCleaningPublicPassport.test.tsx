import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { validCleaner } from './testFixtures';

vi.mock('react-i18next', () => ({ useTranslation: () => ({
  t: (key: string, fallback?: string) => fallback || key,
  i18n: { language: 'en', getFixedT: (language: string) => (key: string, fallback?: string) => language === 'fr' && key === 'carCleaning.options.shampoo' ? 'Shampooing automobile' : fallback || key },
}) }));
vi.mock('@/components/DPPLanguagePicker', () => ({ DPPLanguagePicker: () => <div /> }));
import { CarCleaningPublicPassport } from './CarCleaningPublicPassport';

const passport = { name: 'PRIVATE INTERNAL RECORD', category_data: validCleaner, description: '', image_url: null };
const renderPassport = (data: Record<string, unknown> = validCleaner, previewLanguage?: string, description = '') => render(<MemoryRouter><CarCleaningPublicPassport passport={{ ...passport, category_data: data, description }} previewLanguage={previewLanguage} /></MemoryRouter>);

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Car cleaning consumer information', () => {
  it('displays public source values and omits private, hidden and unknown data', () => {
    renderPassport({ ...validCleaner, confidential_formula: 'SECRET FORMULA', ufi_code: 'STALE UFI', eu_operator_name: 'STALE OPERATOR' });
    expect(screen.getByRole('heading', { name: 'QA Car shampoo', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('QA Manufacturer')).toBeInTheDocument();
    expect(screen.queryByText('PRIVATE INTERNAL RECORD')).not.toBeInTheDocument();
    expect(screen.queryByText('SECRET FORMULA')).not.toBeInTheDocument();
    expect(screen.queryByText('STALE UFI')).not.toBeInTheDocument();
    expect(screen.queryByText('STALE OPERATOR')).not.toBeInTheDocument();
    expect(screen.getByText(/23 September 2029/)).toBeInTheDocument();
    expect(screen.getByText(/does not provide the EU registry connection/)).toBeInTheDocument();
  });

  it('uses field translations and localized option labels in preview language', () => {
    renderPassport({ ...validCleaner, product_name_translations: { fr: 'Shampooing public' }, use_instructions_translations: { fr: 'Diluer puis rincer.' } }, 'fr');
    expect(screen.getByRole('heading', { name: 'Shampooing public' })).toBeInTheDocument();
    expect(screen.getByText('Shampooing automobile')).toBeInTheDocument();
    expect(screen.getByText('Diluer puis rincer.')).toBeInTheDocument();
  });

  it('sanitizes rich descriptions and rejects unsafe document URLs', () => {
    renderPassport({ ...validCleaner, ingredients_url: 'javascript:alert(1)' }, undefined, '<p>Safe description</p><img src=x onerror="alert(1)"><script>bad()</script>');
    expect(screen.getByText('Safe description')).toBeInTheDocument();
    expect(document.querySelector('[onerror]')).toBeNull();
    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('downloads public JSON with the same safe data and offers printing', async () => {
    const blobs: Blob[] = [];
    const OriginalURL = URL;
    vi.stubGlobal('URL', class extends OriginalURL {
      static createObjectURL(blob: Blob) { blobs.push(blob); return 'blob:qa'; }
      static revokeObjectURL = vi.fn();
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    renderPassport({ ...validCleaner, confidential_formula: 'SECRET FORMULA' });
    fireEvent.click(screen.getByRole('button', { name: /download public json/i }));
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blobs[0]);
    });
    const exported = JSON.parse(text);
    expect(exported.schema_version).toBe('open-label.car-cleaning.v1');
    expect(exported.category_data.product_name).toBe('QA Car shampoo');
    expect(text).not.toContain('SECRET FORMULA');
    expect(text).not.toContain('PRIVATE INTERNAL RECORD');
    fireEvent.click(screen.getByRole('button', { name: /print product information/i }));
    expect(print).toHaveBeenCalledOnce();
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:qa'));
  });
});
