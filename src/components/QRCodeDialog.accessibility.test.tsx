import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }),
}));

import { QRCodeDialog } from './QRCodeDialog';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('QRCodeDialog accessibility and exports', () => {
  it('exposes a named dialog without a broken description reference and supports closing', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const onOpenChange = vi.fn();
    render(
      <QRCodeDialog open onOpenChange={onOpenChange} url="https://qa.example/p/public" productName="QA20260919 Public cleaner" />,
    );

    const dialog = screen.getByRole('dialog', { name: 'qrDialog.title - QA20260919 Public cleaner' });
    expect(dialog).not.toHaveAttribute('aria-describedby');
    expect(warning.mock.calls.flat().join(' ')).not.toMatch(/Missing.*Description/);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each([
    { wine: false, seal: false },
    { wine: false, seal: true },
    { wine: true, seal: false },
    { wine: true, seal: true },
  ])('exports the real QR paths at print size with wine=$wine and seal=$seal', async ({ wine, seal }) => {
    const blobs: Blob[] = [];
    const createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:qa-export';
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    });
    const downloads: { name: string; href: string }[] = [];
    const serialize = vi.spyOn(XMLSerializer.prototype, 'serializeToString');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloads.push({ name: this.download, href: this.href });
    });
    render(
      <QRCodeDialog
        open onOpenChange={vi.fn()} url="https://qa.example/p/public" productName="QA20260919 Public cleaner"
        showSecuritySealOverlay={seal}
        wineIngredientsText={wine ? 'Ingredients <QA>' : undefined}
        wineEnergyText={wine ? '100 kJ / 24 kcal' : undefined}
      />,
    );
    const displayedQr = screen.getByRole('dialog').querySelector('svg.qr-code-svg');
    expect(displayedQr).not.toBeNull();
    const displayedPaths = Array.from(displayedQr!.querySelectorAll('path'), (path) => path.getAttribute('d'));
    expect(displayedPaths.length).toBeGreaterThan(0);
    const cells = Number(displayedQr!.getAttribute('viewBox')!.split(' ')[2]);

    fireEvent.keyDown(screen.getByRole('button', { name: 'qrDialog.download' }), { key: 'ArrowDown' });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'SVG (print)' }));
    expect(blobs).toHaveLength(1);
    expect(blobs[0].type).toBe('image/svg+xml;charset=utf-8');
    expect(serialize).toHaveBeenCalledOnce();
    const svg = serialize.mock.calls[0][0] as SVGSVGElement;
    expect(svg.getAttribute('width')).toBe('282');
    expect(svg.getAttribute('height')).toBe(wine ? '330' : '282');
    const qr = svg.querySelector('g')!;
    expect(qr.getAttribute('transform')).toBe(`translate(16, ${wine ? 40 : 16}) scale(${250 / cells})`);
    expect(Array.from(qr.querySelectorAll('path'), (path) => path.getAttribute('d'))).toEqual(displayedPaths);
    const texts = Array.from(svg.querySelectorAll('text'), (text) => text.textContent);
    expect(texts.includes('Ingredients <QA>')).toBe(wine);
    expect(texts.includes('100 kJ / 24 kcal')).toBe(wine);
    expect(texts.includes('Place security')).toBe(seal);
    expect(svg.querySelectorAll('g')).toHaveLength(seal ? 2 : 1);
    if (seal) {
      expect(svg.querySelectorAll('g')[1].getAttribute('transform')).toBe(`translate(71.5, ${wine ? 95.5 : 71.5})`);
    }
    expect(downloads).toEqual([{ name: 'QA20260919_Public_cleaner_qr.svg', href: 'blob:qa-export' }]);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:qa-export');
  });
});
