/**
 * API Route: Generate Summary
 * 
 * POST /api/v1/ai/generate-summary
 * Creates a professional portfolio summary from provided content sections.
 * Rate limited to 20 requests per minute per user.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler } from "@/lib/api/route-handler";
import { withRateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { generateSummary } from "@/lib/ai/abilities/generateSummary";
import { validateBody } from "@/lib/validation/helpers";
import { generateSummarySchema } from "@/lib/validation/schemas";

export const POST = withRateLimit(withApiHandler(async (request: NextRequest) => {
  // Authenticate user
  await requireAuth(request);

  // Validate request body
  const body = await validateBody(request, generateSummarySchema);

  // Call AI ability
  const result = await generateSummary({
    certificationsText: body.certificationsText,
    experienceText: body.experienceText,
    skillsText: body.skillsText,
    maxWords: body.maxWords,
  });

  return NextResponse.json({ summary: result.summary });
}), rateLimitConfigs.ai);
