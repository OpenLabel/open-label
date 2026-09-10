import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CAR_CLEANING_HISTORY_COPY } from '../../../supabase/functions/_shared/carCleaningPlatformCopy';

export function CarCleaningRetained({ refreshKey = '' }: { refreshKey?: string }) {
  const { user } = useAuth();
  const userId = user?.id;
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<{ public_slug: string; withdrawn_at: string | null }[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!open || !userId) return;
    let current = true;
    setRows([]); setFailed(false);
    void (async () => {
      try {
        const { data, error } = await supabase.from('car_cleaning_passport_archives').select('public_slug, withdrawn_at').eq('user_id', userId).not('withdrawn_at', 'is', null).order('withdrawn_at', { ascending: false });
        if (current) { setFailed(!!error); setRows(error ? [] : data || []); }
      } catch { if (current) setFailed(true); }
    })();
    return () => { current = false; };
  }, [open, userId, refreshKey]);
  return <details className="my-6 rounded-lg border p-4 text-sm" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer font-medium">{t('carCleaning.history.restore', CAR_CLEANING_HISTORY_COPY.restore)}</summary>
    <p className="mt-3">{t('carCleaning.history.withdrawalNotice', CAR_CLEANING_HISTORY_COPY.withdrawalNotice)}</p>
    {failed && <p role="alert">{t('common.error')}</p>}
    <ul className="mt-3 space-y-2">
      {rows.filter(row => /^(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/.test(row.public_slug)).map(row => <li key={row.public_slug}><a href={`/p/${row.public_slug}`} className="underline">{row.public_slug}</a>{' '}<time dateTime={row.withdrawn_at || undefined}>{row.withdrawn_at}</time></li>)}
    </ul>
  </details>;
}
