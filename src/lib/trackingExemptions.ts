/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 *
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 * You may use, modify, and distribute this software under the terms
 * of the OLPL license.
 *
 * Interfaces displaying Digital Product Passports generated using
 * this software must display:
 *
 *     Powered by Open-Label.eu
 *
 * See LICENSE and NOTICE files for details.
 */

/**
 * Regulatory requirement: the public Digital Product Passport view (`/p/:slug`)
 * must be strictly tracking-free. No advertising/analytics tag may be loaded,
 * no page_view or conversion may be sent, and no consent banner may be shown,
 * because the passport must be readable by anyone without any cookie or
 * consent interaction whatsoever.
 *
 * This is a hard requirement — do not add exceptions.
 */
export const TRACKING_EXEMPT_PATH_PREFIXES = ['/p/'] as const;

/** True when the given pathname must load no tracking and show no consent UI. */
export function isTrackingExemptPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = pathname.toLowerCase();
  return TRACKING_EXEMPT_PATH_PREFIXES.some(
    (prefix) => path === prefix.replace(/\/$/, '') || path.startsWith(prefix),
  );
}
