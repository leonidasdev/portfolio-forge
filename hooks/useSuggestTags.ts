/**
 * useSuggestTags Hook
 *
 * React hook for calling the AI tag suggestion endpoint.
 * Generates relevant tags from portfolio content like certifications and experience.
 *
 * @example
 * const { suggest, isLoading, error, result, reset } = useSuggestTags()
 *
 * const handleSuggest = async () => {
 *   const tags = await suggest({ text: 'AWS certification...' })
 *   if (tags) console.log('Suggested tags:', tags)
 * }
 */

'use client'

import { apiClient } from '@/lib/api/client'
import { useCallback, useState } from 'react'

export interface SuggestTagsParams {
  text: string
  maxTags?: number
}

export interface SuggestedTag {
  label: string
  confidence: number
}

export interface SuggestTagsResult {
  tags: SuggestedTag[]
}

export interface UseSuggestTagsReturn {
  /** Call the AI to suggest tags */
  suggest: (params: SuggestTagsParams) => Promise<SuggestedTag[] | null>
  /** Whether a request is in progress */
  isLoading: boolean
  /** Error from the last request, if any */
  error: Error | null
  /** Result from the last successful request */
  result: SuggestedTag[] | null
  /** Reset the hook state */
  reset: () => void
}

/**
 * React hook for AI tag suggestions
 *
 * @returns Hook state and methods
 */
export function useSuggestTags(): UseSuggestTagsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<SuggestedTag[] | null>(null)

  const suggest = useCallback(async (params: SuggestTagsParams): Promise<SuggestedTag[] | null> => {
    const { text, maxTags = 8 } = params

    if (!text || text.trim().length < 10) {
      const err = new Error('Text must be at least 10 characters long')
      setError(err)
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiClient.post<SuggestTagsResult>('/ai/suggest-tags', { text, maxTags })
      setResult(data.tags)
      return data.tags
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to suggest tags')
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

  return { suggest, isLoading, error, result, reset }
}

/**
 * Standalone function for non-hook usage
 * @deprecated Use useSuggestTags hook instead
 */
export async function suggestTags(params: SuggestTagsParams): Promise<SuggestedTag[]> {
  const { text, maxTags = 8 } = params

  if (!text || text.trim().length < 10) {
    throw new Error('Text must be at least 10 characters long')
  }

  const data = await apiClient.post<SuggestTagsResult>('/ai/suggest-tags', { text, maxTags })
  return data.tags
}
