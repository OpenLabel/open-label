import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mimics i18next: an unknown key falls back to `defaultValue`, and the
// remaining options are interpolated into it.
const translate = (k: string, def?: unknown, opts?: Record<string, unknown>): string => {
  const options = (typeof def === 'object' && def !== null ? def : opts) as Record<string, unknown> | undefined;
  const text = typeof def === 'string' ? def : typeof options?.defaultValue === 'string' ? options.defaultValue : k;
  return text.replace(/\{\{(\w+)\}\}/g, (m, name) => (options?.[name] === undefined ? m : String(options[name])));
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: translate, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import { DetergentAllergenPicker } from './DetergentAllergenPicker';
import { DETERGENT_FRAGRANCES } from '@/data/detergentFragrances';

describe('DetergentAllergenPicker', () => {
  it('shows an empty state and the add button', () => {
    render(<DetergentAllergenPicker selected={[]} onChange={vi.fn()} />);
    expect(screen.getByText('No allergens added yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add allergen/ })).toBeInTheDocument();
  });

  it('lists the selected allergens with their CAS number and a count', () => {
    render(
      <DetergentAllergenPicker
        selected={[{ id: 'linalool', name: 'Linalool', cas: '78-70-6' }]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('1 allergen(s) declared.')).toBeInTheDocument();
    expect(screen.getByText('Linalool')).toBeInTheDocument();
    expect(screen.getByText(/CAS 78-70-6/)).toBeInTheDocument();
  });

  it('removes a selected allergen', async () => {
    const onChange = vi.fn();
    render(
      <DetergentAllergenPicker
        selected={[
          { id: 'linalool', name: 'Linalool', cas: '78-70-6' },
          { id: 'coumarin', name: 'Coumarin', cas: '91-64-5' },
        ]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove Linalool' }));
    expect(onChange).toHaveBeenCalledWith([{ id: 'coumarin', name: 'Coumarin', cas: '91-64-5' }]);
  });

  it('offers all 105 official entries in the dialog', async () => {
    render(<DetergentAllergenPicker selected={[]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Add allergen/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByRole('checkbox')).toHaveLength(DETERGENT_FRAGRANCES.length);
    expect(DETERGENT_FRAGRANCES).toHaveLength(105);
  });

  it('filters by name, CAS number and reference number', async () => {
    render(<DetergentAllergenPicker selected={[]} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Add allergen/ }));
    const dialog = await screen.findByRole('dialog');
    const search = within(dialog).getByPlaceholderText(/Search by name/);

    await userEvent.type(search, 'linalool');
    expect(within(dialog).getAllByRole('checkbox').length).toBeGreaterThanOrEqual(1);
    expect(within(dialog).getByText('Linalool')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, '100-51-6');
    expect(within(dialog).getAllByRole('checkbox')).toHaveLength(1);
    expect(within(dialog).getByText('Benzyl Alcohol')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, '17');
    expect(within(dialog).getByText('Linalool')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'zzzz-no-match');
    expect(within(dialog).queryAllByRole('checkbox')).toHaveLength(0);
    expect(within(dialog).getByText(/No allergens match/)).toBeInTheDocument();
  });

  it('adds an allergen with only id, name and CAS', async () => {
    const onChange = vi.fn();
    render(<DetergentAllergenPicker selected={[]} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Add allergen/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByPlaceholderText(/Search by name/), '78-70-6');
    await userEvent.click(within(dialog).getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith([{ id: 'linalool', name: 'Linalool', cas: '78-70-6' }]);
  });

  it('unticks an allergen that is already selected', async () => {
    const onChange = vi.fn();
    render(
      <DetergentAllergenPicker
        selected={[{ id: 'linalool', name: 'Linalool', cas: '78-70-6' }]}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Add allergen/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByPlaceholderText(/Search by name/), '78-70-6');
    const box = within(dialog).getByRole('checkbox');
    expect(box).toBeChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
