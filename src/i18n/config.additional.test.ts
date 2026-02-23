import { describe, it, expect } from 'vitest';
import { supportedLanguages } from './config';

describe('supportedLanguages', () => {
  it('has 24 entries (all official EU languages)', () => {
    expect(supportedLanguages).toHaveLength(24);
  });

  it('each entry has code, name, nativeName', () => {
    for (const lang of supportedLanguages) {
      expect(lang.code).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
    }
  });

  it('no duplicate codes', () => {
    const codes = supportedLanguages.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all codes are 2-letter ISO 639-1', () => {
    for (const lang of supportedLanguages) {
      expect(lang.code).toMatch(/^[a-z]{2}$/);
    }
  });

  it('includes English as default', () => {
    const en = supportedLanguages.find(l => l.code === 'en');
    expect(en).toBeDefined();
    expect(en!.name).toBe('English');
  });

  it('includes all major EU languages', () => {
    const codes = supportedLanguages.map(l => l.code);
    for (const c of ['en', 'fr', 'de', 'es', 'it', 'pl', 'nl', 'pt']) {
      expect(codes).toContain(c);
    }
  });
});
