import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: string) => d || k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: { invoke: vi.fn() },
  },
}));

import { CounterfeitProtection } from './CounterfeitProtection';

describe('CounterfeitProtection', () => {
  it('renders disabled state', () => {
    render(
      <CounterfeitProtection
        passportName="Test"
        passportSlug="slug"
        userEmail="test@test.com"
        enabled={false}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Add Counterfeit Protection (optional)')).toBeInTheDocument();
  });

  it('renders enabled state', () => {
    render(
      <CounterfeitProtection
        passportName="Test"
        passportSlug="slug"
        userEmail="test@test.com"
        enabled={true}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Counterfeit Protection Enabled')).toBeInTheDocument();
  });

  it('shows disable button when enabled', () => {
    render(
      <CounterfeitProtection
        passportName="Test"
        passportSlug="slug"
        userEmail="test@test.com"
        enabled={true}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Disable')).toBeInTheDocument();
  });
});
