import { describe, expect, it, vi } from 'vitest';
import { prepareCarCleaningDuplicate, writeCarCleaningPassport } from './carCleaningWrite';
import { annexCleaner } from '@/components/car-cleaning/annexFixtures';
describe('Car cleaning writes through the validated gateway', () => {
  it('sends only the permitted envelope and preserves structured category data', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { passport: { id: 'new-id' } }, error: null });
    const input = { id: 'old-id', name: 'Internal name', category: 'car_cleaning' as const, description: 'Public description', image_url: null, language: 'en', category_data: annexCleaner, user_id: 'SPOOF', public_slug: 'SPOOF' };
    expect(await writeCarCleaningPassport(input, invoke)).toEqual({ id: 'new-id' });
    expect(invoke).toHaveBeenCalledWith('save-car-cleaning-passport', { body: { id: 'old-id', name: input.name, category: 'car_cleaning', description: input.description, image_url: null, language: 'en', category_data: annexCleaner } });
  });
  it('does not reuse a model passport or supplier issued identifiers on duplicate', () => {
    const duplicate = prepareCarCleaningDuplicate(annexCleaner);
    expect(duplicate.dpp_profile).toBe('current');
    expect(duplicate.model_identifier).not.toBe(annexCleaner.model_identifier);
    expect(duplicate).not.toHaveProperty('persistent_product_id');
    expect(duplicate).not.toHaveProperty('substances');
    expect(duplicate).not.toHaveProperty('manufacturer_responsibility');
  });
  it('fails closed on missing response and server validation errors', async () => {
    const input = { name: 'name', category: 'car_cleaning' as const, description: '', image_url: null, language: 'en', category_data: {} };
    await expect(writeCarCleaningPassport(input, vi.fn().mockResolvedValue({ data: {}, error: null }))).rejects.toThrow();
    await expect(writeCarCleaningPassport(input, vi.fn().mockResolvedValue({ data: null, error: new Error('Validation failed') }))).rejects.toThrow('Validation failed');
  });
  it('classifies retained identity and validation failures for translated form feedback', async () => {
    const input = { name: 'name', category: 'car_cleaning' as const, description: '', image_url: null, language: 'en', category_data: {} };
    for (const [status, code] of [[409, 'identity'], [422, 'validation']] as const) {
      const error = Object.assign(new Error('Edge Function returned a non-2xx status code'), { context: new Response('{}', { status }) });
      await expect(writeCarCleaningPassport(input, vi.fn().mockResolvedValue({ data: null, error }))).rejects.toMatchObject({ code });
    }
  });
});
