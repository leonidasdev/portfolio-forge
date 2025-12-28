/**
 * Certification File Storage Utilities (Server-Side)
 * 
 * Server-side utilities for managing certification files.
 * Used in API routes for generating signed URLs and deleting files.
 */

import { createServerClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'certifications'

/**
 * Get signed URL for a certification file (server-side)
 * 
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise resolving to signed URL
 */
export async function getSignedUrlServer(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete certification file (server-side)
 * 
 * @param filePath - Path to file in storage
 */
export async function deleteCertificationFileServer(filePath: string): Promise<void> {
  const supabase = await createServerClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get public URL for a certification file (server-side)
 * 
 * @param filePath - Path to file in storage
 * @returns Public URL
 */
export function getPublicUrlServer(filePath: string): string {
  // Public URLs don't require authentication, can construct directly
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
}

/**
 * Helper to get appropriate URL based on public status (server-side)
 * 
 * @param filePath - File path in storage
 * @param isPublic - Whether certification is public
 * @returns Promise resolving to URL
 */
export async function getCertificationFileUrlServer(
  filePath: string,
  isPublic: boolean
): Promise<string> {
  if (isPublic) {
    return getPublicUrlServer(filePath)
  } else {
    return await getSignedUrlServer(filePath)
  }
}
