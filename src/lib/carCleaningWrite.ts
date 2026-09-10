import type { Passport, PassportFormData } from '@/types/passport';
import { publicCarCleaningData } from './carCleaning';

export class CarCleaningWriteError extends Error {
  constructor(public code: 'identity' | 'validation') { super(code); this.name = 'CarCleaningWriteError'; }
}

type Invoke = (name: string, options: { body: Record<string, unknown> }) => Promise<{ data: { passport?: Passport } | null; error: unknown }>;
export async function writeCarCleaningPassport(input: PassportFormData & { id?: string }, invoke: Invoke): Promise<Passport> {
  const { name, image_url, description, language, category_data, id } = input;
  const { data, error } = await invoke('save-car-cleaning-passport', { body: { name, category: 'car_cleaning', image_url, description, language, category_data, ...(id ? { id } : {}) } });
  if (error) {
    const context = typeof error === 'object' && error !== null && 'context' in error ? error.context : null;
    if (context instanceof Response && context.status === 409) throw new CarCleaningWriteError('identity');
    if (context instanceof Response && [400, 422].includes(context.status)) throw new CarCleaningWriteError('validation');
    throw error;
  }
  if (!data?.passport) throw new Error('Failed to save passport');
  return data.passport;
}

/** Copies start as current information with a new model reference, never as a second issued model DPP. */
export function prepareCarCleaningDuplicate(input: unknown, previousPassportUrl?: string): Record<string, unknown> {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const result = publicCarCleaningData({ ...source, dpp_profile: 'current' });
  for (const key of ['persistent_product_id', 'manufacturer_operator_id', 'backup_provider_url', 'conformity_reference', 'commodity_code', 'data_review_date']) delete result[key];
  if (previousPassportUrl) result.previous_passport_url = previousPassportUrl;
  result.model_identifier = `${typeof source.model_identifier === 'string' ? source.model_identifier.slice(0, 1970) : 'Model'}-${crypto.randomUUID().slice(0, 8)}`;
  return result;
}
