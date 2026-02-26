/**
 * Tags API Routes (Collection)
 *
 * GET  /api/v1/tags - List all tags for authenticated user
 * POST /api/v1/tags - Create a new tag
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { createTagSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/tags - List all tags for the authenticated user
export const GET = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)

  // Fetch all tags for the user using typed query helper
  const { data: tags, error } = await queries.tags.list(supabase)

  if (error) {
    throw new ApiError('Failed to fetch tags', 500)
  }

  return NextResponse.json({ tags })
})

// POST /api/v1/tags - Create a new tag
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)

  // Validate request body
  const body = await validateBody(request, createTagSchema)

  // Check if tag with same name already exists - check current tags
  const { data: existingTags } = await queries.tags.list(supabase)
  const existingTag = existingTags?.find((t) => t.name === body.name)

  if (existingTag) {
    throw new ApiError('A tag with this name already exists', 409)
  }

  // Create the tag using typed query helper
  const { data: tag, error } = await queries.tags.create(supabase, {
    user_id: user.id,
    name: body.name,
    color: body.color || null,
  })

  if (error) {
    throw new ApiError('Failed to create tag', 500)
  }

  return NextResponse.json({ tag }, { status: 201 })
})
