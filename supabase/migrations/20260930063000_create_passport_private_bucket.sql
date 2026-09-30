-- Create the private bucket for Apparel internal documents so fresh
-- self-hosted deployments match the live configuration. RLS policies for this
-- bucket live in 20260917044006_8fbe55c8-5d0e-45df-8328-0e77ee18d759.sql.
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('passport-private', 'passport-private', false, 10485760)
ON CONFLICT (id) DO NOTHING;
