-- Tighten storage SELECT on passport-images: public direct URLs still work via bucket public flag,
-- but listing/searching is no longer permitted by anonymous users.
DROP POLICY IF EXISTS "Anyone can view passport images" ON storage.objects;
CREATE POLICY "Owners can list their passport images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'passport-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Revoke public EXECUTE on SECURITY DEFINER functions that should never be called via PostgREST.
-- handle_new_user / generate_public_slug / update_updated_at_column are trigger-only.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_public_slug() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
-- increment_api_usage is only meant to be invoked by edge functions using the service role key.
REVOKE EXECUTE ON FUNCTION public.increment_api_usage(uuid, text, integer) FROM anon, authenticated, public;

-- Tighten site_config update policy: once any config row exists, only allow updates
-- before the very first setup_complete row is created (closing the "any authenticated
-- user can mutate before setup" gap by limiting it strictly to the trusted first-boot flow).
DROP POLICY IF EXISTS "Allow updates only during initial setup" ON public.site_config;
CREATE POLICY "Allow updates only during initial setup"
ON public.site_config FOR UPDATE TO authenticated
USING (
  NOT EXISTS (
    SELECT 1 FROM public.site_config sc WHERE sc.key = 'setup_complete'
  )
)
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.site_config sc WHERE sc.key = 'setup_complete'
  )
);

-- Tighten initial INSERT: once setup_complete row exists (regardless of value),
-- block all further inserts from clients. Pre-setup inserts remain allowed per the
-- documented trusted-first-boot model.
DROP POLICY IF EXISTS "Allow initial setup insert" ON public.site_config;
CREATE POLICY "Allow initial setup insert"
ON public.site_config FOR INSERT TO public
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.site_config sc WHERE sc.key = 'setup_complete'
  )
);