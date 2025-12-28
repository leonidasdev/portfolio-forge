/**
 * Portfolio Public Link API Routes
 * 
 * POST   /api/v1/portfolios/[id]/public-link - Generate a new public link token
 * DELETE /api/v1/portfolios/[id]/public-link - Revoke the public link token
 * 
 * Public links allow sharing portfolios via a unique token (e.g., /p/abc123)
 * without requiring authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { randomBytes } from 'crypto'

// Generate a cryptographically secure random token
function generatePublicToken(): string {
  // Generate 16 random bytes and convert to URL-safe base64
  return randomBytes(16)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// POST /api/v1/portfolios/[id]/public-link - Generate a new public link token
export const POST = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Portfolio ID is required', 400)
  }
  
  // Verify portfolio exists and belongs to user
  const { data: portfolio, error: fetchError } = await supabase
    .from('portfolios')
    .select('id, public_link_token')
    .eq('id', id)
    .single()
  
  if (fetchError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }
  
  // Generate a new token (even if one exists, regenerate for security)
  const newToken = generatePublicToken()
  
  // Update the portfolio with the new token
  const { data: updatedPortfolio, error: updateError } = await supabase
    .from('portfolios')
    .update({ public_link_token: newToken })
    .eq('id', id)
    .select()
    .single()
  
  if (updateError || !updatedPortfolio) {
    throw new ApiError('Failed to generate public link', 500)
  }
  
  // Return the portfolio with the new token
  return NextResponse.json({
    portfolio: updatedPortfolio,
    public_url: `/p/${newToken}`,
  })
})

// DELETE /api/v1/portfolios/[id]/public-link - Revoke the public link token
export const DELETE = withApiHandler(async (
  request: NextRequest,
  context?: { params?: { id: string } }
) => {
  const { supabase } = await requireAuth(request)
  const { id } = context?.params || {}
  
  if (!id) {
    throw new ApiError('Portfolio ID is required', 400)
  }
  
  // Verify portfolio exists and belongs to user
  const { data: portfolio, error: fetchError } = await supabase
    .from('portfolios')
    .select('id')
    .eq('id', id)
    .single()
  
  if (fetchError || !portfolio) {
    throw new ApiError('Portfolio not found', 404)
  }
  
  // Revoke the public link by setting token to null
  const { data: updatedPortfolio, error: updateError } = await supabase
    .from('portfolios')
    .update({ public_link_token: null })
    .eq('id', id)
    .select()
    .single()
  
  if (updateError) {
    throw new ApiError('Failed to revoke public link', 500)
  }
  
  return NextResponse.json({
    success: true,
    portfolio: updatedPortfolio,
  })
})
