import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

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

// Mock import.meta.env.DEV
vi.stubGlobal('location', { ...window.location, hostname: 'id-preview--test.lovable.app' });

import { BuildStatusBanner } from './BuildStatusBanner';

describe('BuildStatusBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockInvoke.mockReturnValue(new Promise(() => {})); // never resolves
    render(<BuildStatusBanner />);
    expect(screen.getByText(/Checking build status/)).toBeInTheDocument();
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
    // Expand the collapsible
    fireEvent.click(screen.getByText(/Build Quality Check Failed/));
    expect(screen.getByText(/test-a/)).toBeInTheDocument();
    expect(screen.getByText(/test-b/)).toBeInTheDocument();
  });

  it('returns null when status is pass', async () => {
    mockInvoke.mockResolvedValue({
      data: { status: 'pass' },
      error: null,
    });
    const { container } = render(<BuildStatusBanner />);
    await waitFor(() => expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument());
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
