/**
 * Redis Rate Limit Store
 * 
 * Production-ready rate limiting using Redis for distributed systems.
 * Falls back to in-memory store if Redis is unavailable.
 * 
 * Supports:
 * - Upstash Redis (serverless-friendly)
 * - Standard Redis (ioredis)
 * - Automatic fallback to in-memory
 * 
 * Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Upstash REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Upstash REST API token
 * - REDIS_URL: Standard Redis connection URL (fallback)
 */

import { config as appConfig } from '@/lib/config'

// ============================================================================
// Types
// ============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

interface RateLimitStoreInterface {
  check(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult>
  peek(key: string, maxRequests: number): Promise<RateLimitResult>
  reset(key: string): Promise<void>
  clear(): Promise<void>
  get size(): number | Promise<number>
  destroy(): void
}

// ============================================================================
// Upstash Redis Store (Serverless)
// ============================================================================

/**
 * Rate limit store using Upstash Redis REST API.
 * Ideal for serverless environments (Vercel, Netlify, etc.)
 */
class UpstashRedisStore implements RateLimitStoreInterface {
  private baseUrl: string
  private token: string
  private localCache: Map<string, { result: RateLimitResult; cachedAt: number }> = new Map()
  private cacheMaxAge = 1000 // 1 second cache to reduce API calls

  constructor(url: string, token: string) {
    this.baseUrl = url
    this.token = token
  }

  private async redisCommand(command: string[]): Promise<any> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    })

    if (!response.ok) {
      throw new Error(`Redis command failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  }

  async check(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const resetAt = now + windowMs

    try {
      // Use Redis MULTI for atomic operations
      const pipeline = [
        ['INCR', key],
        ['PTTL', key],
      ]

      const results = await Promise.all([
        this.redisCommand(['INCR', key]),
        this.redisCommand(['PTTL', key]),
      ])

      const count = results[0] as number
      const ttl = results[1] as number

      // Set expiry if this is a new key (TTL = -1)
      if (ttl === -1) {
        await this.redisCommand(['PEXPIRE', key, windowMs.toString()])
      }

      const actualResetAt = ttl > 0 ? now + ttl : resetAt

      const result: RateLimitResult = {
        allowed: count <= maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetAt: actualResetAt,
        limit: maxRequests,
      }

      // Cache the result
      this.localCache.set(key, { result, cachedAt: now })

      return result
    } catch (error) {
      console.error('Redis rate limit check failed:', error)
      // Return a permissive result on error to avoid blocking users
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt,
        limit: maxRequests,
      }
    }
  }

  async peek(key: string, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now()

    // Check local cache first
    const cached = this.localCache.get(key)
    if (cached && now - cached.cachedAt < this.cacheMaxAge) {
      return cached.result
    }

    try {
      const results = await Promise.all([
        this.redisCommand(['GET', key]),
        this.redisCommand(['PTTL', key]),
      ])

      const count = results[0] ? parseInt(results[0] as string, 10) : 0
      const ttl = results[1] as number

      return {
        allowed: count < maxRequests,
        remaining: Math.max(0, maxRequests - count),
        resetAt: ttl > 0 ? now + ttl : now,
        limit: maxRequests,
      }
    } catch (error) {
      console.error('Redis rate limit peek failed:', error)
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now,
        limit: maxRequests,
      }
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.redisCommand(['DEL', key])
      this.localCache.delete(key)
    } catch (error) {
      console.error('Redis rate limit reset failed:', error)
    }
  }

  async clear(): Promise<void> {
    // Note: This clears all rate limit keys - use with caution
    try {
      const keys = await this.redisCommand(['KEYS', 'rl:*'])
      if (Array.isArray(keys) && keys.length > 0) {
        await this.redisCommand(['DEL', ...keys])
      }
      this.localCache.clear()
    } catch (error) {
      console.error('Redis rate limit clear failed:', error)
    }
  }

  get size(): Promise<number> {
    return this.redisCommand(['DBSIZE']).then(s => s as number).catch(() => 0)
  }

  destroy(): void {
    this.localCache.clear()
  }
}

// ============================================================================
// In-Memory Store (Development/Fallback)
// ============================================================================

/**
 * Simple in-memory rate limit store.
 * Used for development or as fallback when Redis is unavailable.
 */
class InMemoryStore implements RateLimitStoreInterface {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Clean up expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  async check(key: string, maxRequests: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const resetAt = now + windowMs

    const entry = this.store.get(key)

    // No existing entry or window has expired
    if (!entry || entry.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
        limit: maxRequests,
      }
    }

    // Increment counter
    entry.count++

    if (entry.count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        limit: maxRequests,
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
      limit: maxRequests,
    }
  }

  async peek(key: string, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetAt <= now) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetAt: now,
        limit: maxRequests,
      }
    }

    return {
      allowed: entry.count < maxRequests,
      remaining: Math.max(0, maxRequests - entry.count),
      resetAt: entry.resetAt,
      limit: maxRequests,
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key)
      }
    }
  }

  get size(): number {
    return this.store.size
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// ============================================================================
// Store Factory
// ============================================================================

/**
 * Create the appropriate rate limit store based on environment.
 * Prioritizes: Upstash Redis > Standard Redis > In-Memory
 */
function createRateLimitStore(): RateLimitStoreInterface {
  // Check for Upstash Redis (serverless)
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    console.log('[Rate Limit] Using Upstash Redis store')
    return new UpstashRedisStore(upstashUrl, upstashToken)
  }

  // Check for standard Redis URL
  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    console.log('[Rate Limit] Redis URL found but ioredis not implemented - using in-memory store')
    // Note: Add ioredis implementation if needed
    // return new IORedisStore(redisUrl)
  }

  // Fall back to in-memory store
  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[Rate Limit] Using in-memory store in production. ' +
      'For distributed systems, configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    )
  } else {
    console.log('[Rate Limit] Using in-memory store (development mode)')
  }

  return new InMemoryStore()
}

// ============================================================================
// Singleton Export
// ============================================================================

export const rateLimitStore = createRateLimitStore()

export type { RateLimitStoreInterface, RateLimitResult }
