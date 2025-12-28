/**
 * Portfolio Sections API Routes (by Portfolio ID)
 * 
 * GET /api/v1/portfolio-sections/[portfolioId] - Fetch all sections for a portfolio
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'

// GET /api/v1/portfolio-sections/[portfolioId] - Fetch all sections for a portfolio
export const GET = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { portfolioId: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { portfolioId } = context?.params || {}
  
  if (!portfolioId) {
    throw new ApiError('Portfolio ID is required', 400)
  }
  
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
