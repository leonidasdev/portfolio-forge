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

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries, type Tag } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { updateCertificationSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/certifications/[id]
 *
 * Fetches a single certification by ID.
 * Includes associated tags.
 */
export const GET = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Certification ID is required', 400)
    }

    // Fetch certification with tags using typed query helper
    const { data: certification, error } = await queries.certifications.getByIdWithTags(
      supabase,
      id
    )

    if (error) {
      if (error.message.includes('PGRST116')) {
        throw new ApiError('Certification not found', 404)
      }
      throw new ApiError(error.message, 500)
    }

    if (!certification) {
      throw new ApiError('Certification not found', 404)
    }

    // Transform tags structure
    const transformedCertification = {
      ...certification,
      tags:
        certification.certification_tags
          ?.map((ct) => ct.tags)
          .filter((tag): tag is Tag => tag !== null) || [],
      certification_tags: undefined,
    }

    return NextResponse.json({ data: transformedCertification })
  }
)

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
export const PATCH = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

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
    const { data: existing, error: checkError } = await queries.certifications.getById(supabase, id)

    if (checkError || !existing) {
      throw new ApiError('Certification not found', 404)
    }

    // Update the certification using typed query helper
    const { data: certification, error } = await queries.certifications.update(
      supabase,
      id,
      updates
    )

    if (error) {
      throw new ApiError(error.message, 500)
    }

    return NextResponse.json({ data: certification })
  }
)

/**
 * DELETE /api/v1/certifications/[id]
 *
 * Soft deletes a certification by setting is_deleted = true.
 * This preserves data integrity for portfolio items that reference this certification.
 */
export const DELETE = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Certification ID is required', 400)
    }

    // First check if certification exists and belongs to user
    const { data: existing, error: checkError } = await queries.certifications.getById(supabase, id)

    if (checkError || !existing) {
      throw new ApiError('Certification not found', 404)
    }

    // Soft delete using typed query helper
    const { error } = await queries.certifications.softDelete(supabase, id)

    if (error) {
      throw new ApiError(error.message, 500)
    }

    return NextResponse.json({ message: 'Certification deleted successfully' }, { status: 200 })
  }
)
