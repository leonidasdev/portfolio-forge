import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler, ApiError } from "@/lib/api/route-handler";
import { recommendTemplateAndTheme } from "@/lib/ai/agent";

/**
 * POST /api/v1/ai/recommend-template-theme
 * 
 * Analyzes the user's portfolio content and recommends:
 * - An optimal template
 * - A matching theme
 * - Suggested section ordering
 * - Rationale for recommendations
 * 
 * No request body required - uses authenticated user's portfolio.
 * 
 * Response:
 * - recommendedTemplate: Template name
 * - recommendedTheme: Theme name
 * - recommendedSectionOrder: Array of section types in optimal order
 * - rationale: Explanation of recommendations
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  // Get authenticated user
  const { user } = await requireAuth(request);

  try {
    // Generate recommendations
    const recommendations = await recommendTemplateAndTheme(user.id);
    return NextResponse.json(recommendations, { status: 200 });
  } catch (error) {
    // Check for specific error messages
    if (error instanceof Error) {
      if (error.message.includes("No portfolio found")) {
        throw new ApiError("No portfolio found. Please create a portfolio first.", 404);
      }
      if (error.message.includes("No sections found")) {
        throw new ApiError("No sections found. Please add some content to your portfolio first.", 400);
      }
    }
    throw error;
  }
});
