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
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConsentBanner } from './ConsentBanner';
import { CONSENT_STORAGE_KEY } from '@/lib/adsConsent';
import '@/i18n/config';

function mockCountry(loc: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, text: async () => `loc=${loc}` }),
  );
}

function renderBanner(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ConsentBanner />
    </MemoryRouter>,
  );
}

describe('ConsentBanner', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete window.gtag;
    delete window.dataLayer;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the banner to visitors in a regulated region', async () => {
    mockCountry('FR');
    renderBanner();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('never shows anything outside the regulated regions', async () => {
    mockCountry('US');
    renderBanner();
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stores an acceptance and hides the banner', async () => {
    mockCountry('DE');
    renderBanner();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Accept' }));
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('granted');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('stores a rejection with an equally easy control', async () => {
    mockCountry('DE');
    renderBanner();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Reject' }));
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('denied');
  });

  it('lets the visitor change their choice later', async () => {
    mockCountry('DE');
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'denied');
    renderBanner();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Cookie settings' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
