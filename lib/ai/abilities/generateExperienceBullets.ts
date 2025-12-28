/**
 * Generate Experience Bullets Ability
 * 
 * Transforms work experience descriptions into action-focused,
 * impact-driven bullet points suitable for resumes and portfolios.
 */

import { aiComplete } from "../router";

export interface GenerateExperienceBulletsInput {
  description: string;
}

export interface GenerateExperienceBulletsOutput {
  bullets: string[];
}

interface BulletsAPIResponse {
  bullets: string[];
}

/**
 * Generate resume-style bullet points from experience description
 * 
 * @param input - Work experience description
 * @returns Array of formatted bullet points
 */
export async function generateExperienceBullets(
  input: GenerateExperienceBulletsInput
): Promise<GenerateExperienceBulletsOutput> {
  const systemPrompt = `You are an expert resume writer specializing in achievement-focused bullet points.
Your task is to convert work experience descriptions into 3-6 impactful bullet points that:
- Start with strong action verbs
- Quantify achievements when possible
- Highlight impact and results
- Are concise and specific
- Follow the STAR method (Situation, Task, Action, Result)

You must respond with ONLY valid JSON in this exact format:
{
  "bullets": [
    "First bullet point",
    "Second bullet point",
    "Third bullet point"
  ]
}

Return JSON only, no explanations.`;

  const userPrompt = `Convert this experience description into 3-6 professional bullet points:

${input.description}

Return JSON with the bullets array.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 512,
    });

    // Parse JSON response
    const parsed: BulletsAPIResponse = JSON.parse(result.text);
    
    if (!parsed.bullets || !Array.isArray(parsed.bullets)) {
      console.error("Invalid bullets response format:", result.text);
      return { bullets: [] };
    }

    // Filter out empty bullets and limit to 6
    const validBullets = parsed.bullets
      .filter(bullet => typeof bullet === "string" && bullet.trim().length > 0)
      .slice(0, 6);

    return { bullets: validBullets };
  } catch (error) {
    console.error("Error in generateExperienceBullets:", error);
    return { bullets: [] };
  }
}
