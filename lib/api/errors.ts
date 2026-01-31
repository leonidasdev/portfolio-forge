/**
 * Consolidated Error Classes for API
 *
 * Central location for all API-related error classes.
 * Import these instead of defining locally.
 *
 * @example
 * import { ApiError, AuthError, ValidationError } from '@/lib/api/errors'
 */

/**
 * Custom API error with status code and optional error code
 * Used for all API error responses
 */
export class ApiError extends Error {
  /**
   * Alias for status (backward compatibility)
   */
  public readonly statusCode: number

  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    // Alias for backward compatibility with client.ts usage
    this.statusCode = status
  }
}

/**
 * Authentication error
 * Used when user is not authenticated or authorization fails
 */
export class AuthError extends Error {
  constructor(
    message: string = 'Unauthorized',
    public status: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Validation error
 * Used when request data fails validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }> = []
  ) {
    super(message)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

/**
 * Not found error
 * Used when a requested resource doesn't exist
 */
export class NotFoundError extends Error {
  constructor(
    resource: string = 'Resource',
    public status: number = 404
  ) {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
  }
}

/**
 * Rate limit error
 * Used when rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor(
    public retryAfter: number,
    message: string = 'Rate limit exceeded'
  ) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Type guard to check if an error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}
