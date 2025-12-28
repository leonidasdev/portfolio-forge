/**
 * Rate Limiting Middleware
 * 
 * Provides configurable rate limiting for API routes.
 * Automatically uses Redis in production (if configured) or in-memory for development.
 * 
 * Features:
 * - Configurable limits per route type (API, Auth, AI, Public)
 * - Per-user or per-IP rate limiting
 * - Sliding window algorithm
 * - Rate limit headers (X-RateLimit-*)
 * - Redis support for distributed systems
 * 
 * Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Upstash REST API URL (serverless Redis)
 * - UPSTASH_REDIS_REST_TOKEN: Upstash REST API token
 * 
 * Usage:
 * ```typescript
 * import { withRateLimit, rateLimitConfigs } from '@/lib/api/rate-limit'
 * 
 * export const POST = withRateLimit(
 *   withApiHandler(async (request) => { ... }),
 *   rateLimitConfigs.ai
 * )
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { config, RateLimitConfig } from '@/lib/config'
import { rateLimitStore, type RateLimitResult } from './rate-limit-store'

// Re-export store for direct access if needed
export { rateLimitStore }

// ============================================================================
// Types
// ============================================================================

type RouteHandler = (
  request: NextRequest,
  context?: { params?: any }
) => Promise<Response> | Response

// ============================================================================
// Key Generation
// ============================================================================

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string {
  // Check common headers for proxied IPs
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to a default (in serverless, we might not have direct IP access)
  return 'unknown'
}

/**
 * Generate a rate limit key based on configuration
 */
function generateKey(
  request: NextRequest,
  userId: string | null,
  perUser: boolean,
  prefix: string = 'rl'
): string {
  const path = new URL(request.url).pathname
  
  if (perUser && userId) {
    return `${prefix}:user:${userId}:${path}`
  }
  
  const ip = getClientIp(request)
  return `${prefix}:ip:${ip}:${path}`
}

// ============================================================================
// Rate Limit Headers
// ============================================================================

/**
 * Add rate limit headers to response
 * Creates a new NextResponse with the original body and rate limit headers
 */
async function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Promise<Response> {
  // Get the response body as ArrayBuffer to preserve it
  const bodyBuffer = await response.arrayBuffer()
  
  // Create new headers with rate limit info
  const newHeaders = new Headers(response.headers)
  newHeaders.set('X-RateLimit-Limit', result.limit.toString())
  newHeaders.set('X-RateLimit-Remaining', result.remaining.toString())
  newHeaders.set('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString())
  
  // Return new response with original body and updated headers
  return new NextResponse(bodyBuffer, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

// ============================================================================
// Rate Limit Response
// ============================================================================

/**
 * Create a 429 Too Many Requests response
 */
function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
  
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
      },
    }
  )
}

// ============================================================================
// Middleware Wrapper
// ============================================================================

/**
 * Rate limiting middleware wrapper for route handlers.
 * 
 * @param handler - The route handler to wrap
 * @param rateLimitConfig - Rate limit configuration
 * @param getUserId - Optional function to extract user ID from request
 * @returns Wrapped handler with rate limiting
 * 
 * @example
 * ```typescript
 * export const POST = withRateLimit(
 *   withApiHandler(async (request) => {
 *     // Your handler logic
 *   }),
 *   config.rateLimit.ai
 * )
 * ```
 */
export function withRateLimit(
  handler: RouteHandler,
  rateLimitConfig?: RateLimitConfig,
  getUserId?: (request: NextRequest) => string | null
): RouteHandler {
  return async (request: NextRequest, context?: { params?: any }) => {
    // Check if rate limiting is enabled globally
    if (!config.rateLimit.enabled || !config.features.rateLimitEnabled) {
      return handler(request, context)
    }
    
    // Use provided config or default API config
    const limitConfig = rateLimitConfig || config.rateLimit.api
    
    // Get user ID if available
    const userId = getUserId ? getUserId(request) : null
    
    // Generate rate limit key
    const key = generateKey(request, userId, limitConfig.perUser)
    
    // Check rate limit (now async for Redis support)
    const result = await rateLimitStore.check(
      key,
      limitConfig.maxRequests,
      limitConfig.windowSeconds
    )
    
    // If rate limited, return 429
    if (!result.allowed) {
      return createRateLimitResponse(result)
    }
    
    // Execute handler and add rate limit headers to response
    const response = await handler(request, context)
    return addRateLimitHeaders(response, result)
  }
}

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Pre-configured rate limit settings for common use cases
 */
export const rateLimitConfigs = {
  /** Standard API endpoints (100/min per user) */
  api: config.rateLimit.api,
  /** Authentication endpoints (10/min per IP) */
  auth: config.rateLimit.auth,
  /** AI/expensive operations (20/min per user) */
  ai: config.rateLimit.ai,
  /** Public endpoints (30/min per IP) */
  public: config.rateLimit.public,
  
  /** Custom configuration helper */
  custom: (maxRequests: number, windowSeconds: number, perUser = true): RateLimitConfig => ({
    maxRequests,
    windowSeconds,
    perUser,
  }),
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check rate limit status without consuming a request
 */
export async function checkRateLimitStatus(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig = config.rateLimit.api,
  userId: string | null = null
): Promise<RateLimitResult> {
  const key = generateKey(request, userId, rateLimitConfig.perUser)
  return rateLimitStore.peek(key, rateLimitConfig.maxRequests)
}

/**
 * Reset rate limit for a specific user/IP (admin use)
 */
export async function resetRateLimit(
  request: NextRequest,
  rateLimitConfig: RateLimitConfig = config.rateLimit.api,
  userId: string | null = null
): Promise<void> {
  const key = generateKey(request, userId, rateLimitConfig.perUser)
  await rateLimitStore.reset(key)
}

export default withRateLimit
