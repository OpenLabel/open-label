import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test Co', company_address: '123 Test St' },
    loading: false,
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

import Terms from './Terms';

describe('Terms page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Terms /></MemoryRouter>);
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
  });

  it('shows all sections', () => {
    render(<MemoryRouter><Terms /></MemoryRouter>);
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('2. Open Source License')).toBeInTheDocument();
    expect(screen.getByText('15. Contact')).toBeInTheDocument();
  });

  it('displays company info', () => {
    render(<MemoryRouter><Terms /></MemoryRouter>);
    expect(screen.getByText('Test Co')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    render(<MemoryRouter><Terms /></MemoryRouter>);
    expect(screen.getByText('Legal Mentions')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });
});
