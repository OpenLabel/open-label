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
    expect(screen.getByText('My Battery')).toBeInTheDocument();
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

  it('shows counterfeit protection badge when enabled', () => {
    render(
      <PassportPreview formData={{
        name: 'Test', category: 'battery', image_url: null, description: '',
        category_data: { counterfeit_protection_enabled: true },
      }} />
    );
    expect(screen.getByText('preview.checkAuthenticity')).toBeInTheDocument();
  });

  it('shows required logos when category data triggers them', () => {
    render(
      <PassportPreview formData={{
        name: 'Test', category: 'battery', image_url: null, description: '',
        category_data: { separate_collection_required: true },
      }} />
    );
    expect(screen.getByText('Weee')).toBeInTheDocument();
  });

  it('renders category-specific data when section has values', () => {
    render(
      <PassportPreview formData={{
        name: 'Test', category: 'battery', image_url: null, description: '',
        category_data: { manufacturer_name: 'Acme Corp', capacity_kwh: 50 },
      }} />
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('displays boolean true as common.yes', () => {
    render(
      <PassportPreview formData={{
        name: 'Test', category: 'battery', image_url: null, description: '',
        category_data: { carbon_footprint_declared: true },
      }} />
    );
    // checkbox type shows ✓ badge, not text
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('uses product_name from category_data when available', () => {
    render(
      <PassportPreview formData={{
        name: 'DPP Name', category: 'battery', image_url: null, description: '',
        category_data: { product_name: 'Custom Product Name' },
      }} />
    );
    expect(screen.getByText('Custom Product Name')).toBeInTheDocument();
  });
});
