/**
 * Generate Summary Ability
 * 
 * Creates a cohesive professional summary from multiple
 * portfolio sections (certifications, experience, skills).
 */

import { aiComplete } from "../router";

export interface GenerateSummaryInput {
  certificationsText?: string;
  experienceText?: string;
  skillsText?: string;
  maxWords?: number;
}

export interface GenerateSummaryOutput {
  summary: string;
}

/**
 * Generate a professional portfolio summary
 * 
 * @param input - Portfolio content sections and constraints
 * @returns Generated summary text
 */
export async function generateSummary(
  input: GenerateSummaryInput
): Promise<GenerateSummaryOutput> {
  const maxWords = input.maxWords || 120;

  const systemPrompt = `You are an expert at writing professional portfolio summaries.
Your task is to create a concise, impactful summary paragraph that:
- Highlights key qualifications and expertise
- Showcases unique value proposition
- Maintains a professional tone
- Is written in first person
- Does not exceed ${maxWords} words

Return ONLY the summary text, no introductions or explanations.`;

  // Build context sections
  const sections: string[] = [];

  if (input.certificationsText) {
    sections.push(`CERTIFICATIONS:\n${input.certificationsText}`);
  }

  if (input.experienceText) {
    sections.push(`EXPERIENCE:\n${input.experienceText}`);
  }

  if (input.skillsText) {
    sections.push(`SKILLS:\n${input.skillsText}`);
  }

  const contextText = sections.length > 0 
    ? sections.join("\n\n")
    : "No content provided";

  const userPrompt = `Based on the following portfolio information, write a professional summary paragraph (maximum ${maxWords} words):

${contextText}

Generate a compelling summary that synthesizes this information.`;

  const result = await aiComplete({
    systemPrompt,
    userPrompt,
    temperature: 0.5,
    maxTokens: 384,
  });

  return {
    summary: result.text.trim(),
  };
}
