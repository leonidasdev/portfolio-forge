/**
 * API Route: Generate Portfolio Summary
 * 
 * POST /api/v1/ai/generate-portfolio-summary
 * Generates a professional summary from the user's actual portfolio data
 * (certifications, experience, skills stored in Supabase).
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generatePortfolioSummaryForUser } from "@/lib/ai/agent";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Call agent to generate summary from user's data
    const result = await generatePortfolioSummaryForUser(user.id);

    return NextResponse.json({ summary: result.summary });
  } catch (error) {
    console.error("Error in generate-portfolio-summary API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
