import { describe, expect, it, vi } from 'vitest';
import { fetchPublicPassport } from './publicPassportFetch';

const config = { url: 'https://project.example.test', key: 'public-project-key' };
describe('anonymous public passport requests', () => {
  it('uses only the public project credential and omits browser credentials and referrer', async () => {
    const passport = { public_slug: 'abcdef01', name: 'Cleaner' };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ passport })));
    const storage = vi.spyOn(Storage.prototype, 'getItem');
    const signal = new AbortController().signal;
    expect(await fetchPublicPassport('abcdef01', signal, config, fetcher)).toEqual(passport);
    expect(fetcher).toHaveBeenCalledWith('https://project.example.test/functions/v1/get-public-passport', {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', signal,
      headers: { 'Content-Type': 'application/json', apikey: config.key, Authorization: `Bearer ${config.key}` },
      body: JSON.stringify({ slug: 'abcdef01' }),
    });
    expect(storage).not.toHaveBeenCalled();
    storage.mockRestore();
  });

  it('rejects invalid identifiers without a request', async () => {
    const fetcher = vi.fn();
    await expect(fetchPublicPassport('../private', undefined, config, fetcher)).rejects.toThrow('Invalid passport identifier');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('handles missing and failed public responses without exposing server details', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'private backend detail' }), { status: 500 }));
    await expect(fetchPublicPassport('abcdef01', undefined, config, fetcher)).rejects.toThrow('Failed to fetch passport');
    fetcher.mockResolvedValue(new Response(JSON.stringify({})));
    await expect(fetchPublicPassport('abcdef01', undefined, config, fetcher)).rejects.toThrow('Passport not found');
  });
  it('requests the exact selected history version and supports a separate earlier-version index', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ passport: { public_slug: 'abcdef01' } })));
    await fetchPublicPassport('abcdef01', undefined, config, fetcher, { version: '2', history_before: '50' });
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ slug: 'abcdef01', version: 2, history_before: 50 });
  });
  it.each(['0', '-1', '2.5', ' 2', '2x', '9007199254740992'])('rejects malformed selected version %s without fetching', async version => {
    const fetcher = vi.fn();
    await expect(fetchPublicPassport('abcdef01', undefined, config, fetcher, { version })).rejects.toThrow('Invalid passport version');
    expect(fetcher).not.toHaveBeenCalled();
  });
});
