/**
 * PATCH /api/v1/portfolios/[id]/template
 * 
 * Update the portfolio's selected template.
 * 
 * Request Body:
 * - template: string (template ID)
 * 
 * Returns:
 * - 200: Updated portfolio
 * - 400: Invalid template ID
 * - 401: Unauthorized
 * - 404: Portfolio not found
 * 
 * Security:
 * - RLS enforced via Supabase
 * - Only portfolio owner can update template
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { updatePortfolioTemplateSchema } from '@/lib/validation/schemas'
import { TEMPLATES } from '@/lib/templates-themes/definitions'

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
  const { template } = await validateBody(request, updatePortfolioTemplateSchema)
  
  // Validate template exists in available templates
  const templateExists = TEMPLATES.some((t) => t.id === template)
  if (!templateExists) {
    throw new ApiError('Invalid template ID', 400)
  }
  
  // Update portfolio template
  // RLS will ensure only the owner can update
  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .update({ template })
    .eq('id', id)
    .eq('is_deleted', false)
    .select()
    .single()
  
  if (error) {
    throw new ApiError('Failed to update portfolio template', error.code === 'PGRST116' ? 404 : 500)
  }
  
  return NextResponse.json(portfolio)
})
