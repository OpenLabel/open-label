import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: null,
    loading: false,
    isSetupRequired: true,
    saveConfig: vi.fn(),
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

import Setup from './Setup';

describe('Setup page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByText('Configure Your Instance')).toBeInTheDocument();
  });

  it('shows company name field', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByLabelText(/Company \/ Organization Name/)).toBeInTheDocument();
  });

  it('shows address field', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByLabelText(/Registered Address/)).toBeInTheDocument();
  });

  it('shows email field', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByLabelText(/Sender Email Address/)).toBeInTheDocument();
  });

  it('shows AI features checkbox', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByLabelText('Enable AI features')).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<MemoryRouter><Setup /></MemoryRouter>);
    expect(screen.getByText('Complete Setup')).toBeInTheDocument();
  });
});
