/**
 * Tags API Routes (Collection)
 * 
 * GET  /api/v1/tags - List all tags for authenticated user
 * POST /api/v1/tags - Create a new tag
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { createTagSchema } from '@/lib/validation/schemas'

// GET /api/v1/tags - List all tags for the authenticated user
export const GET = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)
  
  // Fetch all tags for the user, ordered by name
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })
  
  if (error) {
    throw new ApiError('Failed to fetch tags', 500)
  }
  
  return NextResponse.json({ tags })
});

// POST /api/v1/tags - Create a new tag
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)
  
  // Validate request body
  const body = await validateBody(request, createTagSchema)
  
  // Check if tag with same name already exists for this user
  const { data: existingTag } = await supabase
    .from('tags')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', body.name)
    .single()
  
  if (existingTag) {
    throw new ApiError('A tag with this name already exists', 409)
  }
  
  // Create the tag
  const { data: tag, error } = await supabase
    .from('tags')
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
});
