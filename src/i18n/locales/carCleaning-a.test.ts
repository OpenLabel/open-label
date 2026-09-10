import { describe, expect, it } from 'vitest';
import en from './en.json';
import bg from './bg.json';
import cs from './cs.json';
import da from './da.json';
import de from './de.json';
import el from './el.json';
import es from './es.json';
import et from './et.json';
import fi from './fi.json';
import fr from './fr.json';
import ga from './ga.json';
import hr from './hr.json';
import hu from './hu.json';

function leaves(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (!value || typeof value !== 'object') return {};
  return Object.assign({}, ...Object.entries(value).map(([key, entry]) => leaves(entry, prefix ? `${prefix}.${key}` : key)));
}

const locales = { bg, cs, da, de, el, es, et, fi, fr, ga, hr, hu };
const categories = {
  bg: 'Продукти за почистване на автомобили', cs: 'Přípravky na čištění automobilů',
  da: 'Bilrengøringsprodukter', de: 'Autoreinigungsprodukte', el: 'Προϊόντα καθαρισμού αυτοκινήτου',
  es: 'Productos de limpieza para automóviles', et: 'Autopuhastustooted', fi: 'Autonpuhdistusaineet',
  fr: 'Produits de nettoyage automobile', ga: 'Táirgí glantacháin carranna',
  hr: 'Proizvodi za čišćenje automobila', hu: 'Autótisztító termékek',
};
const source = leaves(en.carCleaning);

describe('Car cleaning translations, locale group A', () => {
  for (const [locale, dictionary] of Object.entries(locales)) {
    it(`${locale} has complete, localized public and editor content`, () => {
      const data = dictionary as unknown as { carCleaning: Record<string, unknown>; categories: Record<string, string>; categoryDescriptions: Record<string, string> };
      const translated = leaves(data.carCleaning);
      expect(Object.keys(translated).sort()).toEqual(Object.keys(source).sort());
      for (const [key, english] of Object.entries(source)) {
        expect(translated[key], key).toEqual(expect.any(String));
        expect(translated[key].trim().length, key).toBeGreaterThan(0);
        expect(translated[key], key).not.toMatch(/[\u2013\u2014]/);
        if (english.length > 40) expect(translated[key], key).not.toBe(english);
        if (english.includes('YYYY-MM-DD')) expect(translated[key], key).toContain('YYYY-MM-DD');
      }
      expect(data.categories.car_cleaning).toBe(categories[locale as keyof typeof categories]);
      expect(data.categoryDescriptions.car_cleaning).toContain('2029');
      expect(data.categoryDescriptions.car_cleaning).not.toBe(en.categoryDescriptions.car_cleaning);
      expect(translated.noticeBody).toContain('2026/405');
      expect(translated.noticeBody).toContain('648/2004');
      expect(translated.noticeBody).toContain('23');
      expect(translated.noticeBody).toContain('2029');
    });
  }
});
