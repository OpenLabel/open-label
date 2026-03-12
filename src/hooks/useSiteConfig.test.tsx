import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

const mockSelect = vi.fn(() =>
  Promise.resolve({
    data: [
      { key: 'company_name', value: 'Test Corp' },
      { key: 'setup_complete', value: 'true' },
      { key: 'ai_enabled', value: 'true' },
      { key: 'short_url', value: 'https://short.test' },
    ],
    error: null,
  })
);

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => mockSelect(),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    }),
  },
}));

import { SiteConfigProvider, useSiteConfig } from './useSiteConfig';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SiteConfigProvider>{children}</SiteConfigProvider>
);

describe('useSiteConfig', () => {
  it('throws when used outside provider', () => {
    expect(() => {
      renderHook(() => useSiteConfig());
    }).toThrow('useSiteConfig must be used within a SiteConfigProvider');
  });

  it('loads config from database', async () => {
    const { result } = renderHook(() => useSiteConfig(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.config?.company_name).toBe('Test Corp');
    expect(result.current.config?.setup_complete).toBe(true);
  });

  it('isSetupRequired is false when setup_complete is true', async () => {
    const { result } = renderHook(() => useSiteConfig(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.isSetupRequired).toBe(false);
  });

  it('provides default config when no data', async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });
    const { result } = renderHook(() => useSiteConfig(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.config?.company_name).toBe('');
    expect(result.current.config?.setup_complete).toBe(false);
  });

  it('handles errors gracefully', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error('DB error') });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useSiteConfig(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.config?.company_name).toBe('');
    consoleSpy.mockRestore();
  });
});
