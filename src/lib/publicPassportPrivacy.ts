/** Public product access must not initialize an account or advertising session. */
export function isPublicPassportPath(path: string): boolean {
  try {
    return /^\/p(?:\/|$)/i.test(decodeURIComponent(path.split(/[?#]/, 1)[0]));
  } catch {
    return /^\/p(?:\/|[?#]|$)/i.test(path);
  }
}

export function getPassportAuthOptions<T>(path: string, getStorage: () => T) {
  if (isPublicPassportPath(path)) {
    return { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
  }
  return { storage: getStorage(), persistSession: true, autoRefreshToken: true };
}

export function mustReloadPublicDocument(path: string, marketingDocument: boolean): boolean {
  return isPublicPassportPath(path) && marketingDocument;
}

/** A script element cannot unload an advertising SDK's event handlers. */
export function reloadPublicPassportDocument(): void {
  window.location.reload();
}
