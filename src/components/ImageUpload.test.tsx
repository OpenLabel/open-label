import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: { from: () => ({ upload: vi.fn().mockResolvedValue({ error: null }), getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/uploaded.jpg' } }) }) },
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

  it('calls onChange(null) when remove button clicked', () => {
    const onChange = vi.fn();
    render(<ImageUpload value="https://example.com/img.jpg" onChange={onChange} />);
    const removeBtn = document.querySelector('button')!;
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('shows error for non-image file', async () => {
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} />);
    const input = document.querySelector('input[type="file"]')!;
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('imageUpload.invalidType')).toBeInTheDocument();
    });
  });

  it('shows error for oversized file', async () => {
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} />);
    const input = document.querySelector('input[type="file"]')!;
    const file = new File(['x'.repeat(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText('imageUpload.tooLarge')).toBeInTheDocument();
    });
  });

  it('uploads valid image and calls onChange with URL', async () => {
    const onChange = vi.fn();
    render(<ImageUpload value={null} onChange={onChange} />);
    const input = document.querySelector('input[type="file"]')!;
    const file = new File(['imgdata'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('https://example.com/uploaded.jpg');
    });
  });
});
