/** Export only public archive metadata, even when called with an owner-side object. */
export function carCleaningHistoryExport(input: unknown, slug: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof slug !== 'string' || !/^(?:[a-f0-9]{8}|[a-f0-9]{16}|[a-f0-9]{32})$/.test(slug)) return null;
  const data = input as Record<string, unknown>;
  const positive = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
  const timestamp = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
  if (typeof data.product_identifier !== 'string' || !/^urn:uuid:[a-f0-9-]{36}$/.test(data.product_identifier) || !positive(data.latest_version) || !timestamp(data.retained_until)) return null;
  const versions = Array.isArray(data.versions) ? data.versions.slice(0, 50).flatMap(v => {
    if (!v || typeof v !== 'object' || !positive(v.version) || !timestamp(v.recorded_at)) return [];
    return [{ version: v.version as number, recorded_at: v.recorded_at as string }];
  }) : [];
  return {
    product_identifier: data.product_identifier, identifier_status: 'internal_unverified', public_path: `/p/${slug}`,
    latest_version: data.latest_version, selected_version: positive(data.selected_version) ? data.selected_version : data.latest_version,
    retained_until: data.retained_until, withdrawn: data.withdrawn === true, versions,
    next_before_version: positive(data.next_before_version) ? data.next_before_version : null,
  };
}
