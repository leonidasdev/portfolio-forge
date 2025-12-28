-- =====================================================
-- STORAGE BUCKET CONFIGURATION FOR CERTIFICATIONS
-- =====================================================

-- Create or update the `certifications` bucket (idempotent).
-- This is the single source-of-truth for bucket creation.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certifications',
  'certifications',
  false,
  10485760,
  ARRAY['application/pdf','image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = EXCLUDED.public;


DO $$
BEGIN
  -- Attempt to enable RLS; report permission issues instead of skipping silently
  BEGIN
    EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'Enabled RLS on storage.objects';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not enable RLS on storage.objects: insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not enable RLS on storage.objects: %', SQLERRM;
  END;

  -- Create policies (idempotent-ish: catch duplicate errors and permission issues)
  BEGIN
    EXECUTE 'CREATE POLICY "Users can upload their own certification files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''certifications'' AND (storage.foldername(name))[1] = auth.uid()::text)';
    RAISE NOTICE 'Created policy: Users can upload their own certification files';
  EXCEPTION WHEN SQLSTATE '42710' THEN
    RAISE NOTICE 'Policy already exists: Users can upload their own certification files';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping create policy (upload): insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not create upload policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "Users can view their own certification files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''certifications'' AND (storage.foldername(name))[1] = auth.uid()::text)';
    RAISE NOTICE 'Created policy: Users can view their own certification files';
  EXCEPTION WHEN SQLSTATE '42710' THEN
    RAISE NOTICE 'Policy already exists: Users can view their own certification files';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping create policy (view): insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not create view policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "Public certification files are viewable by anyone" ON storage.objects FOR SELECT TO public USING (bucket_id = ''certifications'' AND EXISTS (SELECT 1 FROM certifications c WHERE c.file_path = storage.objects.name AND c.is_public = true AND c.is_deleted = false))';
    RAISE NOTICE 'Created policy: Public certification files are viewable by anyone';
  EXCEPTION WHEN SQLSTATE '42710' THEN
    RAISE NOTICE 'Policy already exists: Public certification files are viewable by anyone';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping create policy (public): insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not create public policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "Users can update their own certification files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''certifications'' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = ''certifications'' AND (storage.foldername(name))[1] = auth.uid()::text)';
    RAISE NOTICE 'Created policy: Users can update their own certification files';
  EXCEPTION WHEN SQLSTATE '42710' THEN
    RAISE NOTICE 'Policy already exists: Users can update their own certification files';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping create policy (update): insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not create update policy: %', SQLERRM;
  END;

  BEGIN
    EXECUTE 'CREATE POLICY "Users can delete their own certification files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''certifications'' AND (storage.foldername(name))[1] = auth.uid()::text)';
    RAISE NOTICE 'Created policy: Users can delete their own certification files';
  EXCEPTION WHEN SQLSTATE '42710' THEN
    RAISE NOTICE 'Policy already exists: Users can delete their own certification files';
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping create policy (delete): insufficient_privilege';
  WHEN others THEN
    RAISE NOTICE 'Could not create delete policy: %', SQLERRM;
  END;

END
$$;


-- Verify bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'certifications';

-- Verify policies are active
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%certification%';

-- =====================================================
-- USAGE NOTES
-- =====================================================

/*

FILE STRUCTURE:
  certifications/
    └── {userId}/
        └── {certificationId}/
            └── {timestamp}-{random}-{filename}

EXAMPLE PATHS:
  - certifications/123e4567-e89b-12d3-a456-426614174000/456/1640000000-abc123-aws-cert.pdf
  - certifications/123e4567-e89b-12d3-a456-426614174000/temp/1640000000-xyz789-temp.pdf

ACCESS CONTROL:
  1. Authenticated users can:
     - Upload to their own folder (/{userId}/...)
     - View their own files
     - Update their own files
     - Delete their own files

  2. Public (unauthenticated) users can:
     - View files IF the associated certification has is_public = true

  3. Folder isolation:
     - The first folder MUST match the user's auth.uid()
     - Users cannot access other users' folders

PUBLIC URLs vs SIGNED URLs:
  - Public certifications (is_public = true):
    → Use getPublicUrl() - no authentication required
    → URL: https://{project}.supabase.co/storage/v1/object/public/certifications/{path}
  
  - Private certifications (is_public = false):
    → Use createSignedUrl() - temporary authenticated URL
    → URL: https://{project}.supabase.co/storage/v1/object/sign/certifications/{path}?token=...
    → Expires after specified duration (default: 1 hour)

SECURITY CONSIDERATIONS:
  1. File size limited to 10MB
  2. Only specific MIME types allowed (PDF, JPEG, PNG, WebP)
  3. Users cannot access other users' files
  4. Public access requires explicit is_public flag in database
  5. Soft-deleted certifications won't make files public

MAINTENANCE:
  - Consider implementing cleanup job for orphaned files
  - Files from deleted certifications may need manual cleanup
  - Monitor storage usage per user if needed

*/
