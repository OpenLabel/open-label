// Run against an isolated in-memory PostgreSQL engine, never a remote database.
// node supabase/tests/car_cleaning_passport_history.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const moduleName = process.argv[2] ? pathToFileURL(process.argv[2]).href : '@electric-sql/pglite';
const { PGlite } = await import(moduleName);
const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111';
const stranger = '22222222-2222-4222-8222-222222222222';
const passport = '33333333-3333-4333-8333-333333333333';
await db.exec(`
  CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid PRIMARY KEY);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
  CREATE TYPE public.product_category AS ENUM ('wine', 'other');
  CREATE TABLE public.passports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL, category public.product_category NOT NULL DEFAULT 'other', image_url text,
    description text, language text NOT NULL DEFAULT 'en', category_data jsonb DEFAULT '{}', public_slug text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), display_order integer DEFAULT 0
  );
  INSERT INTO auth.users VALUES ('${owner}'), ('${stranger}');
`);
await db.exec(readFileSync(new URL('../migrations/20260910095000_add_car_cleaning_category.sql', import.meta.url), 'utf8'));
await db.exec(`INSERT INTO public.passports (id,user_id,name,category,public_slug,category_data)
VALUES ('${passport}','${owner}','Private draft','car_cleaning','aabbccdd','{"product_name":"Cleaner","detergent_scope":"yes","dpp_profile":"annex_vi","model_identifier":"MODEL-A","model_content_reference":"FORMULA-1","manufacturing_process_reference":"PROCESS-1","manufacturer_operator_id":"OPERATOR-1","clp_classification":"none","internal_notes":"PRIVATE EVIDENCE"}');`);
await db.exec(readFileSync(new URL('../migrations/20260910110000_car_cleaning_passport_history.sql', import.meta.url), 'utf8'));
let passed = 0;
async function test(name, run) { await run(); passed++; console.log(`PASS ${name}`); }
const rows = async sql => (await db.query(sql)).rows;
async function fails(sql, pattern) { await assert.rejects(db.exec(sql), pattern); }
async function asOwner(sql, id = owner) {
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '${id}';`);
  try { return await db.query(sql); } finally { await db.exec('RESET ROLE; RESET request.jwt.claim.sub;'); }
}
await test('backfills only the existing car cleaning row without touching it', async () => {
  assert.equal((await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_versions'))[0].n, 1);
  assert.equal((await rows(`SELECT name FROM public.passports WHERE id='${passport}'`))[0].name, 'Private draft');
});
await test('archive identity is generated and ten-year floor is enforced', async () => {
  const [archive] = await rows('SELECT *, retained_until >= created_at + interval \'10 years\' AS retained FROM public.car_cleaning_passport_archives');
  assert.match(archive.product_identifier, /^urn:uuid:[a-f0-9-]{36}$/);
  assert.equal(archive.latest_version, 1);
  assert.equal(archive.retained, true);
});
await test('owner can read private history and another owner cannot', async () => {
  assert.equal((await asOwner('SELECT snapshot FROM public.car_cleaning_passport_versions')).rows.length, 1);
  assert.equal((await asOwner('SELECT * FROM public.car_cleaning_passport_versions', stranger)).rows.length, 0);
  assert.equal((await asOwner('SELECT * FROM public.car_cleaning_passport_archives', stranger)).rows.length, 0);
});
await test('anonymous SQL cannot read private snapshots or archive metadata', async () => {
  await db.exec('SET ROLE anon');
  try {
    await fails('SELECT * FROM public.car_cleaning_passport_versions', /permission denied/);
    await fails('SELECT * FROM public.car_cleaning_passport_archives', /permission denied/);
  } finally { await db.exec('RESET ROLE'); }
});
await test('owner cannot forge versions, delete history, or shorten retention', async () => {
  await assert.rejects(asOwner(`UPDATE public.car_cleaning_passport_archives SET retained_until=now()`), /permission denied/);
  await assert.rejects(asOwner(`DELETE FROM public.car_cleaning_passport_versions`), /permission denied/);
  await assert.rejects(asOwner(`INSERT INTO public.car_cleaning_passport_versions SELECT * FROM public.car_cleaning_passport_versions`), /permission denied/);
});
await test('changed content creates an immutable complete second snapshot', async () => {
  await db.exec(`UPDATE public.passports SET category_data=category_data || '{"use_instructions":"Corrected instructions"}' WHERE id='${passport}'`);
  const versions = await rows('SELECT version,snapshot FROM public.car_cleaning_passport_versions ORDER BY version');
  assert.equal(versions.length, 2);
  assert.equal(versions[0].snapshot.category_data.product_name, 'Cleaner');
  assert.equal(versions[1].snapshot.category_data.use_instructions, 'Corrected instructions');
  assert.equal(versions[0].snapshot.category_data.internal_notes, 'PRIVATE EVIDENCE');
  assert.equal((await rows('SELECT latest_version FROM public.car_cleaning_passport_archives'))[0].latest_version, 2);
  await fails(`UPDATE public.car_cleaning_passport_versions SET snapshot='{}'`, /immutable/);
  await fails(`DELETE FROM public.car_cleaning_passport_versions`, /immutable/);
});
await test('dashboard reorder and timestamp-only writes do not create content versions', async () => {
  await db.exec(`UPDATE public.passports SET display_order=12,updated_at=now() WHERE id='${passport}'`);
  assert.equal((await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_versions'))[0].n, 2);
});
await test('stable car identity, owner and slug cannot be mutated', async () => {
  for (const assignment of ["public_slug='ccddeeff'", `user_id='${stranger}'`, "category='wine'", "id='44444444-4444-4444-8444-444444444444'"]) {
    await fails(`UPDATE public.passports SET ${assignment} WHERE id='${passport}'`, /identity/);
  }
});
await test('Annex VI model identity cannot be changed by switching profile in the same write', async () => {
  await fails(`UPDATE public.passports SET category_data='{"dpp_profile":"current","model_identifier":"MODEL-B"}' WHERE id='${passport}'`, /model/);
});
await test('model identity remains fixed after a downgrade to current profile', async () => {
  await db.exec(`UPDATE public.passports SET category_data=category_data || '{"dpp_profile":"current"}' WHERE id='${passport}'`);
  await fails(`UPDATE public.passports SET category_data=category_data || '{"model_identifier":"MODEL-B"}' WHERE id='${passport}'`, /model/);
});
await test('the retained model definition cannot be changed after a profile downgrade', async () => {
  for (const key of ['product_name','manufacturer_operator_id','model_content_reference','manufacturing_process_reference','clp_classification']) {
    await fails(`UPDATE public.passports SET category_data=category_data || jsonb_build_object('${key}','CHANGED') WHERE id='${passport}'`, /model/);
  }
});
await test('a projected profile downgrade cannot remove retained model revision references', async () => {
  await fails(`UPDATE public.passports SET category_data=(category_data || '{"dpp_profile":"current"}') - 'model_content_reference' - 'manufacturing_process_reference' WHERE id='${passport}'`, /model/);
});
await test('latest placement extends retention and later corrections cannot shorten it', async () => {
  await db.exec(`UPDATE public.passports SET category_data=category_data || '{"last_placed_on_market_date":"2040-02-29"}' WHERE id='${passport}'`);
  let [archive] = await rows('SELECT retained_until FROM public.car_cleaning_passport_archives');
  assert.equal(new Date(archive.retained_until).toISOString().slice(0,10), '2050-02-28');
  await db.exec(`UPDATE public.passports SET category_data=category_data || '{"last_placed_on_market_date":"2020-01-01"}' WHERE id='${passport}'`);
  [archive] = await rows('SELECT retained_until FROM public.car_cleaning_passport_archives');
  assert.equal(new Date(archive.retained_until).toISOString().slice(0,10), '2050-02-28');
});
await test('invalid placement dates cannot abort saves or falsely extend policy', async () => {
  await db.exec(`UPDATE public.passports SET category_data=category_data || '{"last_placed_on_market_date":"2040-02-31"}' WHERE id='${passport}'`);
  const [archive] = await rows('SELECT retained_until FROM public.car_cleaning_passport_archives');
  assert.equal(new Date(archive.retained_until).toISOString().slice(0,10), '2050-02-28');
});
await test('owner delete retains public lookup metadata, private versions and immutable withdrawal state', async () => {
  const before = (await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_versions'))[0].n;
  await db.exec(`DELETE FROM public.passports WHERE id='${passport}'`);
  const [archive] = await rows(`SELECT * FROM public.car_cleaning_passport_archives WHERE public_slug='aabbccdd'`);
  assert.ok(archive.withdrawn_at);
  assert.equal((await asOwner('SELECT * FROM public.car_cleaning_passport_versions')).rows.length, before);
  assert.equal((await rows(`SELECT count(*) AS n FROM public.passports WHERE id='${passport}'`))[0].n, 0);
});
await test('an archived car URI cannot be reused by another category or owner', async () => {
  await fails(`INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${stranger}','Replacement','wine','aabbccdd')`, /reserved/);
});
await test('other categories retain their ordinary edit and delete behavior', async () => {
  await db.exec(`INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${stranger}','Wine','wine','bbbbcccc'); UPDATE public.passports SET public_slug='ccccdddd' WHERE public_slug='bbbbcccc'; DELETE FROM public.passports WHERE public_slug='ccccdddd';`);
  assert.equal((await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_archives'))[0].n, 1);
});
await test('account cascade deletion does not destroy archived passports or block account erasure', async () => {
  await db.exec(`INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${owner}','Second cleaner','car_cleaning','ddddaaaa'); DELETE FROM auth.users WHERE id='${owner}';`);
  assert.equal((await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_archives'))[0].n, 2);
  assert.ok((await rows(`SELECT withdrawn_at FROM public.car_cleaning_passport_archives WHERE public_slug='ddddaaaa'`))[0].withdrawn_at);
  assert.equal((await rows(`SELECT count(*) AS n FROM auth.users WHERE id='${owner}'`))[0].n, 0);
});
// Later validation gateway policy keeps the existing owner-scoped reorder RPC usable.
await db.exec(`
  INSERT INTO auth.users VALUES ('${owner}');
  ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;
  GRANT SELECT,INSERT,UPDATE,DELETE ON public.passports TO authenticated,service_role;
  CREATE POLICY owner_select ON public.passports FOR SELECT TO authenticated USING(auth.uid()=user_id);
  CREATE POLICY owner_insert ON public.passports FOR INSERT TO authenticated WITH CHECK(auth.uid()=user_id);
  CREATE POLICY owner_update ON public.passports FOR UPDATE TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
  CREATE POLICY owner_delete ON public.passports FOR DELETE TO authenticated USING(auth.uid()=user_id);
  INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${owner}','Gateway cleaner','car_cleaning','1234abcd'),('${owner}','Ordinary wine','wine','1234bcde');
`);
await db.exec(readFileSync(new URL('../migrations/20260728085427_f5796f8d-7f97-4e87-bcce-1cd9f9b11bfa.sql', import.meta.url), 'utf8'));
await db.exec(readFileSync(new URL('../migrations/20260910120000_require_car_cleaning_save_gateway.sql', import.meta.url), 'utf8'));
await test('direct authenticated car inserts and updates are denied by the gateway policy', async () => {
  await assert.rejects(asOwner(`INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${owner}','Bypass','car_cleaning','1234cdef')`), /row-level security/);
  await assert.rejects(asOwner(`UPDATE public.passports SET name='Bypass' WHERE public_slug='1234abcd'`), /row-level security/);
});
await test('ordinary category owner writes remain allowed after the gateway policy', async () => {
  await asOwner(`UPDATE public.passports SET name='Updated wine' WHERE public_slug='1234bcde'`);
  await asOwner(`INSERT INTO public.passports (user_id,name,category,public_slug) VALUES ('${owner}','Other product','other','1234defa')`);
  assert.equal((await rows(`SELECT name FROM public.passports WHERE public_slug='1234bcde'`))[0].name, 'Updated wine');
});
await test('the existing owner-scoped reorder RPC still updates car display order without a content version', async () => {
  const before = (await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_versions'))[0].n;
  const owned = await rows(`SELECT id FROM public.passports WHERE user_id='${owner}' ORDER BY public_slug DESC`);
  await asOwner(`SELECT public.reorder_passports(ARRAY[${owned.map(row => `'${row.id}'::uuid`).join(',')}])`);
  assert.equal((await rows('SELECT count(*) AS n FROM public.car_cleaning_passport_versions'))[0].n, before);
  assert.equal((await rows(`SELECT display_order FROM public.passports WHERE public_slug='1234abcd'`))[0].display_order, 2);
});
await test('trusted gateway role may write validated car rows while triggers still capture history', async () => {
  await db.exec('SET ROLE service_role');
  try { await db.exec(`UPDATE public.passports SET name='Gateway update' WHERE public_slug='1234abcd' AND user_id='${owner}' AND category='car_cleaning'`); }
  finally { await db.exec('RESET ROLE'); }
  assert.equal((await rows(`SELECT latest_version FROM public.car_cleaning_passport_archives WHERE public_slug='1234abcd'`))[0].latest_version, 2);
});
await test('ordinary authenticated deletion remains available and retains the car archive', async () => {
  await asOwner(`DELETE FROM public.passports WHERE public_slug='1234abcd'`);
  assert.ok((await rows(`SELECT withdrawn_at FROM public.car_cleaning_passport_archives WHERE public_slug='1234abcd'`))[0].withdrawn_at);
});
await test('a hidden Annex profile on a non-detergent does not prematurely bind its model', async () => {
  await db.exec(`INSERT INTO public.passports (user_id,name,category,public_slug,category_data) VALUES ('${owner}','Wax','car_cleaning','1234aaaa','{"detergent_scope":"no","dpp_profile":"annex_vi","model_identifier":"WAX-1"}'); UPDATE public.passports SET category_data=category_data || '{"model_identifier":"WAX-2"}' WHERE public_slug='1234aaaa'`);
  assert.equal((await rows(`SELECT guarded_model_definition FROM public.car_cleaning_passport_archives WHERE public_slug='1234aaaa'`))[0].guarded_model_definition, null);
});
await test('missing legacy model references can be supplied once and are then fixed', async () => {
  await db.exec(`INSERT INTO public.passports (user_id,name,category,public_slug,category_data) VALUES ('${owner}','Legacy','car_cleaning','1234bbbb','{"detergent_scope":"yes","dpp_profile":"annex_vi","model_identifier":"LEGACY-1"}'); UPDATE public.passports SET category_data=category_data || '{"model_content_reference":"FORMULA-1"}' WHERE public_slug='1234bbbb'`);
  await fails(`UPDATE public.passports SET category_data=category_data || '{"model_content_reference":"FORMULA-2"}' WHERE public_slug='1234bbbb'`, /model/);
});
console.log(`${passed} database checks passed`);
await db.close();
