/**
 * API Route: Suggest Tags
 *
 * POST /api/v1/ai/suggest-tags
 * Analyzes text and returns relevant tag suggestions.
 */

import { suggestTags } from '@/lib/ai/abilities/suggestTags'
import { requireAuth } from '@/lib/api/auth-middleware'
import { rateLimitConfigs, withRateLimit } from '@/lib/api/rate-limit'
import { withApiHandler } from '@/lib/api/route-handler'
import { validateBody } from '@/lib/validation/helpers'
import { suggestTagsSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withRateLimit(
  withApiHandler(async (request: NextRequest) => {
    // Authenticate user
    await requireAuth(request)

    // Validate request body
    const body = await validateBody(request, suggestTagsSchema)

    // Call AI ability
    const tags = await suggestTags({ text: body.text, maxTags: body.maxTags })

    return NextResponse.json({ tags })
  }),
  rateLimitConfigs.api
)
