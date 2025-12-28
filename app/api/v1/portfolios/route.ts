/**
 * Portfolios API Routes (Collection)
 * 
 * GET  /api/v1/portfolios - List all portfolios for authenticated user
 * POST /api/v1/portfolios - Create a new portfolio
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { createPortfolioSchema } from '@/lib/validation/schemas'

// GET /api/v1/portfolios - List all portfolios for the authenticated user
export const GET = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)
  
  // Fetch all portfolios for the user, ordered by updated_at
  // RLS will automatically filter by user_id
  const { data: portfolios, error } = await supabase
    .from('portfolios')
    .select('id, title, description, is_public, public_link_token, created_at, updated_at')
    .order('updated_at', { ascending: false })
  
  if (error) {
    throw new ApiError('Failed to fetch portfolios', 500)
  }
  
  return NextResponse.json({ portfolios })
});

// POST /api/v1/portfolios - Create a new portfolio
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)
  
  // Validate request body with Zod
  const body = await validateBody(request, createPortfolioSchema)
  
  // Create the portfolio with validated data
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .insert({
      user_id: user.id,
      title: body.title,
      description: body.description,
      is_public: body.is_public ?? false,
    })
    .select()
    .single()
  
  if (error) {
    throw new ApiError('Failed to create portfolio', 500)
  }
  
  return NextResponse.json({ portfolio }, { status: 201 })
});
