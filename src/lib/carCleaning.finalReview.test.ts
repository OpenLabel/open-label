import { describe, expect, it } from 'vitest';
import { matchRoutes } from 'react-router-dom';
import { isPublicPassportPath } from './googleAdsTracking';
import { publicCarCleaningData, validateCarCleaning, visibleCarCleaningQuestions } from './carCleaning';
import { validCleaner } from '@/components/car-cleaning/testFixtures';

describe('Independent final review: passport privacy route matching', () => {
  it.each(['/%70/aabbccdd', '/%50/aabbccdd', '/%70/aabbccdd?ref=PRIVATE', '/%70/aabbccdd?tracking=%'])('protects encoded public passport route %s', path => {
    expect(matchRoutes([{ path: '/p/:slug' }], path)).not.toBeNull();
    expect(isPublicPassportPath(path)).toBe(true);
  });

  it.each(['/passport/new', '/privacy', '/%70assport/new', '/malformed%'])('keeps unrelated or malformed paths stable: %s', path => {
    expect(() => isPublicPassportPath(path)).not.toThrow();
    expect(isPublicPassportPath(path)).toBe(false);
  });
});

describe('Independent final review: supplemental statements without CLP classification', () => {
  it('can preserve EUH208 wording without triggering poison centre or UFI fields', () => {
    const data = {
      ...validCleaner,
      clp_classification: 'none',
      supplemental_statements: 'EUH208: Contains the named sensitiser. May produce an allergic reaction.',
      supplemental_statements_translations: { fr: 'EUH208 : Contient la substance indiquée. Peut produire une réaction allergique.' },
    };
    const visible = visibleCarCleaningQuestions(data);
    expect(visible.some(question => question.id === 'supplemental_statements')).toBe(true);
    expect(visible.some(question => question.id === 'ufi_code')).toBe(false);
    expect(visible.some(question => question.id === 'pcn_applicability')).toBe(false);
    expect(validateCarCleaning(data)).toEqual([]);
    expect(publicCarCleaningData(data)).toMatchObject({
      supplemental_statements: data.supplemental_statements,
      supplemental_statements_translations: data.supplemental_statements_translations,
    });
  });

  it('does not demand supplemental wording on every nonclassified mixture', () => {
    expect(validateCarCleaning(validCleaner)).toEqual([]);
  });
});
