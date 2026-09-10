import { publicHttpUrl, publicCarCleaningData, validateCarCleaning, type CarCleaningIssue } from './carCleaning.ts';
import { CAR_CLEANING_LANGUAGES } from './carCleaningLanguages.ts';

export type CarCleaningSaveFields = {
  name: string;
  category: 'car_cleaning';
  image_url: string | null;
  description: string | null;
  language: string;
  category_data: Record<string, unknown>;
};
export type CarCleaningWriteResult = { passport: Record<string, unknown> | null; identityConflict?: boolean };
export type CarCleaningSaveRepository = {
  authenticate(token: string): Promise<{ id: string } | null>;
  create(ownerId: string, fields: CarCleaningSaveFields): Promise<CarCleaningWriteResult>;
  update(ownerId: string, passportId: string, fields: CarCleaningSaveFields): Promise<CarCleaningWriteResult>;
};
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const response = (status: number, body: unknown) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
});
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowed = new Set(['id', 'name', 'category', 'image_url', 'description', 'language', 'category_data']);

export async function handleCarCleaningSave(req: Request, repository: CarCleaningSaveRepository): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return response(405, { error: 'Method not allowed' });
  const token = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return response(401, { error: 'Authentication required' });
  try {
    const user = await repository.authenticate(token);
    if (!user) return response(401, { error: 'Authentication required' });
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 524288) return response(413, { error: 'Passport request is too large', issues: [{ field: 'category_data', code: 'length' }] });
    let input: unknown;
    try { input = JSON.parse(raw); } catch { return response(400, { error: 'Invalid request' }); }
    if (!isObject(input)) return response(400, { error: 'Invalid request' });
    const issues: CarCleaningIssue[] = [];
    for (const key of Object.keys(input)) if (!allowed.has(key)) issues.push({ field: key, code: 'type' });
    if (input.id !== undefined && (typeof input.id !== 'string' || !uuid.test(input.id))) issues.push({ field: 'id', code: 'type' });
    if (typeof input.name !== 'string' || !input.name.trim()) issues.push({ field: 'name', code: 'required' });
    else if (input.name.length > 2000) issues.push({ field: 'name', code: 'length' });
    if (input.category !== 'car_cleaning') issues.push({ field: 'category', code: 'option' });
    if (input.image_url !== null && !publicHttpUrl(input.image_url)) issues.push({ field: 'image_url', code: 'url' });
    if (input.description !== null && typeof input.description !== 'string') issues.push({ field: 'description', code: 'type' });
    else if (typeof input.description === 'string' && input.description.length > 10000) issues.push({ field: 'description', code: 'length' });
    if (typeof input.language !== 'string') issues.push({ field: 'language', code: 'type' });
    else if (!CAR_CLEANING_LANGUAGES.has(input.language)) issues.push({ field: 'language', code: 'option' });
    if (!isObject(input.category_data)) issues.push({ field: 'category_data', code: 'type' });
    if (issues.length) return response(400, { error: 'Invalid passport fields', issues });
    const fields: CarCleaningSaveFields = {
      name: input.name as string, category: 'car_cleaning',
      image_url: input.image_url as string | null, description: input.description as string | null,
      language: input.language as string, category_data: input.category_data as Record<string, unknown>,
    };
    const dataIssues = validateCarCleaning(fields.category_data);
    if (dataIssues.length) return response(422, { error: 'Review the applicable car cleaning fields', issues: dataIssues });
    // This form collects public product fields only. Do not retain stale hidden
    // branches, arbitrary nested evidence, or unknown private caller data.
    fields.category_data = publicCarCleaningData(fields.category_data);
    const result = input.id
      ? await repository.update(user.id, input.id as string, fields)
      : await repository.create(user.id, fields);
    if (result.identityConflict) return response(409, { error: 'The retained product identity cannot change. Create a new passport for a new model.' });
    if (!result.passport) return response(404, { error: 'Passport not found' });
    return response(200, { passport: result.passport });
  } catch {
    return response(500, { error: 'Failed to save passport' });
  }
}
