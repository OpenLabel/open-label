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

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('@/components/PublicPassportView', () => ({ PublicPassportView: () => <div>view</div> }));

import Demo, { refQuery } from './Demo';

const renderAt = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/demo/:category" element={<Demo />} />
      </Routes>
    </MemoryRouter>,
  );

describe('Demo referral forwarding', () => {
  it('forwards a valid ref code to the signup button', () => {
    renderAt('/demo/car_cleaning?ref=carcleaner');
    expect(screen.getByRole('link', { name: 'demo.cta' })).toHaveAttribute('href', '/auth?ref=carcleaner');
  });

  it('links plainly to signup without a ref code', () => {
    renderAt('/demo/car_cleaning');
    expect(screen.getByRole('link', { name: 'demo.cta' })).toHaveAttribute('href', '/auth');
  });

  it('drops invalid or oversized ref codes', () => {
    expect(refQuery('?ref=bad!code')).toBe('');
    expect(refQuery(`?ref=${'a'.repeat(65)}`)).toBe('');
    expect(refQuery('?ref=flyer2026')).toBe('?ref=flyer2026');
  });
});
