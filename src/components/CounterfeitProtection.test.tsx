import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

  it('calls onChange(false) when disable button clicked', () => {
    const onChange = vi.fn();
    render(
      <CounterfeitProtection
        passportName="Test"
        passportSlug="slug"
        userEmail="test@test.com"
        enabled={true}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText('Disable'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('calls onChange(true) locally when no slug', () => {
    const onChange = vi.fn();
    render(
      <CounterfeitProtection
        passportName="Test"
        passportSlug={null}
        userEmail="test@test.com"
        enabled={false}
        onChange={onChange}
      />
    );
    // Click the enable button
    const enableBtn = screen.getByRole('button');
    fireEvent.click(enableBtn);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
