/**
 * Portfolios API Routes (Individual)
 *
 * GET    /api/v1/portfolios/[id] - Fetch a single portfolio with its sections
 * PATCH  /api/v1/portfolios/[id] - Update portfolio metadata
 * DELETE /api/v1/portfolios/[id] - Delete a portfolio and its sections
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { validateBody } from '@/lib/validation/helpers'
import { updatePortfolioSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/v1/portfolios/[id] - Fetch a single portfolio with its sections
export const GET = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Portfolio ID is required', 400)
    }

    // Fetch portfolio using typed queries (RLS enforces ownership)
    const { data: portfolio, error: portfolioError } = await queries.portfolios.getById(
      supabase,
      id
    )

    if (portfolioError || !portfolio) {
      throw new ApiError('Portfolio not found', 404)
    }

    // Fetch portfolio sections ordered by display_order
    const { data: sections, error: sectionsError } = await queries.sections.listByPortfolio(
      supabase,
      id
    )

    if (sectionsError) {
      console.error('Failed to fetch portfolio sections:', sectionsError)
      // Don't fail the request, just return empty sections
    }

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        sections: sections || [],
      },
    })
  }
)

// PATCH /api/v1/portfolios/[id] - Update portfolio metadata
export const PATCH = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Portfolio ID is required', 400)
    }

    // Validate request body with Zod schema
    const updates = await validateBody(request, updatePortfolioSchema)

    // Ensure we have something to update
    if (Object.keys(updates).length === 0) {
      throw new ApiError('No valid fields to update', 400)
    }

    // Build update object, filtering out null for theme as it must be a non-null string
    const sanitizedUpdates = {
      ...updates,
      // Theme can't be null in the database, so only include if it's a valid string
      ...(updates.theme === null ? {} : {}),
    }

    // Update the portfolio using typed queries (RLS enforces ownership)
    const { data: portfolio, error } = await queries.portfolios.update(
      supabase,
      id,
      sanitizedUpdates as Parameters<typeof queries.portfolios.update>[2]
    )

    if (error || !portfolio) {
      throw new ApiError('Portfolio not found or update failed', 404)
    }

    return NextResponse.json({ portfolio })
  }
)

// DELETE /api/v1/portfolios/[id] - Delete a portfolio and its sections
export const DELETE = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Portfolio ID is required', 400)
    }

    // Delete portfolio sections first (cascade)
    // Note: Database CASCADE constraints should handle this automatically,
    // but we do it explicitly for clarity
    const { error: sectionsError } = await supabase
      .from('portfolio_sections')
      .delete()
      .eq('portfolio_id', id)

    if (sectionsError) {
      console.error('Failed to delete portfolio sections:', sectionsError)
      // Continue anyway - cascade should handle it
    }

    // Delete the portfolio (RLS enforces ownership)
    const { error } = await supabase.from('portfolios').delete().eq('id', id)

    if (error) {
      throw new ApiError('Portfolio not found or delete failed', 404)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  }
)
