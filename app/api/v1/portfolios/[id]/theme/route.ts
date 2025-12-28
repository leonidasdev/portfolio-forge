/**
 * PATCH /api/v1/portfolios/[id]/theme
 * 
 * Update the portfolio's selected theme.
 * 
 * Request Body:
 * - theme: string (theme ID)
 * 
 * Returns:
 * - 200: Updated portfolio
 * - 400: Invalid theme ID
 * - 401: Unauthorized
 * - 404: Portfolio not found
 * 
 * Security:
 * - RLS enforced via Supabase
 * - Only portfolio owner can update theme
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { updatePortfolioThemeSchema } from '@/lib/validation/schemas'
import { THEMES } from '@/lib/templates-themes/definitions'

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
  const { theme } = await validateBody(request, updatePortfolioThemeSchema)
  
  // Validate theme exists in available themes
  const themeExists = THEMES.some((t) => t.id === theme)
  if (!themeExists) {
    throw new ApiError('Invalid theme ID', 400)
  }
  
  // Update portfolio theme
  // RLS will ensure only the owner can update
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .update({ theme })
    .eq('id', id)
    .eq('is_deleted', false)
    .select()
    .single()
  
  if (error) {
    throw new ApiError('Failed to update portfolio theme', error.code === 'PGRST116' ? 404 : 500)
  }
  
  return NextResponse.json(portfolio)
})
