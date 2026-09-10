import { describe, expect, it, vi } from 'vitest';
import { handleCarCleaningSave } from '../../supabase/functions/_shared/carCleaningSaveHandler';
import { validCleaner } from '@/components/car-cleaning/testFixtures';
import { annexCleaner } from '@/components/car-cleaning/annexFixtures';
const owner = '11111111-1111-4111-8111-111111111111';
const recordId = '33333333-3333-4333-8333-333333333333';
const form = { name: 'Owner record label', category: 'car_cleaning', image_url: null, description: 'Public description', language: 'en', category_data: validCleaner };
function repository() {
  return {
    authenticate: vi.fn().mockResolvedValue({ id: owner }),
    create: vi.fn().mockResolvedValue({ passport: { id: recordId, ...form, user_id: owner } }),
    update: vi.fn().mockResolvedValue({ passport: { id: recordId, ...form, user_id: owner } }),
  };
}
const request = (body: unknown, authorization = 'Bearer opaque-test-token') => new Request('https://example.test/save', {
  method: 'POST', headers: { Authorization: authorization, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
describe('Authenticated car cleaning save gateway', () => {
  it('verifies the presented token and binds creation to the verified owner', async () => {
    const repo = repository();
    const response = await handleCarCleaningSave(request(form), repo);
    expect(response.status).toBe(200);
    expect(repo.authenticate).toHaveBeenCalledWith('opaque-test-token');
    expect(repo.create).toHaveBeenCalledWith(owner, form);
    expect(repo.update).not.toHaveBeenCalled();
    expect((await response.json()).passport.id).toBe(recordId);
  });
  it('treats id solely as an update target and separately binds the authenticated owner', async () => {
    const repo = repository();
    expect((await handleCarCleaningSave(request({ ...form, id: recordId }), repo)).status).toBe(200);
    expect(repo.update).toHaveBeenCalledWith(owner, recordId, form);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it.each(['', 'Basic invalid'])('rejects missing or inappropriate authentication without touching storage', async header => {
    const repo = repository();
    expect((await handleCarCleaningSave(request(form, header), repo)).status).toBe(401);
    expect(repo.authenticate).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('does not trust a token without a successful authoritative user lookup', async () => {
    const repo = repository(); repo.authenticate.mockResolvedValue(null);
    expect((await handleCarCleaningSave(request(form), repo)).status).toBe(401);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it.each([{ user_id: 'someone-else' }, { public_slug: 'aabbccdd' }, { id: 'not-a-uuid' }, { category: 'wine' }])('rejects identity or category overrides: %j', override => {
    return (async () => {
      const repo = repository(); const response = await handleCarCleaningSave(request({ ...form, ...override }), repo);
      expect(response.status).toBe(400);
      expect((await response.json()).issues.length).toBeGreaterThan(0);
      expect(repo.create).not.toHaveBeenCalled(); expect(repo.update).not.toHaveBeenCalled();
    })();
  });
  it('discards unknown confidential and inactive branch values before creating retained snapshots', async () => {
    const repo = repository();
    const category_data = { ...validCleaner, internal_notes: 'PRIVATE', substances: [{ confidential: 'PRIVATE' }], hazard_statements: 'INACTIVE' };
    expect((await handleCarCleaningSave(request({ ...form, category_data }), repo)).status).toBe(200);
    const stored = repo.create.mock.calls[0][1].category_data;
    expect(stored).not.toHaveProperty('internal_notes');
    expect(stored).not.toHaveProperty('substances');
    expect(stored).not.toHaveProperty('hazard_statements');
  });
  it('rejects unsupported but well-formed language codes', async () => {
    const repo = repository();
    const result = await handleCarCleaningSave(request({ ...form, language: 'zz' }), repo);
    expect(result.status).toBe(400);
    expect((await result.json()).issues).toContainEqual({ field: 'language', code: 'option' });
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('accepts every supported EU language and simplified Chinese', async () => {
    const repo = repository();
    for (const language of ['bg','cs','da','de','el','en','es','et','fi','fr','ga','hr','hu','it','lt','lv','mt','nl','pl','pt','ro','sk','sl','sv','zh-CN']) {
      expect((await handleCarCleaningSave(request({ ...form, language }), repo)).status, language).toBe(200);
    }
  });
  it('rejects an incompatible consumer SDS exception before saving future data', async () => {
    const repo = repository();
    const response = await handleCarCleaningSave(request({ ...form, category_data: { ...annexCleaner, substance_list_route: 'equivalent_sds' } }), repo);
    expect(response.status).toBe(422);
    expect((await response.json()).issues).toContainEqual({ field: 'substance_list_route', code: 'condition' });
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('surfaces retained model/profile conflicts without silently falling back to a current profile', async () => {
    const repo = repository(); repo.update.mockResolvedValue({ passport: null, identityConflict: true });
    const response = await handleCarCleaningSave(request({ ...form, id: recordId }), repo);
    expect(response.status).toBe(409);
    expect((await response.json()).error).toContain('retained product identity');
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('enforces shared conditional data validation before any write', async () => {
    const repo = repository();
    const response = await handleCarCleaningSave(request({ ...form, category_data: { ...validCleaner, product_name: '' } }), repo);
    expect(response.status).toBe(422);
    expect((await response.json()).issues).toContainEqual({ field: 'product_name', code: 'required' });
    expect(repo.create).not.toHaveBeenCalled();
  });
  it.each([null, [], 'invalid'])('rejects malformed category_data: %j', async category_data => {
    const repo = repository();
    expect((await handleCarCleaningSave(request({ ...form, category_data }), repo)).status).toBe(400);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('rejects unsafe image links, malformed descriptions and excessively large payloads', async () => {
    const repo = repository();
    for (const override of [{ image_url: 'javascript:alert(1)' }, { description: {} }]) {
      expect((await handleCarCleaningSave(request({ ...form, ...override }), repo)).status).toBe(400);
    }
    expect((await handleCarCleaningSave(request({ ...form, name: 'x'.repeat(600000) }), repo)).status).toBe(413);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('returns no row for an owner-scoped update miss and does not create a replacement', async () => {
    const repo = repository(); repo.update.mockResolvedValue({ passport: null });
    expect((await handleCarCleaningSave(request({ ...form, id: recordId }), repo)).status).toBe(404);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('does not disclose raw database errors or private values', async () => {
    const repo = repository(); repo.create.mockRejectedValue(new Error('PRIVATE DATABASE PAYLOAD'));
    const response = await handleCarCleaningSave(request(form), repo);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('PRIVATE');
  });
});
