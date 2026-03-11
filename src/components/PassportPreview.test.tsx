import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('./wine/WinePublicPassport', () => ({
  WinePublicPassport: () => <div data-testid="wine-passport" />,
}));

vi.mock('dompurify', () => ({
  default: { sanitize: (html: string) => html },
}));

import { PassportPreview } from './PassportPreview';

describe('PassportPreview', () => {
  it('renders wine preview for wine category', () => {
    render(
      <PassportPreview formData={{ name: 'Test Wine', category: 'wine', image_url: null, description: '', category_data: {} }} />
    );
    expect(screen.getByTestId('wine-passport')).toBeInTheDocument();
  });

  it('renders generic preview for other category', () => {
    render(
      <PassportPreview formData={{ name: 'Test Product', category: 'other', image_url: null, description: '', category_data: {} }} />
    );
    expect(screen.getByText('preview.livePreview')).toBeInTheDocument();
  });

  it('renders product name in generic preview', () => {
    render(
      <PassportPreview formData={{ name: 'My Battery', category: 'battery', image_url: null, description: '', category_data: {} }} />
    );
    expect(screen.getByText('preview.productName')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <PassportPreview formData={{ name: 'Test', category: 'other', image_url: null, description: '<p>Hello</p>', category_data: {} }} />
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows product image when provided', () => {
    render(
      <PassportPreview formData={{ name: 'Test', category: 'other', image_url: 'https://example.com/img.jpg', description: '', category_data: {} }} />
    );
    expect(document.querySelector('img')).toBeInTheDocument();
  });
});
