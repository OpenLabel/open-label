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
    // Use the id-based selector since label includes * in a separate span
    const input = document.getElementById('manufacturer_name') as HTMLInputElement;
    await userEvent.type(input, 'A');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ manufacturer_name: 'A' }));
  });

  it('calls onChange when typing in a number input', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    const input = document.getElementById('capacity_kwh') as HTMLInputElement;
    await userEvent.type(input, '5');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ capacity_kwh: 5 }));
  });

  it('calls onChange when clicking a checkbox', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    // Checkbox label is rendered alongside the checkbox
    const checkbox = screen.getByText('Has carbon footprint been calculated and declared?');
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ carbon_footprint_declared: true }));
  });

  it('calls onChange when typing in a textarea', async () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{}} onChange={onChange} />);
    const textarea = document.getElementById('recycling_instructions') as HTMLTextAreaElement;
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

  // BUG-19: stored 0 must render in the number input (not blank).
  it('renders a stored 0 in a number input (BUG-19)', () => {
    render(<CategoryQuestions category="battery" data={{ capacity_kwh: 0 }} onChange={vi.fn()} />);
    const input = document.getElementById('capacity_kwh') as HTMLInputElement;
    expect(input.value).toBe('0');
  });

  // BUG-19: clearing a number input stores null (not '').
  it('clearing a number input stores null (BUG-19)', () => {
    const onChange = vi.fn();
    render(<CategoryQuestions category="battery" data={{ capacity_kwh: 5 }} onChange={onChange} />);
    const input = document.getElementById('capacity_kwh') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ capacity_kwh: null }));
  });

  // Cross-field inline warnings are opt-in: a template without
  // getInlineWarnings must render exactly as it did before.
  it('renders no extra alerts for a template without getInlineWarnings', async () => {
    const { templates } = await import('@/templates');
    expect(templates.battery.getInlineWarnings).toBeUndefined();

    const baseline = render(
      <CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />,
    );
    const baselineAlerts =
      baseline.container.querySelectorAll('.bg-amber-50').length;
    baseline.unmount();

    const { container } = render(
      <CategoryQuestions
        category="battery"
        data={{ primary_fiber: 'polyester', primary_fiber_percentage: 90 }}
        onChange={vi.fn()}
      />,
    );
    expect(container.querySelectorAll('.bg-amber-50')).toHaveLength(
      baselineAlerts,
    );
  });

  // Positive wiring tests: the Appareil (textiles) template's inline warnings
  // must actually reach the screen — the original bug was that
  // getCompositionWarning existed but no component ever rendered it.
  it('renders the synthetic-fibre microplastic warning for textiles', () => {
    render(
      <CategoryQuestions
        category="textiles"
        data={{ primary_fiber: 'polyester', primary_fiber_percentage: 60 }}
        onChange={vi.fn()}
      />,
    );
    // Anchored to microplastic_shedding; other amber alerts (missing-fields
    // summary, alpha notice) exist, so match on the message itself.
    expect(
      screen.getByText(/60% synthetic fibre/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/shed microplastics/),
    ).toBeInTheDocument();
  });

  it('renders the over-100% composition warning for textiles', () => {
    render(
      <CategoryQuestions
        category="textiles"
        data={{
          primary_fiber_percentage: 80,
          secondary_fiber_percentage: 30,
        }}
        onChange={vi.fn()}
      />,
    );
    // Anchored to secondary_fiber_percentage.
    expect(screen.getByText(/110%/)).toBeInTheDocument();
    expect(screen.getByText(/exceeds 100%/)).toBeInTheDocument();
  });
});

