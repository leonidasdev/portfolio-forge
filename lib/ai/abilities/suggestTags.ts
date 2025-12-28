/**
 * Suggest Tags Ability
 * 
 * Analyzes text from certifications, experience, or skills
 * and suggests relevant tags with confidence scores.
 */

import { aiComplete } from "../router";

export interface SuggestTagsInput {
  text: string;
  maxTags?: number;
}

export interface SuggestedTag {
  label: string;
  confidence: number;
}

interface TagsAPIResponse {
  tags: SuggestedTag[];
}

/**
 * Generate tag suggestions for portfolio content
 * 
 * @param input - Text to analyze and max number of tags
 * @returns Array of suggested tags with confidence scores
 */
export async function suggestTags(input: SuggestTagsInput): Promise<SuggestedTag[]> {
  const maxTags = input.maxTags || 8;

  const systemPrompt = `You are a tag suggestion engine for a professional portfolio builder.
Your task is to analyze text about certifications, work experience, or technical skills and suggest relevant tags.
Tags should be:
- Concise (1-3 words)
- Relevant to the content
- Professional and industry-standard
- Technology names, skills, methodologies, or domains

You must respond with ONLY valid JSON in this exact format:
{
  "tags": [
    { "label": "tag-name", "confidence": 0.95 }
  ]
}

Confidence should be a number between 0 and 1.
Generate up to ${maxTags} tags, ordered by confidence (highest first).`;

  const userPrompt = `Analyze this text and suggest relevant tags:

${input.text}

Return JSON only with the tags array.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 256,
    });

    // Parse JSON response
    const parsed: TagsAPIResponse = JSON.parse(result.text);
    
    if (!parsed.tags || !Array.isArray(parsed.tags)) {
      console.error("Invalid tags response format:", result.text);
      return [];
    }

    // Validate and limit results
    const validTags = parsed.tags
      .filter(tag => tag.label && typeof tag.confidence === "number")
      .slice(0, maxTags);

    return validTags;
  } catch (error) {
    console.error("Error in suggestTags:", error);
    return [];
  }
}
