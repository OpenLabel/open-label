/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { describe, it, expect } from 'vitest';
import { TOY_FRAGRANCES } from './toyFragrances';
import { KNOWN_TOY_FRAGRANCE_IDS } from './knownToyFragranceIds';

describe('toyFragrances data integrity', () => {
  it('has no duplicate fragrance IDs', () => {
    const ids = TOY_FRAGRANCES.map((f) => f.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it('every fragrance has non-empty id, name and cas', () => {
    for (const f of TOY_FRAGRANCES) {
      expect(f.id.trim().length).toBeGreaterThan(0);
      expect(f.name.trim().length).toBeGreaterThan(0);
      expect(f.cas.trim().length).toBeGreaterThan(0);
    }
  });

  describe('edge function fragrance sync', () => {
    const frontendIds = new Set(TOY_FRAGRANCES.map((f) => f.id));
    const backendIds = new Set(KNOWN_TOY_FRAGRANCE_IDS);

    it('every frontend fragrance ID exists in the backend KNOWN_TOY_FRAGRANCE_IDS', () => {
      const missing = [...frontendIds].filter((id) => !backendIds.has(id));
      expect(missing).toEqual([]);
    });

    it('every backend KNOWN_TOY_FRAGRANCE_ID exists in the frontend toyFragrances', () => {
      const missing = [...backendIds].filter((id) => !frontendIds.has(id));
      expect(missing).toEqual([]);
    });

    it('lists have the same count', () => {
      expect(KNOWN_TOY_FRAGRANCE_IDS.length).toBe(TOY_FRAGRANCES.length);
    });
  });
});
