/**
 * Hooks Index
 *
 * Re-exports all custom React hooks for convenient importing.
 *
 * @example
 * import { useImproveText, useSuggestTags, useGenerateSummary } from '@/hooks'
 */

// AI Hooks
export { improveText, useImproveText } from './useImproveText'
export type { ImproveTextParams, Tone, UseImproveTextReturn } from './useImproveText'

export { generateSummary, useGenerateSummary } from './useGenerateSummary'
export type { GenerateSummaryParams, UseGenerateSummaryReturn } from './useGenerateSummary'

export { suggestTags, useSuggestTags } from './useSuggestTags'
export type { SuggestTagsParams, SuggestedTag, UseSuggestTagsReturn } from './useSuggestTags'

export { useAIRequest } from './useAIRequest'
export type { UseAIRequestReturn } from './useAIRequest'
