import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CarCleaningPublicPassport } from './CarCleaningPublicPassport';
import { CategoryQuestions } from '@/components/CategoryQuestions';
import { validCleaner } from './testFixtures';

vi.mock('@/hooks/useAutoTranslate', () => ({ useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn(), isUserEdited: vi.fn() }) }));

type Dictionary = { carCleaning: { publicTitle: string; downloadJson: string; noticeTitle: string; validationTitle: string; fields: Record<string, string>; sections: Record<string, string> }; common: { language: string } };
const bundles = import.meta.glob('../../i18n/locales/*.json', { eager: true, import: 'default' }) as Record<string, Dictionary>;

describe('Rounds 1 and 4: actual components in every supported locale', () => {
  for (const [path, dictionary] of Object.entries(bundles)) {
    const locale = path.split('/').pop()!.replace('.json', '');
    const instance = async () => {
      const i18n = createInstance();
      await i18n.use(initReactI18next).init({ lng: locale, fallbackLng: false, resources: { [locale]: { translation: dictionary } }, interpolation: { escapeValue: false } });
      return i18n;
    };
    it(`${locale}: public labels, language control, export and source translation`, async () => {
      const i18n = await instance();
      const name = `QA ${locale}`;
      const { container } = render(<I18nextProvider i18n={i18n}><MemoryRouter><CarCleaningPublicPassport passport={{ name: 'INTERNAL RECORD', category_data: { ...validCleaner, product_name_translations: { [locale]: name } } }} /></MemoryRouter></I18nextProvider>);
      expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
      expect(screen.getByText(dictionary.carCleaning.fields.manufacturer_name)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: dictionary.carCleaning.downloadJson })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: dictionary.common.language })).toBeInTheDocument();
      expect(container.querySelector(`[lang="${locale}"]`)).toBeInTheDocument();
      expect(container.textContent).not.toMatch(/carCleaning\.[a-z]|INTERNAL RECORD/);
    });
    it(`${locale}: conditional editor labels and validation are translated`, async () => {
      const i18n = await instance();
      const { container } = render(<I18nextProvider i18n={i18n}><CategoryQuestions category="car_cleaning" data={{ ...validCleaner, clp_classification: 'health_physical', pcn_applicability: 'required', sds_requirement: 'required' }} onChange={vi.fn()} /></I18nextProvider>);
      expect(screen.getByText(dictionary.carCleaning.validationTitle)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: new RegExp(dictionary.carCleaning.fields.product_kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeInTheDocument();
      expect(screen.getByLabelText(new RegExp(dictionary.carCleaning.fields.ufi_code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))).toBeInTheDocument();
      const links = within(container).getAllByRole('button');
      expect(links.some(button => button.textContent === dictionary.carCleaning.fields.ufi_code)).toBe(true);
      expect(container.textContent).not.toMatch(/carCleaning\.[a-z]/);
    });
  }
});
