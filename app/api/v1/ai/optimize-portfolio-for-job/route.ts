/**
 * API Route: Optimize Portfolio for Job
 * 
 * POST /api/v1/ai/optimize-portfolio-for-job
 * Analyzes a job description and optimizes the user's entire portfolio
 * to match the job requirements, emphasizing relevant skills and experience.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler } from "@/lib/api/route-handler";
import { optimizePortfolioForJob } from "@/lib/ai/agent";
import { validateBody } from "@/lib/validation/helpers";
import { optimizeForJobSchema } from "@/lib/validation/schemas";

export const POST = withApiHandler(async (request: NextRequest) => {
  // Authenticate user
  const { user } = await requireAuth(request);

  // Validate request body
  const body = await validateBody(request, optimizeForJobSchema);

  // Call agent to optimize portfolio
  const result = await optimizePortfolioForJob(user.id, body.jobDescription);

  return NextResponse.json({
    updatedSections: result.updatedSections,
    suggestedSkills: result.suggestedSkills,
    jobInsights: result.jobInsights,
  });
});
