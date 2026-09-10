import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { annexVICopy, projectDataset, type DatasetKind } from '../../../supabase/functions/_shared/carCleaningAnnexVI';

type Translate = (key: string, fallback: string) => string;
const label = (key: keyof typeof annexVICopy.dataset, t: Translate) => t(`carCleaning.dataset.${key}`, annexVICopy.dataset[key]);
const rowFields = (kind: DatasetKind) => kind === 'microorganisms' ? ['genus', 'species', 'strain'] as const : ['chemical_name'] as const;

export function CarCleaningDatasetEditor({ id, kind, value, onChange }: { id: string; kind: DatasetKind; value: unknown; onChange: (value: Record<string, unknown>[]) => void }) {
  const { t } = useTranslation();
  const rows: Record<string, unknown>[] = Array.isArray(value) ? value.filter(v => v && typeof v === 'object' && !Array.isArray(v)) : [];
  const update = (index: number, key: string, entry: string) => onChange(rows.map((row, i) => {
    if (i !== index) return row;
    const next = { ...row, [key]: entry };
    if (key === 'identifier_type' && entry === 'none') delete next.identifier;
    if (key === 'addition' && entry === 'intentional') delete next.label_basis;
    return next;
  }));
  const select = (index: number, key: keyof typeof annexVICopy.dataset, choices: (keyof typeof annexVICopy.dataset)[], fallback: string) => <div className="space-y-1">
    <Label htmlFor={`${id}-${index}-${key}`}>{label(key, t)}</Label>
    <select id={`${id}-${index}-${key}`} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={typeof rows[index][key] === 'string' ? rows[index][key] as string : fallback} onChange={event => update(index, key, event.target.value)}>
      {choices.map(choice => <option key={choice} value={choice}>{label(choice, t)}</option>)}
    </select>
  </div>;
  return <div id={id} tabIndex={-1} className="space-y-3">
    {rows.map((row, index) => <fieldset key={index} className="rounded-md border p-3 space-y-3 min-w-0">
      <legend className="px-1 text-sm font-medium">{label('entry', t)} {index + 1}</legend>
      {rowFields(kind).map(key => <div key={key} className="space-y-1">
        <Label htmlFor={`${id}-${index}-${key}`}>{label(key, t)}</Label>
        <Input id={`${id}-${index}-${key}`} maxLength={500} value={typeof row[key] === 'string' ? row[key] as string : ''} onChange={event => update(index, key, event.target.value)} />
      </div>)}
      {kind === 'substances' && <>
        {select(index, 'addition', ['intentional', 'carryover_preservative'], 'intentional')}
        {row.addition === 'carryover_preservative' && select(index, 'label_basis', ['none', 'clp_18_3_b', 'bpr_58', 'annex_v', 'multiple'], 'none')}
        {select(index, 'identifier_type', ['none', 'cas', 'ec', 'other'], 'none')}
        {!!row.identifier_type && row.identifier_type !== 'none' && <div className="space-y-1">
          <Label htmlFor={`${id}-${index}-identifier`}>{label('identifier', t)}</Label>
          <Input id={`${id}-${index}-identifier`} maxLength={200} value={typeof row.identifier === 'string' ? row.identifier : ''} onChange={event => update(index, 'identifier', event.target.value)} />
        </div>}
      </>}
      <Button type="button" variant="outline" size="sm" aria-label={`${label('remove', t)} ${index + 1}`} onClick={() => onChange(rows.filter((_, i) => i !== index))}>{label('remove', t)}</Button>
    </fieldset>)}
    <Button type="button" variant="outline" disabled={rows.length >= 500} onClick={() => onChange([...rows, kind === 'substances' ? { chemical_name: '', addition: 'intentional' } : { genus: '', species: '', strain: '' }])}>{label('add', t)}</Button>
  </div>;
}

export function CarCleaningDatasetView({ kind, value, translate }: { kind: DatasetKind; value: unknown; translate: Translate }) {
  const rows = projectDataset(kind, value);
  if (!rows) return null;
  return <ol className="space-y-3 list-decimal pl-5">
    {rows.map((row, index) => <li key={index}><dl className="space-y-1">
      {Object.entries(row).map(([key, entry]) => <div key={key} className="break-words">
        <dt className="inline font-medium">{label(key as keyof typeof annexVICopy.dataset, translate)}: </dt>
        <dd className="inline">{['addition', 'identifier_type', 'label_basis'].includes(key) ? label(entry as keyof typeof annexVICopy.dataset, translate) : entry}</dd>
      </div>)}
    </dl></li>)}
  </ol>;
}
