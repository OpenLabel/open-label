import { useTranslation } from 'react-i18next';
import { CAR_CLEANING_HISTORY_COPY } from '../../../supabase/functions/_shared/carCleaningPlatformCopy';

import type { CarCleaningHistoryData } from '@/types/passport';
export type { CarCleaningHistoryData } from '@/types/passport';

export function CarCleaningHistory({ slug, history }: { slug?: string | null; history?: CarCleaningHistoryData | null }) {
  const { t } = useTranslation();
  const copy = (key: keyof typeof CAR_CLEANING_HISTORY_COPY) => t(`carCleaning.history.${key}`, CAR_CLEANING_HISTORY_COPY[key]);
  if (!history || !slug || !/^(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/.test(slug)) return null;
  const path = `/p/${slug}`;
  return <section className="rounded-lg border p-4 text-sm space-y-3">
    <h2 className="text-lg font-semibold">{copy('title')}</h2>
    {history.withdrawn && <p role="status" className="font-medium">{copy('withdrawn')}</p>}
    <p className="break-all">{copy('identifier')}: {history.product_identifier}</p>
    <p>{copy('identifierHelp')}</p>
    <p>{copy('retainedUntil')}: <time dateTime={history.retained_until}>{history.retained_until}</time></p>
    <p>{copy('retentionHelp')}</p>
    <a className="underline" href={path}>{copy('latest')}</a>
    <ol className="space-y-2">
      {history.versions.map(entry => <li key={entry.version} className="flex flex-wrap gap-x-3 gap-y-1">
        <a className="underline" href={`${path}?version=${entry.version}`} aria-current={history.selected_version === entry.version ? 'page' : undefined}>{copy('version')} {entry.version}</a>
        <span>{copy('recorded')}: <time dateTime={entry.recorded_at}>{entry.recorded_at}</time></span>
      </li>)}
    </ol>
    {history.next_before_version !== null && <a className="underline" href={`${path}?history_before=${history.next_before_version}${history.selected_version ? `&version=${history.selected_version}` : ''}`}>{copy('more')}</a>}
  </section>;
}
