import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { validCleaner } from './testFixtures';
import { annexCleaner } from './annexFixtures';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key, i18n: { language: 'en' } }) }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/hooks/useAutoTranslate', () => ({ useAutoTranslate: () => ({ isTranslating: false, markAsUserEdited: vi.fn() }) }));
vi.mock('@/components/TranslationButton', () => ({ TranslationButton: () => null }));

import { CategoryQuestions } from '@/components/CategoryQuestions';

function expectLinkedError(field: string) {
  const control = document.getElementById(field)!;
  expect(control).toHaveAttribute('aria-invalid', 'true');
  const describedBy = control.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  for (const id of describedBy!.split(/\s+/)) {
    const error = document.getElementById(id);
    expect(error).toBeInTheDocument();
    expect(document.getElementById('car-cleaning-validation')).toContainElement(error);
    expect(error?.textContent?.trim()).toBeTruthy();
  }
  expect(control).toHaveAccessibleDescription();
  return control;
}

describe('Car cleaning validation accessibility', () => {
  it.each<[string, string | number | boolean]>([
    ['manufacturer_name', ''],
    ['manufacturer_email', 'not-an-email'],
    ['ingredients_url', 'javascript:alert(1)'],
    ['manufacturer_address', ''],
    ['use_instructions', ''],
    ['recycled_content', 101],
    ['clp_classification', 'review'],
    ['physical_label_reviewed', false],
  ])('associates the %s control with its rendered error and clears it when valid', (field, invalid) => {
    const { rerender } = render(<CategoryQuestions category="car_cleaning" data={{ ...validCleaner, [field]: invalid }} onChange={vi.fn()} />);
    expectLinkedError(field);
    rerender(<CategoryQuestions category="car_cleaning" data={validCleaner} onChange={vi.fn()} />);
    const control = document.getElementById(field)!;
    expect(control).not.toHaveAttribute('aria-invalid');
    expect(control).not.toHaveAttribute('aria-describedby');
  });

  it('updates email and real translatable textarea error associations after input', () => {
    function Form() {
      const [data, setData] = useState<Record<string, unknown>>({ ...validCleaner, manufacturer_email: 'invalid', use_instructions: '' });
      return <CategoryQuestions category="car_cleaning" data={data} onChange={setData} />;
    }
    render(<Form />);
    const email = expectLinkedError('manufacturer_email');
    const instructions = expectLinkedError('use_instructions');
    fireEvent.change(email, { target: { value: 'qa@example.test' } });
    fireEvent.change(instructions, { target: { value: 'Dilute as directed. Rinse.' } });
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(email).not.toHaveAttribute('aria-describedby');
    expect(instructions).not.toHaveAttribute('aria-invalid');
    expect(instructions).not.toHaveAttribute('aria-describedby');
  });

  it.each<[string, Record<string, unknown>]>([
    ['substances', { ...annexCleaner, substances: [{ chemical_name: '', addition: 'intentional' }] }],
    ['microorganisms', { ...annexCleaner, microorganisms_added: 'yes', microorganisms: [{ genus: 'Bacillus', species: 'subtilis', strain: '' }] }],
  ])('labels the invalid %s dataset group and preserves summary-link focus', (field, data) => {
    render(<CategoryQuestions category="car_cleaning" data={data} onChange={vi.fn()} />);
    const group = expectLinkedError(field);
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAccessibleName();
    const errorId = group.getAttribute('aria-describedby')!.split(/\s+/)[0];
    fireEvent.click(document.getElementById(errorId)!.querySelector('button')!);
    expect(group).toHaveFocus();
  });

  it('does not apply car validation semantics to another category', () => {
    render(<CategoryQuestions category="battery" data={{}} onChange={vi.fn()} />);
    expect(document.getElementById('manufacturer_name')).not.toHaveAttribute('aria-invalid');
    expect(document.getElementById('manufacturer_name')).not.toHaveAttribute('aria-describedby');
  });
});
