import { describe, it, expect } from 'vitest';
import { EU_LANGUAGES } from './TranslationButton';
import { supportedLanguages } from '@/i18n/config';

describe('EU_LANGUAGES', () => {
  it('has 24 entries', () => {
    expect(EU_LANGUAGES).toHaveLength(24);
  });

  it('no duplicate codes', () => {
    const codes = EU_LANGUAGES.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all codes are 2-letter ISO 639-1', () => {
    for (const lang of EU_LANGUAGES) {
      expect(lang.code).toMatch(/^[a-z]{2}$/);
    }
  });

  it('each entry has code, name, nativeName', () => {
    for (const lang of EU_LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
    }
  });

  it('matches supportedLanguages from i18n config', () => {
    const euCodes = EU_LANGUAGES.map(l => l.code).sort();
    const i18nCodes = supportedLanguages.map(l => l.code).sort();
    expect(euCodes).toEqual(i18nCodes);
  });

  it('native names match between EU_LANGUAGES and supportedLanguages', () => {
    for (const euLang of EU_LANGUAGES) {
      const i18nLang = supportedLanguages.find(l => l.code === euLang.code);
      expect(i18nLang).toBeDefined();
      expect(euLang.nativeName).toBe(i18nLang!.nativeName);
    }
  });
});
