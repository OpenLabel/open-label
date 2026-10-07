/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import i18n from '@/i18n/config';

vi.mock('react-i18next', async (importOriginal) => ({
  ...await importOriginal<typeof import('react-i18next')>(),
  useTranslation: () => ({ t: i18n.getFixedT('fr') }),
}));
vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { ai_enabled: true } }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

import { GarmentAIAutofill } from './GarmentAIAutofill';

describe('Apparel scanner localization', () => {
  it('renders French title, description, and both drag states without English fallback', () => {
    const t = i18n.getFixedT('fr');
    render(<GarmentAIAutofill onAutofill={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(t('ai.autofillButton')) }));
    expect(screen.getByRole('heading', { name: t('apparel.ai.scannerTitle') })).toBeInTheDocument();
    expect(screen.getByText(t('apparel.ai.scannerDescription'))).toBeInTheDocument();
    const hint = screen.getByText(t('ai.dragDropHint'));
    const dropZone = hint.parentElement;
    if (!dropZone) throw new Error('Scanner drop zone missing');
    fireEvent.dragEnter(dropZone);
    expect(screen.getByText(t('ai.dropHere'))).toBeInTheDocument();
    fireEvent.dragLeave(dropZone);
    expect(screen.getByText(t('ai.dragDropHint'))).toBeInTheDocument();
    expect(screen.queryByText('Drag & drop or click')).not.toBeInTheDocument();
    expect(screen.queryByText('↓ Drop here')).not.toBeInTheDocument();
  });
});