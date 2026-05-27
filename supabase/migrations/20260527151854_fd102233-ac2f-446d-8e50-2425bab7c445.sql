
-- Helper: returns true when the calling user is the admin recorded in site_config.admin_user_id
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_config
    WHERE key = 'admin_user_id'
      AND value = auth.uid()::text
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated;

CREATE POLICY "Admin can read all site config"
ON public.site_config
FOR SELECT
TO authenticated
USING (public.is_site_admin());

CREATE POLICY "Admin can update site config"
ON public.site_config
FOR UPDATE
TO authenticated
USING (public.is_site_admin())
WITH CHECK (public.is_site_admin());

CREATE POLICY "Admin can insert site config"
ON public.site_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_site_admin());
