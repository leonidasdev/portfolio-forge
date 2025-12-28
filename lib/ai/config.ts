/**
 * AI Configuration
 * 
 * Default settings for the Groq AI provider.
 * These values are used across all AI abilities unless overridden.
 * 
 * @deprecated Use constants from './constants.ts' for new code
 */

import { AI_MODELS, AI_TEMPERATURES } from './constants'

export const DEFAULT_MODEL = AI_MODELS.DEFAULT
export const DEFAULT_TEMPERATURE = AI_TEMPERATURES.BALANCED
export const DEFAULT_MAX_TOKENS = 512
