/**
 * useGenerateSummary Hook
 * 
 * Client-side hook for calling the AI summary generation endpoint.
 * Creates professional portfolio summaries from user's content.
 */

import { apiClient } from '@/lib/api/client'

export interface GenerateSummaryParams {
  certificationsText?: string;
  experienceText?: string;
  skillsText?: string;
  maxWords?: number;
}

export interface GenerateSummaryResult {
  summary: string;
}

/**
 * Call AI endpoint to generate portfolio summary
 * 
 * @param params - Portfolio content sections and constraints
 * @returns Generated summary text
 * @throws Error if API call fails
 */
export async function generateSummary(params: GenerateSummaryParams): Promise<string> {
  const data = await apiClient.post<GenerateSummaryResult>('/ai/generate-summary', {
    certificationsText: params.certificationsText,
    experienceText: params.experienceText,
    skillsText: params.skillsText,
    maxWords: params.maxWords,
  });
  return data.summary;
}
