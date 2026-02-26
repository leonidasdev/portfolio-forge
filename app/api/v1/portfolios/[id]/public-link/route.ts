/**
 * Portfolio Public Link API Routes
 *
 * POST   /api/v1/portfolios/[id]/public-link - Generate a new public link token
 * DELETE /api/v1/portfolios/[id]/public-link - Revoke the public link token
 *
 * Public links allow sharing portfolios via a unique token (e.g., /p/abc123)
 * without requiring authentication.
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

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
export const POST = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Portfolio ID is required', 400)
    }

    // Verify portfolio exists and belongs to user using typed query helper
    const { data: portfolio, error: fetchError } = await queries.portfolios.getById(supabase, id)

    if (fetchError || !portfolio) {
      throw new ApiError('Portfolio not found', 404)
    }

    // Generate a new token (even if one exists, regenerate for security)
    const newToken = generatePublicToken()

    // Update the portfolio with the new token using typed query helper
    const { data: updatedPortfolio, error: updateError } = await queries.portfolios.update(
      supabase,
      id,
      { public_link_token: newToken }
    )

    if (updateError || !updatedPortfolio) {
      throw new ApiError('Failed to generate public link', 500)
    }

    // Return the portfolio with the new token
    return NextResponse.json({
      portfolio: updatedPortfolio,
      public_url: `/p/${newToken}`,
    })
  }
)

// DELETE /api/v1/portfolios/[id]/public-link - Revoke the public link token
export const DELETE = withApiHandler(
  async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)
    // Next.js 15 - params is a Promise
    const resolvedParams = context?.params ? await context.params : { id: '' }
    const { id } = resolvedParams

    if (!id) {
      throw new ApiError('Portfolio ID is required', 400)
    }

    // Verify portfolio exists and belongs to user using typed query helper
    const { data: portfolio, error: fetchError } = await queries.portfolios.getById(supabase, id)

    if (fetchError || !portfolio) {
      throw new ApiError('Portfolio not found', 404)
    }

    // Revoke the public link by setting token to null using typed query helper
    const { data: updatedPortfolio, error: updateError } = await queries.portfolios.update(
      supabase,
      id,
      { public_link_token: null }
    )

    if (updateError) {
      throw new ApiError('Failed to revoke public link', 500)
    }

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
    })
  }
)
