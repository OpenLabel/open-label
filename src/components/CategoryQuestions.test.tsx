import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
}));

import { CategoryQuestions } from './CategoryQuestions';

describe('CategoryQuestions', () => {
  it('renders without crashing for battery category', () => {
    const { container } = render(
      <CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for textiles category', () => {
    const { container } = render(
      <CategoryQuestions category="textiles" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for electronics category', () => {
    const { container } = render(
      <CategoryQuestions category="electronics" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for other category', () => {
    const { container } = render(
      <CategoryQuestions category="other" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('renders without crashing for tires category', () => {
    const { container } = render(
      <CategoryQuestions category="tires" data={{}} onChange={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('calls onChange when typing in a text input', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    // battery template has manufacturer_name as a text input
    const input = screen.getByLabelText('Manufacturer Name *');
    await userEvent.type(input, 'A');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ manufacturer_name: 'A' }));
  });

  it('calls onChange when typing in a number input', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    const input = screen.getByLabelText('Rated Capacity (kWh) *');
    await userEvent.type(input, '5');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ capacity_kwh: 5 }));
  });

  it('calls onChange when clicking a checkbox', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    const checkbox = screen.getByLabelText('Has carbon footprint been calculated and declared?');
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ carbon_footprint_declared: true }));
  });

  it('calls onChange when typing in a textarea', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    const textarea = screen.getByLabelText('Recycling Instructions');
    await userEvent.type(textarea, 'R');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ recycling_instructions: 'R' }));
  });

  it('shows alpha warning for non-wine categories', () => {
    render(<CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />);
    expect(screen.getByText('passport.earlyAlpha')).toBeInTheDocument();
  });

  it('renders empty div for wine category (no sections)', () => {
    // wine category has sections handled by WineFields, so CategoryQuestions returns empty
    const { container } = render(
      <CategoryQuestions category="wine" data={{}} onChange={vi.fn()} />
    );
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
  });
});
