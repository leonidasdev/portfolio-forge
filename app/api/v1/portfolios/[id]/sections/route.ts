/**
 * Portfolio Sections API Routes (nested under portfolio)
 * 
 * GET /api/v1/portfolios/[id]/sections - Fetch all sections for a portfolio
 * 
 * This is the RESTful endpoint for fetching sections belonging to a portfolio.
 * For individual section operations (update, delete), use /api/v1/portfolio-sections/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateParams } from '@/lib/validation/helpers'
import { idSchema } from '@/lib/validation/schemas'

// GET /api/v1/portfolios/[id]/sections - Fetch all sections for a portfolio
export const GET = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  
  // Validate params
  const { id: portfolioId } = await validateParams(context?.params || {}, idSchema)
  
  // Verify portfolio exists and belongs to user (RLS enforces ownership)
  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('id')
    .eq('id', portfolioId)
    .single()
  
  if (portfolioError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }
  
  // Fetch all sections for the portfolio, ordered by display_order
  const { data: sections, error } = await supabase
    .from('portfolio_sections')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('display_order', { ascending: true })
  
  if (error) {
    throw new ApiError('Failed to fetch portfolio sections', 500)
  }
  
  return NextResponse.json({ sections })
})
