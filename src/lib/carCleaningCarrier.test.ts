import { describe, expect, it } from 'vitest';
import { buildCarCleaningCarrier, carrierTextLines } from './carCleaningCarrier';

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
});
