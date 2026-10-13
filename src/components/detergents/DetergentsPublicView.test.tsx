import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@/i18n/config';
import { buildSampleDetergentsPassport } from '@/data/samples/detergents';
import { buildSampleTextilesPassport } from '@/data/samples/textiles';

vi.mock('@/hooks/useSiteConfig', () => ({
  useSiteConfig: () => ({ config: { company_name: 'Test Operator' }, loading: false }),
  SiteConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { PublicPassportView } from '@/components/PublicPassportView';

const toPassport = (p: ReturnType<typeof buildSampleDetergentsPassport>) => ({
  name: p.name,
  image_url: p.image_url,
  description: p.description,
  category_data: p.category_data as Record<string, unknown>,
  updated_at: '2026-10-13T00:00:00.000Z',
});

describe('PublicPassportView routing', () => {
  it('renders the Detergents page for the detergents category', () => {
    render(
      <MemoryRouter>
        <PublicPassportView category="detergents" passport={toPassport(buildSampleDetergentsPassport())} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Detergents: Digital Product Passport', { exact: false })).toBeInTheDocument();
  });

  it('still renders the Apparel page for the textiles category', () => {
    render(
      <MemoryRouter>
        <PublicPassportView category="textiles" passport={toPassport(buildSampleTextilesPassport())} />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Detergents: Digital Product Passport', { exact: false })).not.toBeInTheDocument();
    expect(screen.getByText(/Sample Cotton T-Shirt/)).toBeInTheDocument();
  });
});
