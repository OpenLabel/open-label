import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CarCleaningDatasetEditor, CarCleaningDatasetView } from './CarCleaningDataset';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }) }));

describe('Structured public Annex VI datasets', () => {
  it('adds, edits and removes actual substance rows with conditional carry-over grounds', () => {
    function Form() {
      const [value, setValue] = useState<unknown>([]);
      return <><CarCleaningDatasetEditor id="substances" kind="substances" value={value} onChange={setValue} /><output>{JSON.stringify(value)}</output></>;
    }
    render(<Form />);
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }));
    fireEvent.change(screen.getByLabelText('Chemical name'), { target: { value: 'Water' } });
    expect(screen.getByRole('status').textContent).toContain('Water');
    fireEvent.change(screen.getByLabelText('Reason for inclusion'), { target: { value: 'carryover_preservative' } });
    expect(screen.getByLabelText('Carry-over preservative label basis')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Remove entry/ }));
    expect(screen.queryByLabelText('Chemical name')).not.toBeInTheDocument();
  });
  it('collects genus, species and strain independently without a concentration field', () => {
    render(<CarCleaningDatasetEditor id="microorganisms" kind="microorganisms" value={[{ genus: 'Bacillus', species: 'subtilis', strain: 'QA-1' }]} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Genus')).toHaveValue('Bacillus');
    expect(screen.getByLabelText('Species')).toHaveValue('subtilis');
    expect(screen.getByLabelText('Strain name or code')).toHaveValue('QA-1');
    expect(screen.queryByLabelText(/concentration/i)).not.toBeInTheDocument();
  });
  it('clears a removed optional identifier so a hidden stale value cannot block saving', () => {
    const onChange = vi.fn();
    render(<CarCleaningDatasetEditor id="substances" kind="substances" value={[{ chemical_name: 'Water', addition: 'intentional', identifier_type: 'cas', identifier: '7732-18-5' }]} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Optional identifier type'), { target: { value: 'none' } });
    expect(onChange).toHaveBeenCalledWith([{ chemical_name: 'Water', addition: 'intentional', identifier_type: 'none' }]);
  });
  it('renders only allowlisted public row values as escaped text', () => {
    const t = (key: string, fallback?: string) => fallback || key;
    render(<CarCleaningDatasetView kind="substances" value={[{ chemical_name: '<script>bad()</script>', addition: 'intentional', concentration: 'SECRET' }]} translate={t} />);
    expect(screen.getByText('<script>bad()</script>')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
  });
});
