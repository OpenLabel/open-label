import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: vi.fn(() => Promise.resolve({ data: { signups: [], total: 0 }, error: null })) },
  },
}));

import ReferralStats from './ReferralStats';

describe('ReferralStats page', () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  it('shows invalid code message for bad codes', () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/referral/bad!code']}>
          <Routes>
            <Route path="/referral/:code" element={<ReferralStats />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Invalid referral code.')).toBeInTheDocument();
  });

  it('renders stats page for valid code', () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/referral/abc123']}>
          <Routes>
            <Route path="/referral/:code" element={<ReferralStats />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText('Referral Stats')).toBeInTheDocument();
  });
});
