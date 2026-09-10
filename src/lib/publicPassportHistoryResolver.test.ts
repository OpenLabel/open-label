import { describe, expect, it, vi } from 'vitest';
import { resolvePublicPassportHistory } from '../../supabase/functions/_shared/publicPassportHistoryResolver';
import { validCleaner } from '@/components/car-cleaning/testFixtures';
const archive = {
  passport_id: 'product-record', product_identifier: 'urn:uuid:internal', public_slug: 'aabbccdd',
  latest_version: 2, retained_until: '2036-09-10T10:00:00Z', withdrawn_at: null,
};
const snapshot = {
  id: archive.passport_id, public_slug: archive.public_slug, category: 'car_cleaning', name: 'PRIVATE NAME',
  category_data: { ...validCleaner, internal_notes: 'PRIVATE EVIDENCE' },
};
function repository() {
  return {
    getArchive: vi.fn().mockResolvedValue(archive),
    getVersion: vi.fn().mockResolvedValue({ snapshot }),
    getIndex: vi.fn().mockResolvedValue([{ version: 2, recorded_at: '2026-09-10T10:00:00Z', snapshot }]),
  };
}
describe('Public history repository boundary', () => {
  it('serves a sanitized retained version when the live row no longer exists', async () => {
    const repo = repository();
    repo.getArchive.mockResolvedValue({ ...archive, withdrawn_at: '2026-09-11T10:00:00Z' });
    const result = await resolvePublicPassportHistory(null, { slug: archive.public_slug }, repo);
    expect(result).toMatchObject({ category: 'car_cleaning', name: validCleaner.product_name, dpp_history: { withdrawn: true, selected_version: 2 } });
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
    expect(repo.getVersion).toHaveBeenCalledWith(archive.passport_id, 2);
  });
  it('fetches an exact historical version and paginated metadata without leaking snapshot bodies in the index', async () => {
    const repo = repository();
    const result = await resolvePublicPassportHistory(snapshot, { slug: archive.public_slug, version: 1, history_before: 51 }, repo);
    expect(repo.getVersion).toHaveBeenCalledWith(archive.passport_id, 1);
    expect(repo.getIndex).toHaveBeenCalledWith(archive.passport_id, 51, 51);
    expect(result?.dpp_history).toMatchObject({ selected_version: 1, versions: [{ version: 2, recorded_at: '2026-09-10T10:00:00Z' }] });
    expect(JSON.stringify(result?.dpp_history)).not.toContain('PRIVATE');
  });
  it('does not replace an unknown requested version with the latest row', async () => {
    const repo = repository(); repo.getVersion.mockResolvedValue(null);
    expect(await resolvePublicPassportHistory(snapshot, { slug: archive.public_slug, version: 999 }, repo)).toBeNull();
  });
  it('keeps existing other-category public responses and skips car history queries', async () => {
    const repo = repository(); const wine = { category: 'wine', name: 'Wine' };
    expect(await resolvePublicPassportHistory(wine, { slug: archive.public_slug }, repo)).toBe(wine);
    expect(repo.getArchive).not.toHaveBeenCalled();
    expect(await resolvePublicPassportHistory(wine, { slug: archive.public_slug, version: 1 }, repo)).toBeNull();
  });
  it('omits history claims when no retained archive exists, and cannot invent old versions', async () => {
    const repo = repository(); repo.getArchive.mockResolvedValue(null);
    const result = await resolvePublicPassportHistory(snapshot, { slug: archive.public_slug }, repo);
    expect(result).not.toHaveProperty('dpp_history');
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
    expect(await resolvePublicPassportHistory(snapshot, { slug: archive.public_slug, version: 1 }, repo)).toBeNull();
    expect(await resolvePublicPassportHistory(null, { slug: archive.public_slug }, repo)).toBeNull();
  });
  it('propagates archive failures instead of pretending a retention guarantee exists', async () => {
    const repo = repository(); repo.getArchive.mockRejectedValue(new Error('Storage unavailable'));
    await expect(resolvePublicPassportHistory(snapshot, { slug: archive.public_slug }, repo)).rejects.toThrow('Storage unavailable');
  });
});
