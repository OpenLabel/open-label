CREATE POLICY "Owners can read their private passport files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'passport-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can upload their private passport files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'passport-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can update their private passport files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'passport-private' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'passport-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Owners can delete their private passport files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'passport-private' AND auth.uid()::text = (storage.foldername(name))[1]);