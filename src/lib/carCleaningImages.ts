import { publicHttpUrl } from './carCleaning';
/** External supplier media stays behind an explicit link instead of loading a third-party pixel. */
export function carCleaningAutomaticImageUrl(value: unknown, projectUrl: string | undefined, documentOrigin: string): string | null {
  const safe = publicHttpUrl(value);
  if (!safe) return null;
  const image = new URL(safe);
  if (image.origin === documentOrigin) return safe;
  try {
    if (projectUrl && image.origin === new URL(projectUrl).origin && image.pathname.startsWith('/storage/v1/object/public/passport-images/')) return safe;
  } catch { return null; }
  return null;
}
