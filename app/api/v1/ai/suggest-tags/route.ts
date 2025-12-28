/**
 * API Route: Suggest Tags
 * 
 * POST /api/v1/ai/suggest-tags
 * Analyzes text and returns relevant tag suggestions.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-middleware";
import { withApiHandler } from "@/lib/api/route-handler";
import { suggestTags } from "@/lib/ai/abilities/suggestTags";
import { validateBody } from "@/lib/validation/helpers";
import { suggestTagsSchema } from "@/lib/validation/schemas";

export const POST = withApiHandler(async (request: NextRequest) => {
  // Authenticate user
  await requireAuth(request);

  // Validate request body
  const body = await validateBody(request, suggestTagsSchema);

  // Call AI ability
  const tags = await suggestTags({ text: body.text, maxTags: body.maxTags });

  return NextResponse.json({ tags });
});
    );
  }
}
