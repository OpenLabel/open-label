/** Public projections only. Raw retained snapshots must never be sent to anonymous clients. */
import { publicCarCleaningData, publicHttpUrl } from './carCleaning.ts';
import { CAR_CLEANING_LANGUAGES } from './carCleaningLanguages.ts';

export const CAR_CLEANING_HISTORY_PAGE_SIZE = 50;
export type CarCleaningArchive = {
  passport_id: string;
  product_identifier: string;
  public_slug: string;
  latest_version: number;
  retained_until: string;
  withdrawn_at: string | null;
};
export type CarCleaningVersionIndex = { version: number; recorded_at: string };
const object = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const textOrNull = (value: unknown): string | null => typeof value === 'string' ? value : null;
const timestampOrNull = (value: unknown): string | null =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? value : null;

/** Re-project historical values using today's privacy boundary, including old schema versions. */
export function publicCarCleaningPassportSnapshot(input: unknown) {
  const snapshot = object(input);
  if (!snapshot || snapshot.category !== 'car_cleaning') return null;
  const categoryData = publicCarCleaningData(snapshot.category_data);
  return {
    id: textOrNull(snapshot.id), category: 'car_cleaning' as const,
    name: typeof categoryData.product_name === 'string' ? categoryData.product_name : '',
    description: typeof snapshot.description === 'string' && snapshot.description.length <= 10000 ? snapshot.description : null,
    category_data: categoryData, image_url: publicHttpUrl(snapshot.image_url),
    language: typeof snapshot.language === 'string' && CAR_CLEANING_LANGUAGES.has(snapshot.language) ? snapshot.language : 'en',
    public_slug: textOrNull(snapshot.public_slug),
    created_at: timestampOrNull(snapshot.created_at), updated_at: timestampOrNull(snapshot.updated_at),
  };
}

export function publicCarCleaningHistory<T extends CarCleaningVersionIndex>(archive: CarCleaningArchive, index: T[]) {
  const versions = index.slice(0, CAR_CLEANING_HISTORY_PAGE_SIZE).map(row => ({
    version: row.version, recorded_at: row.recorded_at,
  }));
  return {
    product_identifier: archive.product_identifier,
    identifier_status: 'internal_unverified' as const,
    public_path: `/p/${archive.public_slug}`,
    latest_version: archive.latest_version,
    retained_until: archive.retained_until,
    withdrawn: archive.withdrawn_at !== null,
    versions,
    next_before_version: index.length > CAR_CLEANING_HISTORY_PAGE_SIZE ? versions[versions.length - 1].version : null,
  };
}
