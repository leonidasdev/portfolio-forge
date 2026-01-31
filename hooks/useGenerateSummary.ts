/**
 * useGenerateSummary Hook
 *
 * React hook for calling the AI summary generation endpoint.
 * Creates professional portfolio summaries from user's content.
 *
 * @example
 * const { generate, isLoading, error, result, reset } = useGenerateSummary()
 *
 * const handleGenerate = async () => {
 *   const summary = await generate({ experienceText: '...' })
 *   if (summary) console.log('Generated:', summary)
 * }
 */

'use client'

import { apiClient } from '@/lib/api/client'
import { useCallback, useState } from 'react'

export interface GenerateSummaryParams {
  certificationsText?: string
  experienceText?: string
  skillsText?: string
  maxWords?: number
}

export interface GenerateSummaryResult {
  summary: string
}

export interface UseGenerateSummaryReturn {
  /** Call the AI to generate summary */
  generate: (params: GenerateSummaryParams) => Promise<string | null>
  /** Whether a request is in progress */
  isLoading: boolean
  /** Error from the last request, if any */
  error: Error | null
  /** Result from the last successful request */
  result: string | null
  /** Reset the hook state */
  reset: () => void
}

/**
 * React hook for AI summary generation
 *
 * @returns Hook state and methods
 */
export function useGenerateSummary(): UseGenerateSummaryReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const generate = useCallback(async (params: GenerateSummaryParams): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.post<GenerateSummaryResult>('/ai/generate-summary', {
        certificationsText: params.certificationsText,
        experienceText: params.experienceText,
        skillsText: params.skillsText,
        maxWords: params.maxWords,
      })
      setResult(data.summary)
      return data.summary
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate summary')
      setError(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setResult(null)
  }, [])

  return { generate, isLoading, error, result, reset }
}

/**
 * Standalone function for non-hook usage
 * @deprecated Use useGenerateSummary hook instead
 */
export async function generateSummary(params: GenerateSummaryParams): Promise<string> {
  const data = await apiClient.post<GenerateSummaryResult>('/ai/generate-summary', {
    certificationsText: params.certificationsText,
    experienceText: params.experienceText,
    skillsText: params.skillsText,
    maxWords: params.maxWords,
  })
  return data.summary
}
