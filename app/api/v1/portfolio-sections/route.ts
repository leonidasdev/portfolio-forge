/**
 * Portfolio Sections API Routes (Collection)
 *
 * POST /api/v1/portfolio-sections - Create a new section for a portfolio
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { createSectionSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/v1/portfolio-sections - Create a new section
export const POST = withApiHandler(async (request: NextRequest) => {
  const { supabase } = await requireAuth(request)

  // Validate request body
  const body = await validateBody(request, createSectionSchema)

  // Verify portfolio exists and belongs to user (RLS enforces ownership)
  const { data: portfolio, error: portfolioError } = await queries.portfolios.getById(
    supabase,
    body.portfolio_id
  )

  if (portfolioError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }

  // Get existing sections to calculate next display_order
  const { data: existingSections } = await queries.sections.listByPortfolio(
    supabase,
    body.portfolio_id
  )

  // Calculate next display_order (max + 1, or 1 if no sections exist)
  const maxOrder = existingSections?.reduce((max, s) => Math.max(max, s.display_order || 0), 0) ?? 0
  const nextOrder = maxOrder + 1

  // Default title based on section type if not provided
  const defaultTitle = body.section_type.charAt(0).toUpperCase() + body.section_type.slice(1)

  // Create the section using typed query helper
  const { data: section, error } = await queries.sections.create(supabase, {
    portfolio_id: body.portfolio_id,
    section_type: body.section_type,
    title: body.title || defaultTitle,
    custom_content: body.content || null,
    display_order: nextOrder,
  })

  if (error) {
    throw new ApiError('Failed to create portfolio section', 500)
  }

  return NextResponse.json({ section }, { status: 201 })
})
