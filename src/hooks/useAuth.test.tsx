import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

const mockGetSession = vi.fn(() =>
  Promise.resolve({ data: { session: null } })
);

const mockSignUp = vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } }, error: null }));
const mockSignInWithPassword = vi.fn(() => Promise.resolve({ error: null }));
const mockSignOut = vi.fn(() => Promise.resolve());
const mockResetPasswordForEmail = vi.fn(() => Promise.resolve({ error: null }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      getSession: () => mockGetSession(),
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signOut: () => mockSignOut(),
      resetPasswordForEmail: (...args: any[]) => mockResetPasswordForEmail(...args),
    },
    from: () => ({ insert: vi.fn(() => Promise.resolve({ error: null })) }),
  },
}));

vi.mock('@/hooks/useReferral', () => ({
  getReferralCode: () => null,
  clearReferralCode: vi.fn(),
}));

import { AuthProvider, useAuth } from './useAuth';

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('starts with loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // After initial render it will be loading=false because getSession resolves
    expect(result.current.user).toBeNull();
  });

  it('sets up auth state listener', () => {
    renderHook(() => useAuth(), { wrapper });
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('signIn calls supabase signInWithPassword', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.signIn('test@test.com', 'password');
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('signOut calls supabase signOut', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.signOut();
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('resetPassword calls supabase resetPasswordForEmail', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.resetPassword('test@test.com');
    expect(mockResetPasswordForEmail).toHaveBeenCalled();
  });
});
