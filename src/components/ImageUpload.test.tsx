import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: { from: () => ({ upload: vi.fn(), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  },
}));

import { ImageUpload } from './ImageUpload';

describe('ImageUpload', () => {
  it('renders upload button when no value', () => {
    render(<ImageUpload value={null} onChange={vi.fn()} />);
    expect(screen.getByText('imageUpload.uploadButton')).toBeInTheDocument();
  });

  it('renders image when value is set', () => {
    render(<ImageUpload value="https://example.com/img.jpg" onChange={vi.fn()} />);
    expect(document.querySelector('img')).toBeInTheDocument();
  });

  it('shows remove button when image is set', () => {
    render(<ImageUpload value="https://example.com/img.jpg" onChange={vi.fn()} />);
    expect(document.querySelector('button')).toBeInTheDocument();
  });
});
