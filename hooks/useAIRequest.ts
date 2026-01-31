/**
 * useAIRequest Hook
 *
 * Generic React hook for making AI API requests with loading and error states.
 * Use this for any AI endpoint that doesn't have a dedicated hook.
 *
 * @example
 * const { execute, isLoading, error, result, reset } = useAIRequest<ResponseType>()
 *
 * const handleRequest = async () => {
 *   const data = await execute('/ai/some-endpoint', { input: 'value' })
 *   if (data) console.log('Response:', data)
 * }
 */

'use client'

import { apiClient } from '@/lib/api/client'
import { useCallback, useState } from 'react'

export interface UseAIRequestReturn<T> {
  /** Execute an AI API request */
  execute: (endpoint: string, body: unknown) => Promise<T | null>
  /** Whether a request is in progress */
  isLoading: boolean
  /** Error from the last request, if any */
  error: Error | null
  /** Result from the last successful request */
  result: T | null
  /** Reset the hook state */
  reset: () => void
}

/**
 * Generic hook for AI API requests
 *
 * @template T - Expected response type
 * @returns Hook state and methods
 */
export function useAIRequest<T>(): UseAIRequestReturn<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<T | null>(null)

  const execute = useCallback(async (endpoint: string, body: unknown): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.post<T>(endpoint, body)
      setResult(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('AI request failed')
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

  return { execute, isLoading, error, result, reset }
}
