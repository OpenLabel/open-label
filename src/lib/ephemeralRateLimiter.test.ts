import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEphemeralRateLimiter } from '../../supabase/functions/_shared/ephemeralRateLimiter';
let limiter: ReturnType<typeof createEphemeralRateLimiter> | undefined;
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('crypto', webcrypto); });
afterEach(() => { limiter?.close(); limiter = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('Ephemeral public-access security rate limit', () => {
  it('allows only the configured attempts per IP in the window, including simultaneous checks', async () => {
    limiter = createEphemeralRateLimiter({ limit: 3, windowMs: 60000, maxEntries: 10 });
    const accepted = await Promise.all(Array.from({ length: 4 }, () => limiter!.check('192.0.2.1')));
    expect(accepted.filter(Boolean)).toHaveLength(3);
    expect(await limiter.check('192.0.2.2')).toBe(true);
  });
  it('expires entries even without another visitor request', async () => {
    limiter = createEphemeralRateLimiter({ limit: 1, windowMs: 1000, maxEntries: 10 });
    expect(await limiter.check('192.0.2.1')).toBe(true);
    expect(limiter.entryCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(limiter.entryCount()).toBe(0);
    expect(await limiter.check('192.0.2.1')).toBe(true);
  });
  it('bounds the total map size instead of retaining unlimited unique visitor keys', async () => {
    limiter = createEphemeralRateLimiter({ limit: 2, windowMs: 1000, maxEntries: 2 });
    expect(await limiter.check('192.0.2.1')).toBe(true);
    expect(await limiter.check('192.0.2.2')).toBe(true);
    expect(await limiter.check('192.0.2.3')).toBe(false);
    expect(limiter.entryCount()).toBe(2);
    await vi.advanceTimersByTimeAsync(1000);
    expect(await limiter.check('192.0.2.3')).toBe(true);
  });
  it('can close and erase in-memory rate state', async () => {
    limiter = createEphemeralRateLimiter({ limit: 2, windowMs: 1000, maxEntries: 2 });
    await limiter.check('192.0.2.1');
    limiter.close();
    expect(limiter.entryCount()).toBe(0);
  });
});
