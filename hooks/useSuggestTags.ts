/**
 * useSuggestTags Hook
 * 
 * Client-side hook for calling the AI tag suggestion endpoint.
 * Generates relevant tags from portfolio content like certifications and experience.
 */

import { apiClient } from '@/lib/api/client'

export interface SuggestTagsParams {
  text: string;
  maxTags?: number;
}

export interface SuggestedTag {
  label: string;
  confidence: number;
}

export interface SuggestTagsResult {
  tags: SuggestedTag[];
}

/**
 * Call AI endpoint to suggest tags
 * 
 * @param params - Text to analyze and max number of tags
 * @returns Array of suggested tags with confidence scores
 * @throws Error if API call fails
 */
export async function suggestTags(params: SuggestTagsParams): Promise<SuggestedTag[]> {
  const { text, maxTags = 8 } = params;

  if (!text || text.trim().length < 10) {
    throw new Error("Text must be at least 10 characters long");
  }

  const data = await apiClient.post<SuggestTagsResult>('/ai/suggest-tags', { text, maxTags });
  return data.tags;
}
