import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('./WinePublicPassport', () => ({
  WinePublicPassport: ({ passport, isPreview }: any) => (
    <div data-testid="wine-public-passport">
      <span>{passport.name}</span>
      {isPreview && <span data-testid="preview-mode">preview</span>}
    </div>
  ),
}));

import { WinePassportPreview } from './WinePassportPreview';

describe('WinePassportPreview', () => {
  const defaultFormData = {
    name: 'Test Wine',
    image_url: null,
    description: 'A test wine',
    category_data: { product_name: 'Château Test' },
  };

  it('renders without crashing', () => {
    render(<WinePassportPreview formData={defaultFormData} />);
    expect(screen.getByTestId('wine-public-passport')).toBeInTheDocument();
  });

  it('passes isPreview=true to WinePublicPassport', () => {
    render(<WinePassportPreview formData={defaultFormData} />);
    expect(screen.getByTestId('preview-mode')).toBeInTheDocument();
  });

  it('shows live preview label', () => {
    render(<WinePassportPreview formData={defaultFormData} />);
    expect(screen.getByText('preview.livePreview')).toBeInTheDocument();
  });

  it('uses form name if provided', () => {
    render(<WinePassportPreview formData={defaultFormData} />);
    expect(screen.getByText('Test Wine')).toBeInTheDocument();
  });

  it('uses "Untitled Passport" when name is empty', () => {
    render(<WinePassportPreview formData={{ ...defaultFormData, name: '' }} />);
    expect(screen.getByText('Untitled Passport')).toBeInTheDocument();
  });
});
