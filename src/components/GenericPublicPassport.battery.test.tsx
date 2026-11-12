/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * See LICENSE and NOTICE files for details.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n/config';
import { GenericPublicPassport } from './GenericPublicPassport';

function renderBattery(category_data: Record<string, unknown>, lang = 'en') {
  return render(
    <MemoryRouter>
      <GenericPublicPassport
        category="battery"
        isPreview
        previewLanguage={lang}
        passport={{
          name: 'Battery passport',
          image_url: null,
          description: null,
          category_data,
          updated_at: '2026-11-09T00:00:00.000Z',
        }}
      />
    </MemoryRouter>,
  );
}

describe('Battery public passport (Regulation (EU) 2023/1542)', () => {
  it('shows public Annex XIII data', () => {
    renderBattery({ product_name: 'PowerPack 48V', rated_capacity_ah: 20, battery_chemistry: 'li_lfp' });
    expect(screen.getAllByText('PowerPack 48V').length).toBeGreaterThan(0);
    expect(screen.getByText('Rated capacity (Ah)')).toBeInTheDocument();
    expect(screen.getByText('Lithium-ion, LFP (lithium iron phosphate)')).toBeInTheDocument();
  });

  it('never renders restricted fields even if they reach the client', () => {
    renderBattery({
      product_name: 'PowerPack 48V',
      battery_detailed_composition: 'SECRET cathode recipe',
      battery_test_reports: 'SECRET test report',
      battery_state_of_health: 87,
    });
    expect(screen.queryByText('SECRET cathode recipe')).toBeNull();
    expect(screen.queryByText('SECRET test report')).toBeNull();
    expect(screen.queryByText('87')).toBeNull();
  });

  it('shows the restricted-access notice with the manufacturer contact', () => {
    renderBattery({ product_name: 'PowerPack 48V', manufacturer_email: 'passport@example.com' });
    const notice = screen.getByTestId('restricted-access-notice');
    expect(notice.textContent).toContain('passport@example.com');
    expect(notice.textContent).toContain('legitimate interest');
  });

  it('falls back to "contact the manufacturer" without an email', () => {
    renderBattery({ product_name: 'PowerPack 48V' });
    expect(screen.getByTestId('restricted-access-notice').textContent).toContain('contact the manufacturer');
  });

  it('does not show the notice for categories without restricted data', () => {
    render(
      <MemoryRouter>
        <GenericPublicPassport
          category="other"
          isPreview
          previewLanguage="en"
          passport={{ name: 'Thing', image_url: null, description: null, category_data: {}, updated_at: '2026-11-09T00:00:00.000Z' }}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('restricted-access-notice')).toBeNull();
  });
});
