/**
 * API Route: Generate Portfolio Summary
 *
 * POST /api/v1/ai/generate-portfolio-summary
 * Generates a professional summary from the user's actual portfolio data
 * (certifications, experience, skills stored in Supabase).
 */

import { generatePortfolioSummaryForUser } from '@/lib/ai/agents'
import { requireAuth } from '@/lib/api/auth-middleware'
import { rateLimitConfigs, withRateLimit } from '@/lib/api/rate-limit'
import { withApiHandler } from '@/lib/api/route-handler'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withRateLimit(
  withApiHandler(async (request: NextRequest) => {
    // Authenticate user
    const { user } = await requireAuth(request)

    // Call agent to generate summary from user's data
    const result = await generatePortfolioSummaryForUser(user.id)

    return NextResponse.json({ summary: result.summary })
  }),
  rateLimitConfigs.ai
)
