-- =====================================================
-- STORAGE BUCKET CONFIGURATION FOR CERTIFICATIONS
-- =====================================================
-- This SQL creates and configures the storage bucket for certification files
-- with proper RLS policies for user isolation and public access control.

-- Note: If bucket already exists from initial schema, these commands will update it
-- Run this in Supabase SQL Editor

-- =====================================================
-- CREATE BUCKET
-- =====================================================

-- Create the certifications bucket (if not exists)
-- Set public: false to require authentication by default
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certifications',
  'certifications',
  false, -- Not public by default (controlled per-file)
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can upload their own certification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own certification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own certification files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own certification files" ON storage.objects;
DROP POLICY IF EXISTS "Public certification files are viewable by anyone" ON storage.objects;

-- =====================================================
-- POLICY 1: Upload (INSERT)
-- =====================================================
-- Users can upload files to their own folder
-- Folder structure: {userId}/{certificationId}/{filename}
-- The first folder must match the authenticated user's ID

CREATE POLICY "Users can upload their own certification files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- POLICY 2: View/Download (SELECT)
-- =====================================================
-- Users can view their own files

CREATE POLICY "Users can view their own certification files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- POLICY 3: Public Access (SELECT)
-- =====================================================
-- Allow public access to certification files that belong to public certifications
-- This requires checking the certifications table

CREATE POLICY "Public certification files are viewable by anyone"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'certifications' AND
  EXISTS (
    SELECT 1 FROM certifications c
    WHERE c.file_path = storage.objects.name
      AND c.is_public = true
      AND c.is_deleted = false
  )
);

-- =====================================================
-- POLICY 4: Update (UPDATE)
-- =====================================================
-- Users can update (overwrite) their own files

CREATE POLICY "Users can update their own certification files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'certifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- POLICY 5: Delete (DELETE)
-- =====================================================
-- Users can delete their own files

CREATE POLICY "Users can delete their own certification files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certifications' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

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
