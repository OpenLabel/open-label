import { describe, expect, it } from 'vitest';
import { buildCarCleaningCarrier, carCleaningPassportUri, carrierTextLines } from './carCleaningCarrier';

describe('car-cleaning data carrier', () => {
  it('uses a stable HTTPS passport URI and preserves an optional actual structured-data endpoint', () => {
    expect(buildCarCleaningCarrier('https://example.test/p/abcdef0123456789', 'https://api.example.test/functions/v1/export-public-passport?slug=abcdef0123456789')).toEqual({
      passportUri: 'https://example.test/p/abcdef0123456789',
      machineReadableUri: 'https://api.example.test/functions/v1/export-public-passport?slug=abcdef0123456789',
    });
  });

  it.each(['http://example.test/p/abcdef01', 'https://example.test/p/abcdef01?gclid=private', 'https://example.test/p/abcdef01#private', 'https://user:password@example.test/p/abcdef01', 'javascript:alert(1)', 'https://example.test/p/not-saved', 'https://example.test/p/abcdef01/', 'https://localhost/p/abcdef01'])('rejects a noncanonical or nonpublic carrier URI: %s', url => {
    expect(buildCarCleaningCarrier(url)).toBeNull();
  });

  it('does not invent a structured endpoint or accept executable/data URLs', () => {
    expect(buildCarCleaningCarrier('https://example.test/p/abcdef01')).toEqual({ passportUri: 'https://example.test/p/abcdef01' });
    expect(buildCarCleaningCarrier('https://example.test/p/abcdef01', 'javascript:alert(1)')).toBeNull();
  });

  it('wraps the entire readable URI without dropping characters', () => {
    const uri = `https://example.test/p/${'a'.repeat(32)}`;
    const lines = carrierTextLines(uri, 32);
    expect(lines.every(line => line.length <= 32)).toBe(true);
    expect(lines.join('')).toBe(uri);
  });

  it.each(['https://public.example', ' https://public.example/ '])('uses the configured canonical origin %s instead of an authoring host', siteUrl => {
    expect(carCleaningPassportUri(siteUrl, 'https://authoring.example', 'abcdef01')).toBe('https://public.example/p/abcdef01');
  });

  it('uses the current origin only when the confirmed site URL is empty', () => {
    expect(carCleaningPassportUri('', 'https://public.example', 'abcdef01')).toBe('https://public.example/p/abcdef01');
    expect(carCleaningPassportUri(' ', 'http://localhost:5173', 'abcdef01')).toBeNull();
  });

  it.each(['http://public.example', 'https://user:password@public.example', 'https://public.example/path', 'https://public.example/?tracking=1', 'https://public.example/#anchor', 'https://public.example:8443', 'https://localhost', 'not-a-url'])('does not substitute the authoring host for invalid configured origin %s', siteUrl => {
    expect(carCleaningPassportUri(siteUrl, 'https://authoring.example', 'abcdef01')).toBeNull();
  });

  it('does not mint a carrier URI for an unsaved or noncanonical slug', () => {
    expect(carCleaningPassportUri('https://public.example', 'https://authoring.example', '../private')).toBeNull();
  });
});
