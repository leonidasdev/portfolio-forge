/**
 * AI System Constants
 * 
 * Centralized constants for AI-related validations and limits.
 * These values are used across AI abilities, agents, and API routes.
 */

export const AI_LIMITS = {
  // Text length constraints
  MIN_TEXT_LENGTH: 10,
  MAX_TEXT_LENGTH: 10000,
  MIN_RESUME_LENGTH: 100,
  MIN_JOB_DESCRIPTION_LENGTH: 50,
  
  // Summary generation
  DEFAULT_SUMMARY_MAX_WORDS: 120,
  MIN_SUMMARY_WORDS: 20,
  MAX_SUMMARY_WORDS: 300,
  
  // Tag suggestions
  DEFAULT_MAX_TAGS: 8,
  MIN_TAGS: 1,
  MAX_TAGS: 20,
  
  // Bullet points
  DEFAULT_BULLETS_COUNT: 5,
  MAX_BULLETS: 10,
} as const

export const AI_MODELS = {
  DEFAULT: 'llama-3.1-8b-instant',
  FAST: 'llama-3.1-8b-instant',
  ACCURATE: 'llama-3.1-70b-versatile', // For future use
} as const

export const AI_TEMPERATURES = {
  DETERMINISTIC: 0.1,
  BALANCED: 0.3,
  CREATIVE: 0.7,
} as const

export const AI_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG_RUNNING: 60000, // 60 seconds for complex operations
} as const

export const TONE_OPTIONS = [
  'concise',
  'formal',
  'casual',
  'senior',
  'technical',
] as const

export type Tone = typeof TONE_OPTIONS[number]

export const ERROR_MESSAGES = {
  TEXT_TOO_SHORT: (min: number) => `Text must be at least ${min} characters`,
  TEXT_TOO_LONG: (max: number) => `Text cannot exceed ${max} characters`,
  INVALID_TONE: `Tone must be one of: ${TONE_OPTIONS.join(', ')}`,
  API_KEY_MISSING: 'GROQ_API_KEY environment variable is not set',
  NO_PORTFOLIO: 'No portfolio found for user',
  NO_SECTIONS: 'No sections found in portfolio',
  RATE_LIMIT: 'Too many requests. Please try again later.',
} as const
