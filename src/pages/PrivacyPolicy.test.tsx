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

import PrivacyPolicy from './PrivacyPolicy';

describe('PrivacyPolicy page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('shows all sections', () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText('1. Introduction')).toBeInTheDocument();
    expect(screen.getByText('8. Changes to This Policy')).toBeInTheDocument();
  });

  it('shows company info', () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText('Test Co')).toBeInTheDocument();
  });

  it('shows footer links', () => {
    render(<MemoryRouter><PrivacyPolicy /></MemoryRouter>);
    expect(screen.getByText('Legal Mentions')).toBeInTheDocument();
  });
});
