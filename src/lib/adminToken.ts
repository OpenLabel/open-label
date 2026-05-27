/*
 * Open-Label Digital Product Passport Engine
 * Copyright (C) 2026 Open-Label.eu
 * Licensed under the Open-Label Public License (OLPL) v1.0.
 */

// Generates a 32-byte URL-safe random token using the Web Crypto API.
// Never hardcoded; never stored in source. Returned to the caller to be
// persisted in site_config.admin_leaderboard_token.
export function generateAdminToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url (no padding)
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
