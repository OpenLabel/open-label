/** Security-only local rate state: salted keys, a fixed capacity, and timed removal. */
export function createEphemeralRateLimiter(options = { limit: 30, windowMs: 60000, maxEntries: 10000 }) {
  const entries = new Map<string, { count: number; resetAt: number }>();
  const salt = crypto.randomUUID();
  let closed = false;
  const prune = () => {
    const now = Date.now();
    for (const [key, entry] of entries) if (entry.resetAt <= now) entries.delete(key);
  };
  // The timer also clears expired state when no subsequent visitor request arrives.
  const timer = setInterval(prune, Math.min(options.windowMs, 1000));
  return {
    async check(ip: string): Promise<boolean> {
      if (closed) return false;
      // Neither raw IP addresses nor reusable cross-isolate hashes are retained.
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
      const key = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
      if (closed) return false;
      prune();
      const now = Date.now();
      const record = entries.get(key);
      if (record) {
        if (record.count >= options.limit) return false;
        record.count++;
        return true;
      }
      if (entries.size >= options.maxEntries) return false;
      entries.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    },
    entryCount: () => entries.size,
    close() { closed = true; clearInterval(timer); entries.clear(); },
  };
}
