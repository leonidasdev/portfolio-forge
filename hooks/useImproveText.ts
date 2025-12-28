/**
 * useImproveText Hook
 * 
 * Client-side hook for calling the AI text improvement endpoint.
 * Handles API requests to improve portfolio content with different tones.
 */

import { apiClient } from '@/lib/api/client'

export type Tone = "concise" | "formal" | "casual" | "senior" | "technical";

export interface ImproveTextParams {
  text: string;
  tone?: Tone;
}

export interface ImproveTextResult {
  improved: string;
}

/**
 * Call AI endpoint to improve text
 * 
 * @param params - Text and optional tone
 * @returns Improved text
 * @throws Error if API call fails
 */
export async function improveText(params: ImproveTextParams): Promise<string> {
  const { text, tone = "concise" } = params;

  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  const data = await apiClient.post<ImproveTextResult>('/ai/improve-text', { text, tone });
  return data.improved;
}
