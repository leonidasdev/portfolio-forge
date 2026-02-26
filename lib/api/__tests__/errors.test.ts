/**
 * Error Classes Tests
 *
 * Tests for consolidated API error classes.
 */

import {
  ApiError,
  AuthError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  isApiError,
  isAuthError,
  isValidationError,
} from '../errors'

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with message and default status', () => {
      const error = new ApiError('Something went wrong')
      expect(error.message).toBe('Something went wrong')
      expect(error.status).toBe(500)
      expect(error.statusCode).toBe(500)
      expect(error.name).toBe('ApiError')
    })

    it('should create error with custom status', () => {
      const error = new ApiError('Bad request', 400)
      expect(error.message).toBe('Bad request')
      expect(error.status).toBe(400)
      expect(error.statusCode).toBe(400)
    })

    it('should create error with code', () => {
      const error = new ApiError('Rate limited', 429, 'RATE_LIMIT_EXCEEDED')
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should create error with data', () => {
      const data = { field: 'email', reason: 'invalid' }
      const error = new ApiError('Validation failed', 422, 'VALIDATION_ERROR', data)
      expect(error.data).toEqual(data)
    })

    it('should be instance of Error', () => {
      const error = new ApiError('Test')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('AuthError', () => {
    it('should create error with default message and status', () => {
      const error = new AuthError()
      expect(error.message).toBe('Unauthorized')
      expect(error.status).toBe(401)
      expect(error.name).toBe('AuthError')
    })

    it('should create error with custom message', () => {
      const error = new AuthError('Invalid token')
      expect(error.message).toBe('Invalid token')
      expect(error.status).toBe(401)
    })

    it('should create error with custom status', () => {
      const error = new AuthError('Forbidden', 403)
      expect(error.message).toBe('Forbidden')
      expect(error.status).toBe(403)
    })

    it('should be instance of Error', () => {
      const error = new AuthError()
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('ValidationError', () => {
    it('should create error with message and empty errors array', () => {
      const error = new ValidationError('Invalid input')
      expect(error.message).toBe('Invalid input')
      expect(error.errors).toEqual([])
      expect(error.name).toBe('ValidationError')
    })

    it('should create error with validation errors array', () => {
      const validationErrors = [
        { path: 'email', message: 'Invalid email format' },
        { path: 'name', message: 'Name is required' },
      ]
      const error = new ValidationError('Validation failed', validationErrors)
      expect(error.errors).toEqual(validationErrors)
    })

    it('should be instance of Error', () => {
      const error = new ValidationError('Test')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('NotFoundError', () => {
    it('should create error with default resource name', () => {
      const error = new NotFoundError()
      expect(error.message).toBe('Resource not found')
      expect(error.status).toBe(404)
      expect(error.name).toBe('NotFoundError')
    })

    it('should create error with custom resource name', () => {
      const error = new NotFoundError('Portfolio')
      expect(error.message).toBe('Portfolio not found')
    })

    it('should create error with custom status', () => {
      const error = new NotFoundError('User', 410)
      expect(error.status).toBe(410)
    })

    it('should be instance of Error', () => {
      const error = new NotFoundError()
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('RateLimitError', () => {
    it('should create error with retryAfter and default message', () => {
      const error = new RateLimitError(60)
      expect(error.message).toBe('Rate limit exceeded')
      expect(error.retryAfter).toBe(60)
      expect(error.name).toBe('RateLimitError')
    })

    it('should create error with custom message', () => {
      const error = new RateLimitError(120, 'Too many requests, try again later')
      expect(error.message).toBe('Too many requests, try again later')
      expect(error.retryAfter).toBe(120)
    })

    it('should be instance of Error', () => {
      const error = new RateLimitError(30)
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Type Guards', () => {
    describe('isApiError', () => {
      it('should return true for ApiError', () => {
        const error = new ApiError('Test')
        expect(isApiError(error)).toBe(true)
      })

      it('should return false for other errors', () => {
        expect(isApiError(new Error('Test'))).toBe(false)
        expect(isApiError(new AuthError())).toBe(false)
        expect(isApiError(null)).toBe(false)
        expect(isApiError(undefined)).toBe(false)
        expect(isApiError('error')).toBe(false)
        expect(isApiError({ message: 'error' })).toBe(false)
      })
    })

    describe('isAuthError', () => {
      it('should return true for AuthError', () => {
        const error = new AuthError()
        expect(isAuthError(error)).toBe(true)
      })

      it('should return false for other errors', () => {
        expect(isAuthError(new Error('Test'))).toBe(false)
        expect(isAuthError(new ApiError('Test'))).toBe(false)
        expect(isAuthError(null)).toBe(false)
        expect(isAuthError(undefined)).toBe(false)
      })
    })

    describe('isValidationError', () => {
      it('should return true for ValidationError', () => {
        const error = new ValidationError('Test')
        expect(isValidationError(error)).toBe(true)
      })

      it('should return false for other errors', () => {
        expect(isValidationError(new Error('Test'))).toBe(false)
        expect(isValidationError(new ApiError('Test'))).toBe(false)
        expect(isValidationError(null)).toBe(false)
        expect(isValidationError(undefined)).toBe(false)
      })
    })
  })
})
