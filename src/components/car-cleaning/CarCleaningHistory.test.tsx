import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarCleaningHistory } from './CarCleaningHistory';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));
describe('Public retained version access', () => {
  it('links immutable versions and keeps withdrawal distinct from an unavailable passport', () => {
    render(<CarCleaningHistory slug="aabbccdd" history={{ product_identifier: 'urn:uuid:qa', identifier_status: 'internal_unverified', public_path: '/p/aabbccdd', latest_version: 2, selected_version: 1, retained_until: '2039-09-23T00:00:00Z', withdrawn: true, versions: [{ version: 2, recorded_at: '2029-09-24T00:00:00Z' }, { version: 1, recorded_at: '2029-09-23T00:00:00Z' }], next_before_version: null }} />);
    expect(screen.getByRole('link', { name: 'Version 1' })).toHaveAttribute('href', '/p/aabbccdd?version=1');
    expect(screen.getByRole('link', { name: 'Latest version' })).toHaveAttribute('href', '/p/aabbccdd');
    expect(screen.getByText(/owner has withdrawn/)).toBeInTheDocument();
    expect(screen.getByText(/not a verified regulatory/)).toBeInTheDocument();
  });
  it('does not construct links from malformed public identifiers', () => {
    const { container } = render(<CarCleaningHistory slug="javascript:bad" history={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
