import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, d?: string) => d || k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: any) => <svg data-testid="qr-svg" data-value={value} />,
}));

import { QRCodeDialog } from './QRCodeDialog';

describe('QRCodeDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <QRCodeDialog open={false} onOpenChange={vi.fn()} url="https://example.com/p/abc" productName="Test Wine" />
    );
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(
      <QRCodeDialog open={true} onOpenChange={vi.fn()} url="https://example.com/p/abc" productName="Test Wine" />
    );
    expect(screen.getByText(/Test Wine/)).toBeInTheDocument();
  });

  it('shows URL in dialog', () => {
    render(
      <QRCodeDialog open={true} onOpenChange={vi.fn()} url="https://example.com/p/abc" productName="Test Wine" />
    );
    expect(screen.getByText('https://example.com/p/abc')).toBeInTheDocument();
  });

  it('renders QR code SVG', () => {
    render(
      <QRCodeDialog open={true} onOpenChange={vi.fn()} url="https://example.com/p/abc" productName="Test Wine" />
    );
    expect(screen.getByTestId('qr-svg')).toBeInTheDocument();
  });

  it('shows print instruction when security seal is enabled', () => {
    render(
      <QRCodeDialog open={true} onOpenChange={vi.fn()} url="https://example.com/p/abc" productName="Test" showSecuritySealOverlay={true} />
    );
    expect(screen.getByText(/Print at 1.8/)).toBeInTheDocument();
  });
});
