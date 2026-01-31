/**
 * Tags API Routes (Collection)
 *
 * GET  /api/v1/tags - List all tags for authenticated user
 * POST /api/v1/tags - Create a new tag
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { createTagSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/tags - List all tags for the authenticated user
export const GET = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)

  // Fetch all tags for the user, ordered by name
  const { data: tags, error } = await (supabase.from('tags') as any)
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

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

  // Check if tag with same name already exists for this user
  const { data: existingTag } = await (supabase.from('tags') as any)
    .select('id')
    .eq('user_id', user.id)
    .eq('name', body.name)
    .single()

  if (existingTag) {
    throw new ApiError('A tag with this name already exists', 409)
  }

  // Create the tag
  const { data: tag, error } = await (supabase.from('tags') as any)
    .insert({
      user_id: user.id,
      name: body.name,
      color: body.color || null,
    })
    .select()
    .single()

  if (error) {
    throw new ApiError('Failed to create tag', 500)
  }

  return NextResponse.json({ tag }, { status: 201 })
})
