import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('SortablePassportCard', () => {
  const renderCard = () =>
    render(
      <MemoryRouter>
        <DndContext>
          <SortableContext items={['p1']} strategy={verticalListSortingStrategy}>
            <SortablePassportCard
              passport={mockPassport}
              getCategoryIcon={() => '🍷'}
              onShowQR={vi.fn()}
              onDuplicate={vi.fn()}
              onDelete={vi.fn()}
            />
          </SortableContext>
        </DndContext>
      </MemoryRouter>
    );

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
});
