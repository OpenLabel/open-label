import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({
    config: { company_name: 'Test Co', company_address: '123 Test St', privacy_policy_url: '/privacy', terms_conditions_url: '/terms' },
    loading: false,
  }),
  SiteConfigProvider: ({ children }: any) => children,
}));

import LegalMentions from './LegalMentions';

describe('LegalMentions page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><LegalMentions /></MemoryRouter>);
    expect(screen.getByText('Legal Mentions')).toBeInTheDocument();
  });

  it('shows company name', () => {
    render(<MemoryRouter><LegalMentions /></MemoryRouter>);
    expect(screen.getByText('Test Co')).toBeInTheDocument();
  });

  it('shows company address', () => {
    render(<MemoryRouter><LegalMentions /></MemoryRouter>);
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
  });

  it('shows legal documents links', () => {
    render(<MemoryRouter><LegalMentions /></MemoryRouter>);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
  });

  it('shows about section', () => {
    render(<MemoryRouter><LegalMentions /></MemoryRouter>);
    expect(screen.getByText('About This Service')).toBeInTheDocument();
  });
});
