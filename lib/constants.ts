/**
 * Application Constants
 *
 * Centralized location for magic numbers, validation limits,
 * and configuration values. Import these instead of using
 * hardcoded values throughout the codebase.
 */

// =============================================================================
// VALIDATION LIMITS
// =============================================================================

/**
 * Resume and text input validation limits
 */
export const TEXT_LIMITS = {
  /** Minimum characters for a valid resume */
  MIN_RESUME_LENGTH: 100,
  /** Minimum characters for a job description */
  MIN_JOB_DESCRIPTION_LENGTH: 50,
  /** Maximum characters for AI processing */
  MAX_AI_INPUT_LENGTH: 50000,
  /** Maximum characters for a portfolio summary */
  MAX_SUMMARY_LENGTH: 500,
  /** Maximum words for a section summary */
  MAX_SUMMARY_WORDS: 120,
  /** Minimum characters for section content */
  MIN_SECTION_CONTENT: 10,
} as const

/**
 * Form field validation limits
 */
export const FIELD_LIMITS = {
  /** Maximum length for a portfolio name */
  MAX_PORTFOLIO_NAME: 100,
  /** Maximum length for a section title */
  MAX_SECTION_TITLE: 150,
  /** Maximum length for a tag name */
  MAX_TAG_NAME: 50,
  /** Minimum length for a tag name */
  MIN_TAG_NAME: 2,
  /** Maximum tags per item */
  MAX_TAGS_PER_ITEM: 20,
} as const

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum file size for certifications (5MB) */
  MAX_CERTIFICATION_FILE_SIZE: 5 * 1024 * 1024,
  /** Maximum file size for resume upload (2MB) */
  MAX_RESUME_FILE_SIZE: 2 * 1024 * 1024,
  /** Allowed image file types */
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const,
  /** Allowed document file types */
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'] as const,
} as const

// =============================================================================
// PAGINATION DEFAULTS
// =============================================================================

export const PAGINATION = {
  /** Default page size */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum page size */
  MAX_PAGE_SIZE: 100,
  /** Default page number (1-indexed) */
  DEFAULT_PAGE: 1,
} as const

// =============================================================================
// RATE LIMITING
// =============================================================================

export const RATE_LIMITS = {
  /** Standard API rate limit (requests per window) */
  API_REQUESTS_PER_WINDOW: 100,
  /** Standard API rate limit window (milliseconds) */
  API_WINDOW_MS: 60 * 1000, // 1 minute

  /** Auth endpoints rate limit */
  AUTH_REQUESTS_PER_WINDOW: 10,
  AUTH_WINDOW_MS: 60 * 1000, // 1 minute

  /** AI endpoints rate limit (more expensive) */
  AI_REQUESTS_PER_WINDOW: 20,
  AI_WINDOW_MS: 60 * 1000, // 1 minute

  /** Public endpoints rate limit (stricter) */
  PUBLIC_REQUESTS_PER_WINDOW: 30,
  PUBLIC_WINDOW_MS: 60 * 1000, // 1 minute
} as const

// =============================================================================
// CACHE DURATIONS (in seconds)
// =============================================================================

export const CACHE_DURATIONS = {
  /** Short cache for frequently changing data */
  SHORT: 60, // 1 minute
  /** Medium cache for semi-static data */
  MEDIUM: 300, // 5 minutes
  /** Long cache for static data */
  LONG: 3600, // 1 hour
  /** Extended cache for rarely changing data */
  EXTENDED: 86400, // 24 hours
} as const

// =============================================================================
// API TIMEOUTS (in milliseconds)
// =============================================================================

export const TIMEOUTS = {
  /** Default API request timeout */
  API_REQUEST: 30000, // 30 seconds
  /** AI processing timeout (longer) */
  AI_PROCESSING: 60000, // 60 seconds
  /** File upload timeout */
  FILE_UPLOAD: 120000, // 2 minutes
  /** Database query timeout */
  DB_QUERY: 10000, // 10 seconds
} as const

// =============================================================================
// PORTFOLIO CONSTANTS
// =============================================================================

export const PORTFOLIO = {
  /** Maximum sections per portfolio */
  MAX_SECTIONS: 20,
  /** Maximum certifications per portfolio */
  MAX_CERTIFICATIONS: 50,
  /** Maximum experience entries per section */
  MAX_EXPERIENCE_ENTRIES: 20,
  /** Maximum skills per section */
  MAX_SKILLS: 100,
  /** Maximum projects per portfolio */
  MAX_PROJECTS: 30,
  /** Share token expiry in days */
  SHARE_TOKEN_EXPIRY_DAYS: 30,
} as const

/**
 * Section types available for portfolios
 */
export const SECTION_TYPES = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'custom',
] as const

export type SectionType = (typeof SECTION_TYPES)[number]

/**
 * Human-readable labels for section types
 */
export const SECTION_TYPE_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Experience',
  work_experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  custom: 'Custom',
} as const

/**
 * Tailwind CSS color classes for section types
 */
export const SECTION_TYPE_COLORS: Record<string, string> = {
  summary: 'bg-blue-100 text-blue-800',
  experience: 'bg-purple-100 text-purple-800',
  work_experience: 'bg-purple-100 text-purple-800',
  education: 'bg-indigo-100 text-indigo-800',
  skills: 'bg-green-100 text-green-800',
  projects: 'bg-orange-100 text-orange-800',
  certifications: 'bg-pink-100 text-pink-800',
  custom: 'bg-gray-100 text-gray-800',
} as const

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI = {
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE_MS: 300,
  /** Debounce delay for auto-save (ms) */
  AUTOSAVE_DEBOUNCE_MS: 2000,
  /** Toast notification duration (ms) */
  TOAST_DURATION_MS: 5000,
  /** Animation duration for transitions (ms) */
  ANIMATION_DURATION_MS: 200,
} as const

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  // Generic
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',

  // Auth
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',

  // Validation
  INVALID_INPUT: 'Invalid input. Please check your data and try again.',
  REQUIRED_FIELD: 'This field is required.',

  // Resources
  NOT_FOUND: 'The requested resource was not found.',
  PORTFOLIO_NOT_FOUND: 'Portfolio not found.',
  SECTION_NOT_FOUND: 'Section not found.',
  CERTIFICATION_NOT_FOUND: 'Certification not found.',

  // Rate limiting
  RATE_LIMITED: 'Too many requests. Please try again later.',

  // File upload
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
} as const

// =============================================================================
// SUCCESS MESSAGES
// =============================================================================

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Successfully deleted.',
  CREATED: 'Successfully created.',
  UPDATED: 'Successfully updated.',
  COPIED: 'Copied to clipboard.',
} as const
