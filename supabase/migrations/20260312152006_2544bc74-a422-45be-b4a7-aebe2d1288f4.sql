-- Update RLS policy to use site_url instead of short_url
DROP POLICY IF EXISTS "Authenticated users can read allowed config keys" ON site_config;
CREATE POLICY "Authenticated users can read allowed config keys"
ON site_config
FOR SELECT
TO public
USING (key = ANY (ARRAY['company_name', 'company_address', 'privacy_policy_url', 'terms_conditions_url', 'ai_enabled', 'setup_complete', 'sender_email', 'site_url']));
