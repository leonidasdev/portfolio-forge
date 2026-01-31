/**
 * Portfolio Sections API Routes (Collection)
 *
 * POST /api/v1/portfolio-sections - Create a new section for a portfolio
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { createSectionSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/v1/portfolio-sections - Create a new section
export const POST = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)

  // Validate request body
  const body = await validateBody(request, createSectionSchema)

  // Verify portfolio exists and belongs to user (RLS enforces ownership)
  const { data: portfolio, error: portfolioError } = await (supabase.from('portfolios') as any)
    .select('id')
    .eq('id', body.portfolio_id)
    .single()

  if (portfolioError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }

  // Get the current max display_order for this portfolio
  const { data: maxOrderSection } = await (supabase.from('portfolio_sections') as any)
    .select('display_order')
    .eq('portfolio_id', body.portfolio_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  // Calculate next display_order (max + 1, or 1 if no sections exist)
  const nextOrder = maxOrderSection ? (maxOrderSection.display_order || 0) + 1 : 1

  // Create the section
  const { data: section, error } = await (supabase.from('portfolio_sections') as any)
    .insert({
      portfolio_id: body.portfolio_id,
      section_type: body.section_type,
      title: body.title || null,
      custom_content: body.content || null,
      settings: body.settings || null,
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    throw new ApiError('Failed to create portfolio section', 500)
  }

  return NextResponse.json({ section }, { status: 201 })
})
