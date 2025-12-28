/**
 * Certification File Storage Utilities (Client-Side)
 * 
 * This module provides utilities for uploading and managing certification files
 * (PDFs and images) in Supabase Storage.
 * 
 * Upload Flow:
 * 1. Client uploads file directly to Supabase Storage (this module)
 * 2. Client receives file_path from upload
 * 3. Client calls POST /api/v1/certifications with file_path
 * 4. API route creates certification record with file reference
 * 
 * This pattern avoids proxying large files through API routes.
 */

import { createBrowserClient } from '@supabase/ssr'

const BUCKET_NAME = 'certifications'

// Allowed MIME types for certifications
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Generate unique filename to avoid collisions
 * Format: timestamp-randomstring-originalname
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${timestamp}-${random}-${sanitized}`
}

/**
 * Validate file before upload
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: PDF, JPEG, PNG, WebP`,
    }
  }

  return { valid: true }
}

/**
 * Upload certification file to Supabase Storage
 * 
 * @param userId - ID of the user uploading the file
 * @param file - File object to upload
 * @param certificationId - Optional certification ID for organizing files
 * @returns Promise resolving to file path in storage
 * 
 * File structure: /{userId}/{certificationId}/{unique-filename}
 * If certificationId not provided: /{userId}/temp/{unique-filename}
 * 
 * Example usage:
 * ```tsx
 * const filePath = await uploadCertificationFile(userId, file, certId)
 * // Returns: "user-123/cert-456/1640000000000-abc123-certificate.pdf"
 * ```
 */
export async function uploadCertificationFile(
  userId: string,
  file: File,
  certificationId?: string
): Promise<string> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Create Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name)
  
  // Build file path
  // Format: userId/certificationId/filename or userId/temp/filename
  const folderPath = certificationId 
    ? `${userId}/${certificationId}`
    : `${userId}/temp`
  const filePath = `${folderPath}/${uniqueFilename}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't overwrite existing files
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return data.path
}

/**
 * Delete certification file from Supabase Storage
 * 
 * @param filePath - Path to file in storage (from certifications.file_path)
 * 
 * Example usage:
 * ```tsx
 * await deleteCertificationFile("user-123/cert-456/file.pdf")
 * ```
 */
export async function deleteCertificationFile(filePath: string): Promise<void> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get public URL for a certification file
 * 
 * Use this for public certifications (is_public = true)
 * 
 * @param filePath - Path to file in storage
 * @returns Public URL
 */
export function getPublicUrl(filePath: string): string {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}

/**
 * Get signed URL for a certification file
 * 
 * Use this for private certifications (is_public = false)
 * Signed URLs expire after the specified duration
 * 
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise resolving to signed URL
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Move file from temp folder to certification folder
 * 
 * Used after certification is created to organize files properly
 * 
 * @param userId - User ID
 * @param tempFilePath - Current file path (in temp folder)
 * @param certificationId - New certification ID
 * @returns New file path
 */
export async function moveToPermanentLocation(
  userId: string,
  tempFilePath: string,
  certificationId: string
): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Extract filename from temp path
  const filename = tempFilePath.split('/').pop()
  const newPath = `${userId}/${certificationId}/${filename}`

  // Move file
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .move(tempFilePath, newPath)

  if (error) {
    throw new Error(`Failed to move file: ${error.message}`)
  }

  return newPath
}

/**
 * Helper to determine if file should use public or signed URL
 * 
 * @param filePath - File path in storage
 * @param isPublic - Whether certification is public
 * @returns Promise resolving to URL (public or signed)
 */
export async function getCertificationFileUrl(
  filePath: string,
  isPublic: boolean
): Promise<string> {
  if (isPublic) {
    return getPublicUrl(filePath)
  } else {
    return await getSignedUrl(filePath)
  }
}
