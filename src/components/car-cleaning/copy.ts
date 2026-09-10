import { CAR_CLEANING_COPY } from '@/templates/carCleaning';

/** English fallback values share the same nested keys as the locale bundles. */
export function carCleaningFallback(key: string): string {
  const path = key.replace(/^carCleaning\./, '').split('.');
  let value: unknown = CAR_CLEANING_COPY;
  for (const part of path) {
    if (!value || typeof value !== 'object') return key;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : key;
}
