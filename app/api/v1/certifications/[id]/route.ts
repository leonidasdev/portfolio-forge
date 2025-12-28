/**
 * API Route Handler - Individual Certification (v1)
 * 
 * This file handles:
 * - GET /api/v1/certifications/[id] - Fetch a single certification
 * - PATCH /api/v1/certifications/[id] - Update a certification
 * - DELETE /api/v1/certifications/[id] - Delete a certification (soft delete)
 * 
 * RLS policies ensure users only access their own certifications.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { updateCertificationSchema } from '@/lib/validation/schemas'

/**
 * GET /api/v1/certifications/[id]
 * 
 * Fetches a single certification by ID.
 * Includes associated tags.
 */
export const GET = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Certification ID is required', 400)
  }
  
  // Fetch certification with tags
  const { data: certification, error } = await supabase
    .from('certifications')
    .select(`
      *,
      certification_tags (
        tag_id,
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiError('Certification not found', 404)
    }
    throw new ApiError(error.message, 500)
  }
  
  // Transform tags structure
  const transformedCertification = {
    ...certification,
    tags: certification.certification_tags?.map((ct: any) => ct.tags).filter(Boolean) || [],
    certification_tags: undefined,
  }
  
  return NextResponse.json({ data: transformedCertification })
})

/**
 * PATCH /api/v1/certifications/[id]
 * 
 * Updates a certification.
 * Only updates fields that are provided in the request body.
 * 
 * Request body: Partial certification object
 * {
 *   title?: string
 *   issuing_organization?: string
 *   date_issued?: string
 *   expiration_date?: string
 *   credential_id?: string
 *   verification_url?: string
 *   description?: string
 *   is_public?: boolean
 *   // Note: certification_type, file_path, external_url cannot be changed
 * }
 */
export const PATCH = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Certification ID is required', 400)
  }
  
  // Validate request body with Zod schema
  const updates = await validateBody(request, updateCertificationSchema)
  
  // Check if there are any updates
  if (Object.keys(updates).length === 0) {
    throw new ApiError('No valid fields to update', 400)
  }
  
  // First check if certification exists and belongs to user
  const { data: existing, error: checkError } = await supabase
    .from('certifications')
    .select('id')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()
  
  if (checkError || !existing) {
    throw new ApiError('Certification not found', 404)
  }
  
  // Update the certification
  const { data: certification, error } = await supabase
    .from('certifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    throw new ApiError(error.message, 500)
  }
  
  return NextResponse.json({ data: certification })
})

/**
 * DELETE /api/v1/certifications/[id]
 * 
 * Soft deletes a certification by setting is_deleted = true.
 * This preserves data integrity for portfolio items that reference this certification.
 */
export const DELETE = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Certification ID is required', 400)
  }
  
  // First check if certification exists and belongs to user
  const { data: existing, error: checkError } = await supabase
    .from('certifications')
    .select('id')
    .eq('id', id)
    .eq('is_deleted', false)
    .single()
  
  if (checkError || !existing) {
    throw new ApiError('Certification not found', 404)
  }
  
  // Soft delete by setting is_deleted = true
  const { error } = await supabase
    .from('certifications')
    .update({ is_deleted: true })
    .eq('id', id)
  
  if (error) {
    throw new ApiError(error.message, 500)
  }
  
  return NextResponse.json(
    { message: 'Certification deleted successfully' },
    { status: 200 }
  )
})
