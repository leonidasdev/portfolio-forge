import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler } from "@/lib/api/route-handler";
import { generatePortfolioFromResume } from "@/lib/ai/agent";
import { validateBody } from "@/lib/validation/helpers";
import { generateFromResumeSchema } from "@/lib/validation/schemas";

/**
 * POST /api/v1/ai/generate-portfolio-from-resume
 * 
 * Generates a complete portfolio draft from resume text.
 * Extracts structured data, creates sections, and suggests template/theme.
 * 
 * Request body:
 * - resumeText: The resume or LinkedIn profile text (min 100 chars)
 * 
 * Response:
 * - sections: Array of portfolio section objects
 * - suggestedTemplate: Recommended template name
 * - suggestedTheme: Recommended theme name
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  // Get authenticated user
  const { user } = await requireAuth(request);

  // Validate request body
  const body = await validateBody(request, generateFromResumeSchema);

  // Generate portfolio from resume
  const result = await generatePortfolioFromResume(user.id, body.resumeText);

  return NextResponse.json(result, { status: 200 });
});
