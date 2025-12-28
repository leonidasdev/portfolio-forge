/**
 * API Library Exports
 * 
 * Centralized exports for API-related utilities.
 */

// Auth middleware
export { requireAuth, requireOptionalAuth } from './auth-middleware'

// API client
export { apiClient, ApiError as ClientApiError } from './client'

// Rate limiting
export { 
  withRateLimit, 
  rateLimitConfigs, 
  checkRateLimitStatus, 
  resetRateLimit,
  rateLimitStore 
} from './rate-limit'
export type { RateLimitResult, RateLimitStoreInterface } from './rate-limit-store'

// Route handler
export { withApiHandler, ApiError } from './route-handler'
