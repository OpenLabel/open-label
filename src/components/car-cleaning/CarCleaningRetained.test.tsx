import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarCleaningRetained } from './CarCleaningRetained';
const { eq, from } = vi.hoisted(() => {
  const order = vi.fn().mockResolvedValue({ data: [{ public_slug: 'aabbccdd', withdrawn_at: '2026-09-10T00:00:00Z' }], error: null });
  const not = vi.fn(() => ({ order })); const eq = vi.fn(() => ({ not }));
  return { eq, from: vi.fn(() => ({ select: vi.fn(() => ({ eq })) })) };
});
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner-1' } }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));
describe('Owner access to withdrawn records', () => {
  it('loads the signed-in owner archive on demand and exposes a stable public history link', async () => {
    const { container } = render(<CarCleaningRetained />);
    expect(from).not.toHaveBeenCalled();
    container.querySelector('details')!.open = true;
    fireEvent(container.querySelector('details')!, new Event('toggle'));
    await waitFor(() => expect(screen.getByRole('link', { name: 'aabbccdd' })).toHaveAttribute('href', '/p/aabbccdd'));
    expect(eq).toHaveBeenCalledWith('user_id', 'owner-1');
  });
});
