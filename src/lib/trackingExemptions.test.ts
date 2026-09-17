/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from 'vitest';
import { isTrackingExemptPath } from './trackingExemptions';

describe('isTrackingExemptPath', () => {
  it('exempts the public passport view', () => {
    expect(isTrackingExemptPath('/p/de00000000000001')).toBe(true);
    expect(isTrackingExemptPath('/p/DE00000000000001')).toBe(true);
    expect(isTrackingExemptPath('/p')).toBe(true);
  });

  it('exempts the demo passport view', () => {
    expect(isTrackingExemptPath('/demo')).toBe(true);
    expect(isTrackingExemptPath('/demo/wine')).toBe(true);
    expect(isTrackingExemptPath('/demo/textiles')).toBe(true);
  });

  it('does not exempt other routes', () => {
    for (const path of ['/', '/auth', '/dashboard', '/cypheme/passport', '/privacy-policy', '/passport/new']) {
      expect(isTrackingExemptPath(path)).toBe(false);
    }
  });

  it('handles missing values safely', () => {
    expect(isTrackingExemptPath(null)).toBe(false);
    expect(isTrackingExemptPath(undefined)).toBe(false);
    expect(isTrackingExemptPath('')).toBe(false);
  });
});
