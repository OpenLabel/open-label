import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

vi.mock('@/components/TranslationButton', () => ({
  TranslationButton: () => null,
}));

vi.mock('@/hooks/useAutoTranslate', () => ({
  useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn() }),
}));

vi.mock('@/data/wineRecycling', () => ({
  packagingMaterialTypes: [
    { id: 'bottle', name: 'Bottle', icon: '🍾' },
    { id: 'cap', name: 'Cap', icon: '🔴' },
  ],
  getCompositionsByCategory: () => ({
    individual: [{ id: 'glass', name: 'Glass', compositions: [{ id: 'gl70', name: 'Clear glass', code: 'GL 70' }] }],
    composite: [],
  }),
  disposalMethods: [{ id: 'glass_bin', name: 'Glass recycling bin' }],
  materialCompositions: [{ id: 'gl70', name: 'Clear glass', code: 'GL 70' }],
}));

import { WineRecycling } from './WineRecycling';

describe('WineRecycling', () => {
  const onChange = vi.fn();

  beforeEach(() => onChange.mockClear());

  it('renders without crashing', () => {
    render(<WineRecycling data={{}} onChange={onChange} />);
    expect(screen.getByText('wine.recycling')).toBeInTheDocument();
  });

  it('shows add material button', () => {
    render(<WineRecycling data={{}} onChange={onChange} />);
    expect(screen.getByText('recycling.addMaterial')).toBeInTheDocument();
  });

  it('renders existing materials', () => {
    const data = {
      packaging_materials: [
        { id: 'mat_1', typeId: 'bottle', typeName: 'Bottle' },
      ],
    };
    render(<WineRecycling data={data} onChange={onChange} />);
    expect(screen.getByText('Bottle')).toBeInTheDocument();
  });

  it('opens add material dialog on button click', () => {
    render(<WineRecycling data={{}} onChange={onChange} />);
    fireEvent.click(screen.getByText('recycling.addMaterial'));
    expect(screen.getByText('recycling.addPackagingMaterial')).toBeInTheDocument();
  });

  it('shows material types in dialog', () => {
    render(<WineRecycling data={{}} onChange={onChange} />);
    fireEvent.click(screen.getByText('recycling.addMaterial'));
    expect(screen.getByText('🍾')).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('adds material when type selected', () => {
    render(<WineRecycling data={{}} onChange={onChange} />);
    fireEvent.click(screen.getByText('recycling.addMaterial'));
    fireEvent.click(screen.getByText('Bottle'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        packaging_materials: expect.arrayContaining([
          expect.objectContaining({ typeId: 'bottle', typeName: 'Bottle' }),
        ]),
      })
    );
  });

  it('removes material when X clicked', () => {
    const data = {
      packaging_materials: [
        { id: 'mat_1', typeId: 'bottle', typeName: 'Bottle' },
      ],
    };
    const { container } = render(<WineRecycling data={data} onChange={onChange} />);
    const removeBtn = container.querySelector('button .lucide-x')?.closest('button');
    if (removeBtn) fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ packaging_materials: [] })
    );
  });

  it('shows edit button for custom materials', () => {
    const data = {
      packaging_materials: [
        { id: 'mat_1', typeId: 'custom', typeName: 'Wooden crate', isCustomType: true, customTypeName: 'Wooden crate' },
      ],
    };
    const { container } = render(<WineRecycling data={data} onChange={onChange} />);
    expect(container.querySelector('.lucide-pencil')).toBeInTheDocument();
  });
});
