/**
 * Portfolios API Routes (Individual)
 * 
 * GET    /api/v1/portfolios/[id] - Fetch a single portfolio with its sections
 * PATCH  /api/v1/portfolios/[id] - Update portfolio metadata
 * DELETE /api/v1/portfolios/[id] - Delete a portfolio and its sections
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { updatePortfolioSchema } from '@/lib/validation/schemas'

// GET /api/v1/portfolios/[id] - Fetch a single portfolio with its sections
export const GET = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Portfolio ID is required', 400)
  }
  
  // Fetch portfolio (RLS enforces ownership)
  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)
    .single()
  
  if (portfolioError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }
  
  // Fetch portfolio sections ordered by display_order
  const { data: sections, error: sectionsError } = await supabase
    .from('portfolio_sections')
    .select('*')
    .eq('portfolio_id', id)
    .order('display_order', { ascending: true })
  
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
})

// PATCH /api/v1/portfolios/[id] - Update portfolio metadata
export const PATCH = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Portfolio ID is required', 400)
  }
  
  // Validate request body with Zod schema
  const updates = await validateBody(request, updatePortfolioSchema)
  
  // Ensure we have something to update
  if (Object.keys(updates).length === 0) {
    throw new ApiError('No valid fields to update', 400)
  }
  
  // Update the portfolio (RLS enforces ownership)
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error || !portfolio) {
    throw new ApiError('Portfolio not found or update failed', 404)
  }
  
  return NextResponse.json({ portfolio })
})

// DELETE /api/v1/portfolios/[id] - Delete a portfolio and its sections
export const DELETE = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
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
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id)
  
  if (error) {
    throw new ApiError('Portfolio not found or delete failed', 404)
  }
  
  return NextResponse.json({ success: true }, { status: 200 })
})
