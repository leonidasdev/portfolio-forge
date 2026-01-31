/**
 * Route Handler Wrapper for API Routes
 *
 * Provides centralized error handling, logging, and response formatting.
 * Eliminates 30+ duplicated try-catch blocks across routes.
 *
 * Usage:
 * ```typescript
 * export const POST = withApiHandler(async (request) => {
 *   const { user } = await requireAuth(request)
 *   // ... route logic
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */

import { apiLogger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { AuthError } from './auth-middleware'
import { ApiError } from './errors'

// Re-export ApiError for convenience
export { ApiError } from './errors'

/**
 * Type for route handler function
 * Compatible with Next.js 15 where params is a Promise
 */
type RouteHandler = (
  request: NextRequest,
  context?: {
    params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>
  }
) => Promise<Response> | Response

/**
 * Wraps API route handlers with error handling and logging.
 *
 * Benefits:
 * - Centralized error handling
 * - Automatic error logging
 * - Consistent error responses
 * - Support for custom error types
 * - Easy to add global features (rate limiting, metrics, etc.)
 *
 * @param handler - The route handler function
 * @returns Wrapped route handler with error handling
 *
 * @example Basic usage
 * ```typescript
 * export const GET = withApiHandler(async (request) => {
 *   const data = await fetchData()
 *   return NextResponse.json(data)
 * })
 * ```
 *
 * @example With authentication
 * ```typescript
 * export const POST = withApiHandler(async (request) => {
 *   const { user, supabase } = await requireAuth(request)
 *
 *   const body = await request.json()
 *   const result = await processData(body)
 *
 *   return NextResponse.json({ success: true, data: result })
 * })
 * ```
 *
 * @example With custom errors
 * ```typescript
 * export const DELETE = withApiHandler(async (request) => {
 *   const { user } = await requireAuth(request)
 *
 *   const itemExists = await checkItem(itemId)
 *   if (!itemExists) {
 *     throw new ApiError('Item not found', 404)
 *   }
 *
 *   await deleteItem(itemId)
 *   return NextResponse.json({ success: true })
 * })
 * ```
 */
export function withApiHandler(handler: RouteHandler): RouteHandler {
  return async (
    request: NextRequest,
    context?: {
      params?: Promise<Record<string, string | string[]>> | Record<string, string | string[]>
    }
  ) => {
    const startTime = Date.now()

    try {
      // Execute the handler
      const response = await handler(request, context)

      // Log successful requests (optional, can be disabled in production)
      const duration = Date.now() - startTime
      if (process.env.LOG_LEVEL === 'verbose') {
        apiLogger.response(request.method, request.url, response.status, duration)
      }

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Handle authentication errors
      if (error instanceof AuthError) {
        apiLogger.warn('Authentication failed', {
          type: 'AuthError',
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
        })

        return NextResponse.json({ error: error.message }, { status: error.status })
      }

      // Handle custom API errors
      if (error instanceof ApiError) {
        apiLogger.error('API error', {
          type: 'ApiError',
          code: error.code,
          status: error.status,
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
          error,
        })

        return NextResponse.json(
          {
            error: error.message,
            ...(error.code && { code: error.code }),
          },
          { status: error.status }
        )
      }

      // Handle validation errors (from Zod or other validators)
      if (error instanceof Error && error.name === 'ZodError') {
        apiLogger.warn('Validation error', {
          type: 'ValidationError',
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
          error,
        })

        return NextResponse.json(
          { error: 'Invalid request data', details: error.message },
          { status: 400 }
        )
      }

      // Handle unknown errors
      apiLogger.error('Unexpected error', {
        type: 'UnknownError',
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        error,
      })

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development'

      return NextResponse.json(
        {
          error: isDevelopment && error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to create API responses with consistent formatting
 */
export const apiResponse = {
  /**
   * Success response
   */
  success: <T = unknown>(data: T, status: number = 200) => {
    return NextResponse.json(data, { status })
  },

  /**
   * Error response
   */
  error: (message: string, status: number = 500, code?: string) => {
    return NextResponse.json({ error: message, ...(code && { code }) }, { status })
  },

  /**
   * Created response (201)
   */
  created: <T = unknown>(data: T) => {
    return NextResponse.json(data, { status: 201 })
  },

  /**
   * No content response (204)
   */
  noContent: () => {
    return new NextResponse(null, { status: 204 })
  },

  /**
   * Not found response (404)
   */
  notFound: (message: string = 'Resource not found') => {
    return NextResponse.json({ error: message }, { status: 404 })
  },

  /**
   * Unauthorized response (401)
   */
  unauthorized: (message: string = 'Unauthorized') => {
    return NextResponse.json({ error: message }, { status: 401 })
  },

  /**
   * Forbidden response (403)
   */
  forbidden: (message: string = 'Forbidden') => {
    return NextResponse.json({ error: message }, { status: 403 })
  },

  /**
   * Bad request response (400)
   */
  badRequest: (message: string = 'Bad request') => {
    return NextResponse.json({ error: message }, { status: 400 })
  },
}
