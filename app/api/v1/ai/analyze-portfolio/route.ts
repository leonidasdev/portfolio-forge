import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler, ApiError } from "@/lib/api/route-handler";
import { analyzePortfolio } from "@/lib/ai/agent";

/**
 * POST /api/v1/ai/analyze-portfolio
 * 
 * Analyzes the user's portfolio content and returns:
 * - Overall score (0-100)
 * - Subscores across 6 dimensions
 * - Actionable recommendations
 * - Optional suggested rewrites for critical issues
 * 
 * No request body required - uses authenticated user's portfolio.
 * 
 * Response:
 * - score: Overall portfolio score
 * - subscores: Object with clarity, technicalDepth, seniority, atsAlignment, completeness, toneConsistency
 * - recommendations: Array of recommendation objects with title, description, and optional suggestedRewrite
 */
export const POST = withApiHandler(async (request: NextRequest) => {
  // Get authenticated user
  const { user } = await requireAuth(request);

  try {
    // Analyze portfolio
    const analysis = await analyzePortfolio(user.id);
    return NextResponse.json(analysis, { status: 200 });
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
