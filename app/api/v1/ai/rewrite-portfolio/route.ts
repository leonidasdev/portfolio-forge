/**
 * API Route: Rewrite Portfolio
 *
 * POST /api/v1/ai/rewrite-portfolio
 * Rewrites all sections of the user's portfolio using AI with a specified tone.
 */

import { rewriteEntirePortfolio } from '@/lib/ai/agents'
import { requireAuth } from '@/lib/api/auth-middleware'
import { rateLimitConfigs, withRateLimit } from '@/lib/api/rate-limit'
import { withApiHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { rewritePortfolioSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withRateLimit(
  withApiHandler(async (request: NextRequest) => {
    // Authenticate user
    const { user } = await requireAuth(request)

    // Validate request body
    const body = await validateBody(request, rewritePortfolioSchema)

    // Call agent to rewrite entire portfolio
    const result = await rewriteEntirePortfolio(user.id, body.tone)

    return NextResponse.json({ sections: result.sections })
  }),
  rateLimitConfigs.ai
)
