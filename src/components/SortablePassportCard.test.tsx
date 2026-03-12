import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import { SortablePassportCard } from './SortablePassportCard';
import type { Passport } from '@/types/passport';

const mockPassport: Passport = {
  id: 'p1',
  user_id: 'u1',
  name: 'Test Passport',
  category: 'wine',
  image_url: null,
  description: 'desc',
  language: 'en',
  category_data: {},
  public_slug: 'test-slug',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockPassportNoSlug: Passport = {
  ...mockPassport,
  id: 'p2',
  public_slug: null,
};

describe('SortablePassportCard', () => {
  const renderCard = (passport = mockPassport, overrides = {}) => {
    const props = {
      passport,
      getCategoryIcon: () => '🍷',
      onShowQR: vi.fn(),
      onDuplicate: vi.fn(),
      onDelete: vi.fn(),
      ...overrides,
    };
    const result = render(
      <MemoryRouter>
        <DndContext>
          <SortableContext items={[passport.id]} strategy={verticalListSortingStrategy}>
            <SortablePassportCard {...props} />
          </SortableContext>
        </DndContext>
      </MemoryRouter>
    );
    return { ...result, props };
  };

  it('renders passport name', () => {
    renderCard();
    expect(screen.getAllByText('Test Passport').length).toBeGreaterThan(0);
  });

  it('shows category icon', () => {
    renderCard();
    expect(screen.getAllByText('🍷').length).toBeGreaterThan(0);
  });

  it('shows drag handle', () => {
    renderCard();
    expect(screen.getAllByLabelText('dashboard.dragToReorder').length).toBeGreaterThan(0);
  });

  it('calls onShowQR when QR button clicked', () => {
    const onShowQR = vi.fn();
    renderCard(mockPassport, { onShowQR });
    // Desktop QR button
    const qrButtons = screen.getAllByRole('button').filter(b => b.querySelector('.lucide-qr-code'));
    fireEvent.click(qrButtons[0]);
    expect(onShowQR).toHaveBeenCalledWith(mockPassport);
  });

  it('calls onDuplicate when duplicate button clicked', () => {
    const onDuplicate = vi.fn();
    renderCard(mockPassport, { onDuplicate });
    const copyButtons = screen.getAllByRole('button').filter(b => b.querySelector('.lucide-copy'));
    fireEvent.click(copyButtons[0]);
    expect(onDuplicate).toHaveBeenCalledWith(mockPassport);
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    renderCard(mockPassport, { onDelete });
    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('.lucide-trash-2'));
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('hides QR button when no public slug', () => {
    renderCard(mockPassportNoSlug);
    const qrButtons = screen.getAllByRole('button').filter(b => b.querySelector('.lucide-qr-code'));
    expect(qrButtons.length).toBe(0);
  });

  it('shows image when image_url is set', () => {
    const withImage = { ...mockPassport, image_url: 'https://example.com/img.jpg' };
    renderCard(withImage);
    const images = document.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });
});
