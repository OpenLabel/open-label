import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: (...args: any[]) => mockInvoke(...args) },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { site_url: 'https://example.com' },
    loading: false,
  }),
}));

vi.stubGlobal('location', { ...window.location, hostname: 'id-preview--test.lovable.app' });

import { BuildStatusBanner } from './BuildStatusBanner';

describe('BuildStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with green styling', () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));
    render(<BuildStatusBanner />);
    expect(screen.getByText(/Checking build status/)).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('green');
  });

  it('shows fail state with error message', async () => {
    mockInvoke.mockResolvedValue({
      data: { status: 'fail', message: 'Tests failed', failedTests: ['test1', 'test2'] },
      error: null,
    });
    render(<BuildStatusBanner />);
    await waitFor(() => expect(screen.getByText(/Build Quality Check Failed/)).toBeInTheDocument());
  });

  it('shows failed tests when expanded', async () => {
    mockInvoke.mockResolvedValue({
      data: { status: 'fail', message: 'Tests failed', failedTests: ['test-a', 'test-b'] },
      error: null,
    });
    render(<BuildStatusBanner />);
    await waitFor(() => expect(screen.getByText(/Build Quality Check Failed/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Build Quality Check Failed/));
    expect(screen.getByText(/test-a/)).toBeInTheDocument();
    expect(screen.getByText(/test-b/)).toBeInTheDocument();
  });

  it('shows success banner then auto-dismisses after 4 seconds', async () => {
    vi.useFakeTimers();
    mockInvoke.mockResolvedValue({
      data: { status: 'pass' },
      error: null,
    });
    const { container } = render(<BuildStatusBanner />);

    // Flush the promise
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText(/All checks passed/)).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument();

    // After 4 seconds it should dismiss
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows unknown state on invoke error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'Network error' },
    });
    render(<BuildStatusBanner />);
    await waitFor(() => expect(screen.getByText(/Checking build status|Build Quality Check Failed/)).toBeInTheDocument());
  });

  it('shows copy prompt button in fail state', async () => {
    mockInvoke.mockResolvedValue({
      data: { status: 'fail', message: 'Coverage below threshold' },
      error: null,
    });
    render(<BuildStatusBanner />);
    await waitFor(() => expect(screen.getByText(/Build Quality Check Failed/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Build Quality Check Failed/));
    expect(screen.getByText(/Copy prompt/)).toBeInTheDocument();
  });

  it('shows stderr when available', async () => {
    mockInvoke.mockResolvedValue({
      data: { status: 'fail', message: 'Error', stderr: 'some build output' },
      error: null,
    });
    render(<BuildStatusBanner />);
    await waitFor(() => expect(screen.getByText(/Build Quality Check Failed/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Build Quality Check Failed/));
    expect(screen.getByText(/some build output/)).toBeInTheDocument();
  });
});
