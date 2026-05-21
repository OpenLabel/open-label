/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fb?: string) => (typeof fb === 'string' ? fb || k : k),
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { ai_enabled: true } }),
}));

import { ToyAIAutofill } from './ToyAIAutofill';

describe('ToyAIAutofill', () => {
  it('renders autofill button when AI enabled', () => {
    render(<ToyAIAutofill onAutofill={vi.fn()} />);
    expect(screen.getByText('ai.autofillButton')).toBeInTheDocument();
  });

  it('shows experimental badge', () => {
    render(<ToyAIAutofill onAutofill={vi.fn()} />);
    expect(screen.getAllByText('ai.experimental').length).toBeGreaterThan(0);
  });

  it('opens dialog on button click', () => {
    render(<ToyAIAutofill onAutofill={vi.fn()} />);
    fireEvent.click(screen.getByText('ai.autofillButton'));
    // Scanner title falls back to ai.scannerTitle via t() second-arg fallback
    expect(screen.getByText(/Snap or upload a picture/i)).toBeInTheDocument();
  });

  it('shows upload area in dialog', () => {
    render(<ToyAIAutofill onAutofill={vi.fn()} />);
    fireEvent.click(screen.getByText('ai.autofillButton'));
    expect(screen.getByText(/ai.takePhoto/)).toBeInTheDocument();
  });
});
