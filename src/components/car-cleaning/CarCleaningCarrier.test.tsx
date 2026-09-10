import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CarCleaningCarrier } from './CarCleaningCarrier';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }) }));
afterEach(() => vi.restoreAllMocks());

const url = 'https://example.test/p/abcdef0123456789';
describe('downloadable car-cleaning carrier', () => {
  it('renders a real QR with quiet zone, readable URI, scan instruction and explicit physical verification limits', () => {
    const { container } = render(<CarCleaningCarrier url={url} productName="Cleaner" />);
    const qr = container.querySelector('svg[data-carrier-qr]');
    expect(qr).not.toBeNull();
    expect(qr?.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(screen.getByText(/Scan for more product information/)).toBeInTheDocument();
    expect(screen.getByText(/does not replace the physical label/)).toBeInTheDocument();
    expect(screen.getByText(/Test the final printed carrier/)).toBeInTheDocument();
    expect(container.querySelector('metadata')?.textContent).toContain(url);
  });

  it('disables export until a saved canonical HTTPS public URI is available', () => {
    const { container } = render(<CarCleaningCarrier url="http://localhost/p/abcdef01" productName="Cleaner" />);
    expect(screen.queryByRole('button', { name: 'Download carrier (SVG)' })).not.toBeInTheDocument();
    expect(container.querySelector('svg[data-carrier-qr]')).toBeNull();
  });

  it('exports the QR and escaped text as SVG with actual endpoint metadata', async () => {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:carrier');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const endpoint = 'https://api.example.test/functions/v1/export-public-passport?slug=abcdef0123456789';
    render(<CarCleaningCarrier url={url} productName={'<img src=x onerror=alert(1)>'} machineReadableUrl={endpoint} />);
    fireEvent.click(screen.getByRole('button', { name: 'Download carrier (SVG)' }));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const text = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
    expect(text).toContain('Scan for more product information');
    expect(text).toContain('&lt;img');
    expect(text).not.toContain('<img');
    expect(text).toContain(endpoint.replace(/&/g, '&amp;'));
    expect(text).toContain('data-carrier-qr');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:carrier');
  });
});
