/**
 * API Route: Optimize Portfolio for Job
 *
 * POST /api/v1/ai/optimize-portfolio-for-job
 * Analyzes a job description and optimizes the user's entire portfolio
 * to match the job requirements, emphasizing relevant skills and experience.
 */

import { optimizePortfolioForJob } from '@/lib/ai/agents'
import { requireAuth } from '@/lib/api/auth-middleware'
import { rateLimitConfigs, withRateLimit } from '@/lib/api/rate-limit'
import { withApiHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { optimizeForJobSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withRateLimit(
  withApiHandler(async (request: NextRequest) => {
    // Authenticate user
    const { user } = await requireAuth(request)

    // Validate request body
    const body = await validateBody(request, optimizeForJobSchema)

    // Call agent to optimize portfolio
    const result = await optimizePortfolioForJob(user.id, body.jobDescription)

    return NextResponse.json({
      updatedSections: result.updatedSections,
      suggestedSkills: result.suggestedSkills,
      jobInsights: result.jobInsights,
    })
  }),
  rateLimitConfigs.ai
)
