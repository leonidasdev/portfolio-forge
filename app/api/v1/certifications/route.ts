/**
 * API Route Handler - Certifications Collection (v1)
 *
 * This file handles:
 * - GET /api/v1/certifications - List all certifications for authenticated user
 * - POST /api/v1/certifications - Create a new certification
 *
 * RLS policies ensure users only access their own certifications.
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries, type Tag } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { createCertificationSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/v1/certifications
 *
 * Returns all certifications for the authenticated user.
 * Supports optional query parameters:
 * - is_public: Filter by public/private status
 * - limit: Number of results to return
 * - offset: Pagination offset
 */
export const GET = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)
  const { searchParams } = new URL(request.url)

  // Optional filters
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  // Use typed query helper
  const { data: certifications, error } = await queries.certifications.listWithTags(supabase, {
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  })

  if (error) {
    throw new ApiError(error.message, 500)
  }

  // Transform tags structure for easier consumption
  const transformedCertifications = certifications?.map((cert) => ({
    ...cert,
    tags:
      cert.certification_tags?.map((ct) => ct.tags).filter((tag): tag is Tag => tag !== null) || [],
    certification_tags: undefined, // Remove junction table data
  }))

  return NextResponse.json({
    data: transformedCertifications,
    count: transformedCertifications?.length || 0,
  })
})

/**
 * POST /api/v1/certifications
 *
 * Creates a new certification for the authenticated user.
 *
 * Request body:
 * {
 *   title: string (required)
 *   issuing_organization: string (required)
 *   certification_type: 'pdf' | 'image' | 'external_link' | 'manual' (required)
 *   date_issued?: string (ISO date)
 *   expiration_date?: string (ISO date)
 *   credential_id?: string
 *   verification_url?: string
 *   file_path?: string (for pdf/image types)
 *   file_type?: string (MIME type)
 *   external_url?: string (for external_link type)
 *   description?: string
 *   is_public?: boolean
 * }
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)

  // Validate request body with Zod schema
  const body = await validateBody(request, createCertificationSchema)

  // Create the certification using typed query helper
  const { data: certification, error } = await queries.certifications.create(supabase, {
    user_id: user.id,
    title: body.title,
    issuing_organization: body.issuing_organization,
    certification_type: body.certification_type,
    date_issued: body.date_issued || null,
    expiration_date: body.expiration_date || null,
    credential_id: body.credential_id || null,
    verification_url: body.verification_url || null,
    file_path: body.file_path || null,
    file_type: body.file_type || null,
    external_url: body.external_url || null,
    description: body.description || null,
    is_public: body.is_public ?? false,
  })

  if (error) {
    throw new ApiError(error.message, 500)
  }

  return NextResponse.json({ data: certification }, { status: 201 })
})
