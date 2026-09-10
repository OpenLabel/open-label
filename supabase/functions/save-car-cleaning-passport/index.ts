import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCarCleaningSave, type CarCleaningWriteResult } from '../_shared/carCleaningSaveHandler.ts';

serve(async req => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const storage = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const writeResult = (data: Record<string, unknown> | null, error: { code?: string } | null): CarCleaningWriteResult => {
    if (error?.code === '23514') return { passport: null, identityConflict: true };
    if (error) throw new Error('Passport write failed');
    return { passport: data };
  };
  return handleCarCleaningSave(req, {
    async authenticate(token) {
      // The auth service verifies token validity and current account state.
      // No caller-supplied user_id or decoded, unverified JWT claim is trusted.
      const { data, error } = await auth.auth.getUser(token);
      return error || !data.user ? null : { id: data.user.id };
    },
    async create(ownerId, fields) {
      const { data, error } = await storage.from('passports')
        .insert({ ...fields, user_id: ownerId, category: 'car_cleaning' }).select().single();
      return writeResult(data, error);
    },
    async update(ownerId, passportId, fields) {
      // Service role bypasses RLS, so both ownership and existing category must be
      // bound explicitly. Never accept either constraint from the request body.
      const { data, error } = await storage.from('passports')
        .update({ ...fields, category: 'car_cleaning' })
        .eq('id', passportId).eq('user_id', ownerId).eq('category', 'car_cleaning')
        .select().maybeSingle();
      return writeResult(data, error);
    },
  });
});
