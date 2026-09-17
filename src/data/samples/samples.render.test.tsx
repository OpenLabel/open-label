/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

/**
 * (d) Rendering half of the demo sample suite. Lives in its own .tsx file
 * because samples.test.ts is JSX-free.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => (typeof fallback === 'string' ? fallback : k),
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
    },
    from: () => ({ select: vi.fn(), insert: vi.fn() }),
    functions: { invoke: vi.fn() },
  },
}));

import Demo, { getDemoCategories } from '@/pages/Demo';
import { getSamplePassport } from './index';

function renderDemo(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/demo/:category" element={<Demo />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Demo page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders one tab per sampled active category', () => {
    renderDemo('/demo/wine');
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(getDemoCategories().length);
  });

  it('switching tabs changes the rendered product name', async () => {
    const user = userEvent.setup();
    renderDemo('/demo/wine');
    expect(await screen.findByText(/Chateau Example 2022/)).toBeInTheDocument();

    const toyTab = screen.getAllByRole('tab').find((t) => /toys/i.test(t.textContent || ''))!;
    await user.click(toyTab);

    await waitFor(() =>
      expect(screen.getByText(getSamplePassport('toys')!().name)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Chateau Example 2022/)).not.toBeInTheDocument();
  });

  it('redirects an unknown category to wine', async () => {
    render(
      <MemoryRouter initialEntries={['/demo/nonexistent']}>
        <Routes>
          <Route path="/demo/:category" element={<Demo />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText(/Chateau Example 2022/)).toBeInTheDocument());
  });

  it('fetches nothing from the backend', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    renderDemo('/demo/textiles');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
