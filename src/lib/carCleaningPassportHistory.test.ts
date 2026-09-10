import { describe, expect, it } from 'vitest';
import {
  publicCarCleaningPassportSnapshot,
  publicCarCleaningHistory,
} from '../../supabase/functions/_shared/carCleaningPassportHistory';
import { validCleaner } from '@/components/car-cleaning/testFixtures';

const snapshot = {
  id: '09cdf02e-4824-430a-b216-aa1a9b1f61c0', category: 'car_cleaning',
  name: 'PRIVATE RECORD NAME', description: 'Public product description',
  user_id: 'PRIVATE OWNER', image_url: 'https://example.test/product.png',
  language: 'fr', public_slug: 'aabbccdd', created_at: '2026-09-10T10:00:00Z',
  updated_at: '2026-09-10T11:00:00Z',
  category_data: { ...validCleaner, internal_notes: 'PRIVATE NOTES', technical_file: 'PRIVATE EVIDENCE' },
};
const archive = {
  passport_id: snapshot.id, product_identifier: 'urn:uuid:29cdf02e-4824-430a-b216-aa1a9b1f61c0',
  public_slug: 'aabbccdd', latest_version: 2, retained_until: '2036-09-10T11:00:00Z',
  withdrawn_at: null, user_id: 'PRIVATE OWNER',
};

describe('Public car cleaning immutable snapshots', () => {
  it('projects old snapshots through the current public allowlist, without private top-level or nested data', () => {
    const projected = publicCarCleaningPassportSnapshot(snapshot);
    expect(projected).toMatchObject({ name: validCleaner.product_name, description: 'Public product description', category: 'car_cleaning', public_slug: 'aabbccdd' });
    expect(JSON.stringify(projected)).not.toContain('PRIVATE');
    expect(projected).not.toHaveProperty('user_id');
    expect(snapshot.name).toBe('PRIVATE RECORD NAME');
  });

  it.each([null, [], {}, { ...snapshot, category: 'wine' }])('rejects malformed or other-category snapshots: %j', value => {
    expect(publicCarCleaningPassportSnapshot(value)).toBeNull();
  });

  it('omits malformed or oversized public descriptions', () => {
    for (const description of [{ private: 'PRIVATE' }, ['PRIVATE'], 'x'.repeat(10001)]) {
      expect(publicCarCleaningPassportSnapshot({ ...snapshot, description })?.description).toBeNull();
    }
  });

  it('never exposes an unsafe image or malformed primitive through the snapshot envelope', () => {
    const result = publicCarCleaningPassportSnapshot({ ...snapshot, image_url: 'javascript:alert(1)', language: { secret: 'PRIVATE' }, created_at: [] });
    expect(result?.image_url).toBeNull();
    expect(result?.language).toBe('en');
    expect(result?.created_at).toBeNull();
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
  });

  it('returns only sanitized version index metadata, with an explicit internal identifier status', () => {
    const result = publicCarCleaningHistory(archive, [
      { version: 2, recorded_at: snapshot.updated_at, snapshot, user_id: 'PRIVATE OWNER' },
      { version: 1, recorded_at: snapshot.created_at, snapshot },
    ]);
    expect(result).toMatchObject({
      product_identifier: archive.product_identifier, identifier_status: 'internal_unverified',
      public_path: '/p/aabbccdd', latest_version: 2, retained_until: archive.retained_until,
      withdrawn: false, versions: [
        { version: 2, recorded_at: snapshot.updated_at }, { version: 1, recorded_at: snapshot.created_at },
      ], next_before_version: null,
    });
    expect(JSON.stringify(result)).not.toContain('PRIVATE');
    expect(result.versions[0]).not.toHaveProperty('snapshot');
  });

  it('bounds the version index and exposes a cursor instead of silently losing older versions', () => {
    const versions = Array.from({ length: 51 }, (_, index) => ({ version: 100 - index, recorded_at: snapshot.created_at }));
    const result = publicCarCleaningHistory({ ...archive, latest_version: 100, withdrawn_at: snapshot.updated_at }, versions);
    expect(result.versions).toHaveLength(50);
    expect(result.next_before_version).toBe(51);
    expect(result.withdrawn).toBe(true);
  });
});
