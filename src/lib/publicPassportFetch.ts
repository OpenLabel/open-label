import type { Passport } from '@/types/passport';

/** Do not forward the viewer's authoring session to a public product endpoint. */
export async function fetchPublicPassport(
  slug: string,
  signal?: AbortSignal,
  config = { url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
  fetcher: typeof fetch = fetch,
  selection?: { version?: string; history_before?: string },
): Promise<Omit<Passport, 'user_id'>> {
  if (!/^(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/.test(slug)) {
    throw new Error('Invalid passport identifier');
  }
  const selected: Record<string, number> = {};
  for (const key of ['version', 'history_before'] as const) {
    const value = selection?.[key];
    if (value === undefined) continue;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Invalid passport version');
    selected[key] = Number(value);
  }
  const response = await fetcher(`${config.url}/functions/v1/get-public-passport`, {
    method: 'POST',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    signal,
    headers: {
      'Content-Type': 'application/json',
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
    body: JSON.stringify({ slug, ...selected }),
  });
  if (!response.ok) throw new Error('Failed to fetch passport');
  const data = await response.json();
  if (!data?.passport) throw new Error('Passport not found');
  return data.passport as Omit<Passport, 'user_id'>;
}
