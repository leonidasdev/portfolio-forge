/**
 * API Route: Improve Text
 * 
 * POST /api/v1/ai/improve-text
 * Rewrites text with the specified tone.
 * Rate limited to 20 requests per minute per user.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler } from "@/lib/api/route-handler";
import { withRateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { improveText } from "@/lib/ai/abilities/improveText";
import { validateBody } from "@/lib/validation/helpers";
import { improveTextSchema } from "@/lib/validation/schemas";

export const POST = withRateLimit(withApiHandler(async (request: NextRequest) => {
  // Authenticate user
  await requireAuth(request);

  // Validate request body
  const body = await validateBody(request, improveTextSchema);

  // Call AI ability
  const result = await improveText({ text: body.text, tone: body.tone });

  return NextResponse.json({ improved: result.improved });
}), rateLimitConfigs.ai);
