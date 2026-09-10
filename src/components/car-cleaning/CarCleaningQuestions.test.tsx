import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { validCleaner } from './testFixtures';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key, i18n: { language: 'en' } }) }));
vi.mock('@/components/TranslatableField', () => ({ TranslatableField: ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => <textarea id={id} value={value} onChange={event => onChange(event.target.value)} /> }));
import { CategoryQuestions } from '@/components/CategoryQuestions';

describe('Car cleaning conditional form', () => {
  it('uses actionable validation instead of the generic nonblocking or alpha notices', () => {
    render(<CategoryQuestions category="car_cleaning" data={{}} onChange={vi.fn()} />);
    expect(screen.getByText('Review the product information')).toBeInTheDocument();
    expect(screen.queryByText('passport.earlyAlpha')).not.toBeInTheDocument();
    expect(screen.queryByText(/You can still save and publish/)).not.toBeInTheDocument();
    expect(screen.getByText(/Everything saved in this category is public/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Product function' }));
    expect(screen.getByRole('combobox', { name: /Product function/ })).toHaveFocus();
  });

  it('hides irrelevant poison centre and SDS controls for an assessed nonhazardous detergent', () => {
    render(<CategoryQuestions category="car_cleaning" data={validCleaner} onChange={vi.fn()} />);
    expect(screen.queryByText('Review the product information')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Unique formula identifier/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Public safety data sheet URL/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Public detergent ingredient list URL/)).toBeInTheDocument();
  });

  it('reveals applicable health hazard, poison centre and SDS controls and flags them', () => {
    render(<CategoryQuestions category="car_cleaning" data={{ ...validCleaner, clp_classification: 'health_physical', pcn_applicability: 'required', sds_requirement: 'required' }} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/Unique formula identifier/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Public safety data sheet URL/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unique formula identifier/ })).toBeInTheDocument();
  });
});
