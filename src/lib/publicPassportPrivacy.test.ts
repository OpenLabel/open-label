import { describe, expect, it, vi } from 'vitest';
import { getPassportAuthOptions, mustReloadPublicDocument } from './publicPassportPrivacy';

describe('public passport document isolation', () => {
  it.each(['/p/abcdef01', '/P/abcdef01', '/%70/abcdef01'])('never accesses account storage on %s', path => {
    const getStorage = vi.fn(() => localStorage);
    expect(getPassportAuthOptions(path, getStorage)).toEqual({
      persistSession: false, autoRefreshToken: false, detectSessionInUrl: false,
    });
    expect(getStorage).not.toHaveBeenCalled();
  });

  it('keeps authoring session behavior', () => {
    const getStorage = vi.fn(() => localStorage);
    expect(getPassportAuthOptions('/passport/new', getStorage)).toMatchObject({ persistSession: true, autoRefreshToken: true, storage: localStorage });
    expect(getStorage).toHaveBeenCalledOnce();
  });

  it('reloads only a marketing document entering public content and never loops on a cold public load', () => {
    expect(mustReloadPublicDocument('/p/abcdef01', true)).toBe(true);
    expect(mustReloadPublicDocument('/p/abcdef01', false)).toBe(false);
    expect(mustReloadPublicDocument('/', true)).toBe(false);
  });
});
