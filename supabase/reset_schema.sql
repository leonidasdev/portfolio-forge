
-- =====================================================
-- PORTFOLIO FORGE - DESTRUCTIVE RESET (SAFE)
-- =====================================================
-- WARNING: Destructive operation. Create a backup before running.
-- Purpose: remove existing public schema objects and clear storage rows
-- so `supabase/schema.sql` can be applied cleanly.
-- Usage: psql "<PG_CONN>" -f supabase/reset_schema.sql
-- =====================================================

-- 1) Drop and recreate `public` schema (removes tables, types, views, functions)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2) Recreate extensions required by the project
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3) Clean up Supabase storage rows (if the storage schema exists)
--    This removes bucket/object rows so re-running the main schema won't fail
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON c.relnamespace = n.oid
		WHERE n.nspname = 'storage' AND c.relname = 'objects'
	) THEN
		EXECUTE 'DELETE FROM storage.objects';
	END IF;

	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON c.relnamespace = n.oid
		WHERE n.nspname = 'storage' AND c.relname = 'buckets'
	) THEN
		EXECUTE 'DELETE FROM storage.buckets';
	END IF;
END;
$$;

-- 4) Recreate a minimal `certifications` bucket row so the following schema run can
--    insert policies/rows without failing. If you prefer the bucket recreated by
--    the main schema, you can remove this block.
-- Removed: bucket creation is centralized in `supabase/storage-buckets.sql`
-- The reset now only deletes existing storage metadata; the bucket will be
-- created by running `supabase/storage-buckets.sql` as the DB owner.

-- 4.a) Remove storage-level policies that may conflict when re-applying schema
-- These policies live in the `storage` schema (not `public`) and can cause
-- duplicate-policy errors when `supabase/schema.sql` attempts to create them.
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON c.relnamespace = n.oid
		WHERE n.nspname = 'storage' AND c.relname = 'objects'
	) THEN
		PERFORM (
			CASE WHEN EXISTS (
				SELECT 1 FROM pg_policies pol
				WHERE pol.schemaname = 'storage' AND pol.tablename = 'objects' AND pol.policyname = 'Users can upload their own certification files'
			) THEN NULL ELSE NULL END
		);
		EXECUTE 'DROP POLICY IF EXISTS "Users can upload their own certification files" ON storage.objects';
		EXECUTE 'DROP POLICY IF EXISTS "Users can view their own certification files" ON storage.objects';
		EXECUTE 'DROP POLICY IF EXISTS "Users can update their own certification files" ON storage.objects';
		EXECUTE 'DROP POLICY IF EXISTS "Users can delete their own certification files" ON storage.objects';
		EXECUTE 'DROP POLICY IF EXISTS "Public certification files are viewable by anyone" ON storage.objects';
	END IF;
END;
$$;

-- 4.b) Owner-safe removal: disable RLS and delete certification-specific metadata
-- This block attempts to disable RLS and delete rows for the certifications bucket
-- but will not fail the script if run by a non-owner (it reports errors silently).
DO $$
BEGIN
	-- Disable RLS if possible
	BEGIN
		EXECUTE 'ALTER TABLE IF EXISTS storage.objects DISABLE ROW LEVEL SECURITY';
	EXCEPTION WHEN others THEN
		-- ignore if not owner/permission denied
		NULL;
	END;

	-- Delete only rows that belong to the certifications bucket
	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON c.relnamespace = n.oid
		WHERE n.nspname = 'storage' AND c.relname = 'objects'
	) THEN
		EXECUTE 'DELETE FROM storage.objects WHERE bucket_id = ''certifications''';
	END IF;

	IF EXISTS (
		SELECT 1 FROM pg_class c
		JOIN pg_namespace n ON c.relnamespace = n.oid
		WHERE n.nspname = 'storage' AND c.relname = 'buckets'
	) THEN
		EXECUTE 'DELETE FROM storage.buckets WHERE id = ''certifications''';
	END IF;
EXCEPTION WHEN others THEN
	-- swallow errors to keep reset safe
	NULL;
END;
$$;

-- 5) Notes & next steps
-- - Take a backup before running this file (pg_dump or Supabase snapshot).
-- - After running this reset, apply the main schema:
--     psql "<CONN>" -f supabase/schema.sql
-- - If you prefer a non-destructive route, request an idempotent patch that
--   adds DROP TYPE IF EXISTS / DROP VIEW IF EXISTS statements to `supabase/schema.sql`.

-- Notes & next steps
-- - Backup first (pg_dump or Supabase snapshot).
-- - Apply the main schema after reset:
--     psql "<PG_CONN>" -f supabase/schema.sql
-- - For production with data you want to preserve, request an idempotent
--   update to `supabase/schema.sql` (DROP IF EXISTS guards) instead of reset.

-- End of reset script

