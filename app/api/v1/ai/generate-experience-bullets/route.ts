/**
 * API Route: Generate Experience Bullets
 * 
 * POST /api/v1/ai/generate-experience-bullets
 * Converts experience descriptions into resume-style bullet points.
 * Rate limited to 20 requests per minute per user.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler, ApiError } from "@/lib/api/route-handler";
import { withRateLimit, rateLimitConfigs } from "@/lib/api/rate-limit";
import { generateExperienceBullets } from "@/lib/ai/abilities/generateExperienceBullets";

export const POST = withRateLimit(withApiHandler(async (request: NextRequest) => {
  await requireAuth(request)

  // Parse request body
  const body = await request.json();
  const { description } = body;

  // Validate required fields
  if (!description || typeof description !== "string") {
    throw new ApiError("Missing or invalid 'description' field", 400);
  }

  if (description.trim().length === 0) {
    throw new ApiError("Description cannot be empty", 400);
  }

  // Call AI ability
  const result = await generateExperienceBullets({ description });

  return NextResponse.json({ bullets: result.bullets });
}), rateLimitConfigs.ai);
