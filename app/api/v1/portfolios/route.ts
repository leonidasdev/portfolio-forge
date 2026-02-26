/**
 * Portfolios API Routes (Collection)
 *
 * GET  /api/v1/portfolios - List all portfolios for authenticated user
 * POST /api/v1/portfolios - Create a new portfolio
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { createPortfolioSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/portfolios - List all portfolios for the authenticated user
export const GET = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)

  // Fetch all portfolios for the user, ordered by updated_at
  // RLS will automatically filter by user_id
  const { data: portfolios, error } = await queries.portfolios.listSummary(supabase)

  if (error) {
    throw new ApiError('Failed to fetch portfolios', 500)
  }

  return NextResponse.json({ portfolios })
})

// POST /api/v1/portfolios - Create a new portfolio
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)

  // Validate request body with Zod
  const body = await validateBody(request, createPortfolioSchema)

  // Generate a slug from title (lowercase, replace spaces with hyphens, remove special chars)
  const baseSlug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)

  // Add timestamp suffix to ensure uniqueness
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  // Create the portfolio with validated data
  const { data: portfolio, error } = await queries.portfolios.create(supabase, {
    user_id: user.id,
    title: body.title,
    slug,
    description: body.description,
    is_public: body.is_public ?? false,
  })

  if (error) {
    throw new ApiError('Failed to create portfolio', 500)
  }

  return NextResponse.json({ portfolio }, { status: 201 })
})
