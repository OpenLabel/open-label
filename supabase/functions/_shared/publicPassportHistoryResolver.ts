import {
  CAR_CLEANING_HISTORY_PAGE_SIZE,
  type CarCleaningArchive,
  type CarCleaningVersionIndex,
  publicCarCleaningHistory,
  publicCarCleaningPassportSnapshot,
} from './carCleaningPassportHistory.ts';

export type PublicPassportHistoryRequest = { slug: string; version?: number; history_before?: number };
export type PublicPassportHistoryRepository = {
  getArchive(slug: string): Promise<CarCleaningArchive | null>;
  getVersion(passportId: string, version: number): Promise<{ snapshot: unknown } | null>;
  getIndex(passportId: string, before: number | undefined, limit: number): Promise<CarCleaningVersionIndex[]>;
};

/** A deleted live row still resolves through its retained archive using exactly the same slug. */
export async function resolvePublicPassportHistory(
  live: Record<string, unknown> | null,
  request: PublicPassportHistoryRequest,
  repository: PublicPassportHistoryRepository,
): Promise<Record<string, unknown> | null> {
  if (live && live.category !== 'car_cleaning') return request.version ? null : live;
  const archive = await repository.getArchive(request.slug);
  if (!archive) {
    // Older installations may have an unsnapshotted record. Never invent history metadata.
    return !request.version && live ? publicCarCleaningPassportSnapshot(live) : null;
  }
  const selectedVersion = request.version ?? archive.latest_version;
  const [version, index] = await Promise.all([
    repository.getVersion(archive.passport_id, selectedVersion),
    repository.getIndex(archive.passport_id, request.history_before, CAR_CLEANING_HISTORY_PAGE_SIZE + 1),
  ]);
  if (!version) return null;
  const passport = publicCarCleaningPassportSnapshot(version.snapshot);
  if (!passport) return null;
  return {
    ...passport,
    dpp_history: { ...publicCarCleaningHistory(archive, index), selected_version: selectedVersion },
  };
}
