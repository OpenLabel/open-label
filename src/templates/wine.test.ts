import { describe, it, expect } from 'vitest';
import { WineTemplate, wineTemplate, volumeUnits, wineCountries } from './wine';

describe('WineTemplate', () => {
  it('has correct properties', () => {
    expect(wineTemplate.id).toBe('wine');
    expect(wineTemplate.name).toBe('Wine');
    expect(wineTemplate.icon).toBe('🍷');
    expect(wineTemplate.description).toContain('EU Regulation 2021/2117');
  });

  it('has empty sections (uses custom component)', () => {
    expect(wineTemplate.sections).toEqual([]);
  });

  it('getRequiredLogos returns empty array', () => {
    expect(wineTemplate.getRequiredLogos!({})).toEqual([]);
    expect(wineTemplate.getRequiredLogos!({ anything: true })).toEqual([]);
  });

  it('is an instance of WineTemplate', () => {
    expect(wineTemplate).toBeInstanceOf(WineTemplate);
  });
});

describe('volumeUnits', () => {
  it('has ml, cl, L', () => {
    expect(volumeUnits).toHaveLength(3);
    const values = volumeUnits.map(u => u.value);
    expect(values).toContain('ml');
    expect(values).toContain('cl');
    expect(values).toContain('L');
  });

  it('has no duplicate values', () => {
    const values = volumeUnits.map(u => u.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('wineCountries', () => {
  it('has no duplicates', () => {
    expect(new Set(wineCountries).size).toBe(wineCountries.length);
  });

  it('includes major wine-producing countries', () => {
    for (const c of ['France', 'Italy', 'Spain', 'Germany', 'United States', 'Australia', 'Argentina', 'Chile']) {
      expect(wineCountries).toContain(c);
    }
  });

  it('is sorted alphabetically', () => {
    const sorted = [...wineCountries].sort();
    expect(wineCountries).toEqual(sorted);
  });

  it('has no empty strings', () => {
    expect(wineCountries.every(c => c.length > 0)).toBe(true);
  });
});
