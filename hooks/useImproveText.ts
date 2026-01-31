/**
 * useImproveText Hook
 *
 * React hook for calling the AI text improvement endpoint.
 * Provides loading state, error handling, and result management.
 *
 * @example
 * const { improve, isLoading, error, result, reset } = useImproveText()
 *
 * const handleImprove = async () => {
 *   const improved = await improve({ text: 'Some text', tone: 'formal' })
 *   if (improved) console.log('Improved:', improved)
 * }
 */

'use client'

import { apiClient } from '@/lib/api/client'
import { useCallback, useState } from 'react'

export type Tone = 'concise' | 'formal' | 'casual' | 'senior' | 'technical'

export interface ImproveTextParams {
  text: string
  tone?: Tone
}

export interface ImproveTextResult {
  improved: string
}

export interface UseImproveTextReturn {
  /** Call the AI to improve text */
  improve: (params: ImproveTextParams) => Promise<string | null>
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
 * React hook for AI text improvement
 *
 * @returns Hook state and methods
 */
export function useImproveText(): UseImproveTextReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const improve = useCallback(async (params: ImproveTextParams): Promise<string | null> => {
    const { text, tone = 'concise' } = params

    if (!text || text.trim().length === 0) {
      const err = new Error('Text cannot be empty')
      setError(err)
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.post<ImproveTextResult>('/ai/improve-text', { text, tone })
      setResult(data.improved)
      return data.improved
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to improve text')
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

  return { improve, isLoading, error, result, reset }
}

/**
 * Standalone function for non-hook usage
 * @deprecated Use useImproveText hook instead
 */
export async function improveText(params: ImproveTextParams): Promise<string> {
  const { text, tone = 'concise' } = params

  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty')
  }

  const data = await apiClient.post<ImproveTextResult>('/ai/improve-text', { text, tone })
  return data.improved
}
