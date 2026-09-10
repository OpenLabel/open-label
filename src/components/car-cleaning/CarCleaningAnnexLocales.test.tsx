import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CategoryQuestions } from '@/components/CategoryQuestions';
import { CarCleaningPublicPassport } from './CarCleaningPublicPassport';
import { annexCleaner } from './annexFixtures';

vi.mock('@/hooks/useAutoTranslate', () => ({ useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn(), isUserEdited: vi.fn() }) }));
type Dictionary = { carCleaning: { fields: Record<string, string>; sections: Record<string, string>; dataset: Record<string, string> } };
const bundles = import.meta.glob('../../i18n/locales/*.json', { eager: true, import: 'default' }) as Record<string, Dictionary>;
const data = { ...annexCleaner, microorganisms_added: 'yes', microorganisms: [{ genus: 'Bacillus', species: 'subtilis', strain: 'QA-1' }], microorganism_safety_reference: 'QA Annex II', microorganism_shelf_life: '12 months', food_contact_use: 'no' };

describe('Annex VI actual editors and public datasets in all 25 locales', () => {
  for (const [path, dictionary] of Object.entries(bundles)) {
    const locale = path.split('/').pop()!.replace('.json', '');
    const instance = async () => {
      const i18n = createInstance();
      await i18n.use(initReactI18next).init({ lng: locale, fallbackLng: false, resources: { [locale]: { translation: dictionary } }, interpolation: { escapeValue: false } });
      return i18n;
    };
    it(`${locale}: structured entries, identity and manufacturer responsibility editor`, async () => {
      const i18n = await instance();
      const { container } = render(<I18nextProvider i18n={i18n}><CategoryQuestions category="car_cleaning" data={data} onChange={vi.fn()} /></I18nextProvider>);
      expect(dictionary.carCleaning.dataset).toBeDefined();
      expect(screen.getByLabelText(dictionary.carCleaning.dataset.chemical_name)).toHaveValue('Water');
      expect(screen.getByLabelText(dictionary.carCleaning.dataset.genus)).toHaveValue('Bacillus');
      expect(screen.getByLabelText(dictionary.carCleaning.fields.manufacturer_responsibility)).toBeChecked();
      expect(container.textContent).not.toMatch(/carCleaning\.[a-z]/);
    });
    it(`${locale}: public full substance list and microorganism identities`, async () => {
      const i18n = await instance();
      const { container } = render(<I18nextProvider i18n={i18n}><MemoryRouter><CarCleaningPublicPassport passport={{ name: 'INTERNAL', category_data: data }} /></MemoryRouter></I18nextProvider>);
      expect(screen.getByRole('heading', { name: dictionary.carCleaning.sections.annex_substances })).toBeInTheDocument();
      expect(screen.getByText('Water')).toBeInTheDocument();
      expect(screen.getByText('7732-18-5')).toBeInTheDocument();
      expect(screen.getByText('Bacillus')).toBeInTheDocument();
      expect(screen.getByText('QA-1')).toBeInTheDocument();
      expect(container.textContent).not.toMatch(/carCleaning\.[a-z]|INTERNAL/);
    });
  }
});
