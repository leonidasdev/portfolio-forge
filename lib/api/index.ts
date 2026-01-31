/**
 * API Library Exports
 *
 * Centralized exports for API-related utilities.
 */

// Auth middleware
export { requireAuth, optionalAuth as requireOptionalAuth } from './auth-middleware'

// API client
export { ApiError as ClientApiError, apiClient } from './client'

// Rate limiting
export {
  checkRateLimitStatus,
  rateLimitConfigs,
  rateLimitStore,
  resetRateLimit,
  withRateLimit,
} from './rate-limit'
export type { RateLimitResult, RateLimitStoreInterface } from './rate-limit-store'

// Route handler
export { ApiError, withApiHandler } from './route-handler'
