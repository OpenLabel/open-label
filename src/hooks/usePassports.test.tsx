import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

vi.mock('./useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false }),
  AuthProvider: ({ children }: any) => children,
}));

const mockPassports = [
  { id: 'p1', name: 'Wine 1', category: 'wine', user_id: 'u1', display_order: 0 },
  { id: 'p2', name: 'Wine 2', category: 'wine', user_id: 'u1', display_order: 1 },
];

const mockSelect = vi.fn(() => Promise.resolve({ data: mockPassports, error: null }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => mockSelect(),
          single: () => Promise.resolve({ data: mockPassports[0], error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: mockPassports[0], error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockPassports[0], error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { passport: mockPassports[0] }, error: null })),
    },
  },
}));

import { usePassports, usePassportBySlug, usePassportById } from './usePassports';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePassports', () => {
  it('returns passports', async () => {
    const { result } = renderHook(() => usePassports(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.passports).toHaveLength(2);
  });

  it('provides mutation functions', () => {
    const { result } = renderHook(() => usePassports(), { wrapper: createWrapper() });
    expect(result.current.createPassport).toBeDefined();
    expect(result.current.updatePassport).toBeDefined();
    expect(result.current.duplicatePassport).toBeDefined();
    expect(result.current.deletePassport).toBeDefined();
    expect(result.current.reorderPassports).toBeDefined();
  });
});

describe('usePassportBySlug', () => {
  it('returns null when no slug', () => {
    const { result } = renderHook(() => usePassportBySlug(undefined), { wrapper: createWrapper() });
    expect(result.current.data).toBeUndefined();
  });
});

describe('usePassportById', () => {
  it('returns null when no id', () => {
    const { result } = renderHook(() => usePassportById(undefined), { wrapper: createWrapper() });
    expect(result.current.data).toBeUndefined();
  });
});
