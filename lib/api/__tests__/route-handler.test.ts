/**
 * Route Handler Wrapper Tests
 * 
 * Tests for the withApiHandler wrapper and apiResponse helpers.
 */

import { withApiHandler, ApiError, apiResponse } from '../route-handler'
import { AuthError } from '../auth-middleware'

// Create mock request helper
const createMockRequest = (url: string = 'http://localhost:3000/api/v1/test', method: string = 'GET') => ({
  url,
  method,
  json: () => Promise.resolve({}),
})

// Create mock response helper
const createMockResponse = (data: any, status: number = 200) => ({
  status,
  ok: status < 400,
  json: () => Promise.resolve(data),
  data,
})

describe('withApiHandler', () => {
  let mockRequest: any
  
  beforeEach(() => {
    mockRequest = createMockRequest()
    jest.clearAllMocks()
  })
  
  describe('successful requests', () => {
    it('should return handler response on success', async () => {
      const handler = withApiHandler(async () => {
        return createMockResponse({ message: 'Success' }) as any
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Success')
    })
    
    it('should pass request and context to handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        createMockResponse({ ok: true })
      )
      const handler = withApiHandler(mockHandler)
      const context = { params: { id: '123' } }
      
      await handler(mockRequest as any, context)
      
      expect(mockHandler).toHaveBeenCalledWith(mockRequest, context)
    })
    
    it('should handle synchronous handlers', async () => {
      const handler = withApiHandler(() => {
        return createMockResponse({ sync: true }) as any
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(200)
    })
  })
  
  describe('AuthError handling', () => {
    it('should return 401 for AuthError', async () => {
      const handler = withApiHandler(async () => {
        throw new AuthError('Unauthorized')
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })
    
    it('should return custom status for AuthError', async () => {
      const handler = withApiHandler(async () => {
        throw new AuthError('Forbidden', 403)
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(403)
    })
  })
  
  describe('ApiError handling', () => {
    it('should return error with custom status', async () => {
      const handler = withApiHandler(async () => {
        throw new ApiError('Not found', 404)
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Not found')
    })
    
    it('should include error code if provided', async () => {
      const handler = withApiHandler(async () => {
        throw new ApiError('Portfolio not found', 404, 'PORTFOLIO_NOT_FOUND')
      })
      
      const response = await handler(mockRequest as any)
      
      const data = await response.json()
      expect(data.error).toBe('Portfolio not found')
      expect(data.code).toBe('PORTFOLIO_NOT_FOUND')
    })
    
    it('should handle 400 Bad Request', async () => {
      const handler = withApiHandler(async () => {
        throw new ApiError('Invalid input', 400)
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(400)
    })
    
    it('should handle 500 Server Error', async () => {
      const handler = withApiHandler(async () => {
        throw new ApiError('Database error', 500)
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(500)
    })
  })
  
  describe('unknown error handling', () => {
    it('should return 500 for unknown errors', async () => {
      const handler = withApiHandler(async () => {
        throw new Error('Something went wrong')
      })
      
      const response = await handler(mockRequest as any)
      
      expect(response.status).toBe(500)
    })
    
    it('should hide error details in production', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const handler = withApiHandler(async () => {
        throw new Error('Sensitive error details')
      })
      
      const response = await handler(mockRequest as any)
      const data = await response.json()
      
      expect(data.error).toBe('Internal server error')
      expect(data.error).not.toContain('Sensitive')
      
      process.env.NODE_ENV = originalEnv
    })
  })
})

describe('ApiError', () => {
  it('should create error with message and default status', () => {
    const error = new ApiError('Test error')
    
    expect(error.message).toBe('Test error')
    expect(error.status).toBe(500)
    expect(error.code).toBeUndefined()
    expect(error.name).toBe('ApiError')
  })
  
  it('should create error with custom status', () => {
    const error = new ApiError('Not found', 404)
    
    expect(error.message).toBe('Not found')
    expect(error.status).toBe(404)
  })
  
  it('should create error with code', () => {
    const error = new ApiError('Invalid', 400, 'VALIDATION_ERROR')
    
    expect(error.code).toBe('VALIDATION_ERROR')
  })
  
  it('should be instanceof Error', () => {
    const error = new ApiError('Test')
    
    expect(error instanceof Error).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('apiResponse helpers', () => {
  describe('success', () => {
    it('should return 200 by default', () => {
      const response = apiResponse.success({ data: 'test' })
      
      expect(response.status).toBe(200)
    })
    
    it('should accept custom status', () => {
      const response = apiResponse.success({ data: 'test' }, 201)
      
      expect(response.status).toBe(201)
    })
  })
  
  describe('error', () => {
    it('should return 500 by default', () => {
      const response = apiResponse.error('Server error')
      
      expect(response.status).toBe(500)
    })
    
    it('should accept custom status and code', () => {
      const response = apiResponse.error('Not found', 404, 'NOT_FOUND')
      
      expect(response.status).toBe(404)
    })
  })
  
  describe('created', () => {
    it('should return 201', () => {
      const response = apiResponse.created({ id: '123' })
      
      expect(response.status).toBe(201)
    })
  })
  
  describe('noContent', () => {
    it.skip('should return 204', () => {
      // Skipped: requires full NextResponse constructor mock
      const response = apiResponse.noContent()
      
      expect(response.status).toBe(204)
    })
  })
  
  describe('notFound', () => {
    it('should return 404 with default message', () => {
      const response = apiResponse.notFound()
      
      expect(response.status).toBe(404)
    })
    
    it('should accept custom message', () => {
      const response = apiResponse.notFound('Portfolio not found')
      
      expect(response.status).toBe(404)
    })
  })
  
  describe('unauthorized', () => {
    it('should return 401', () => {
      const response = apiResponse.unauthorized()
      
      expect(response.status).toBe(401)
    })
  })
  
  describe('forbidden', () => {
    it('should return 403', () => {
      const response = apiResponse.forbidden()
      
      expect(response.status).toBe(403)
    })
  })
  
  describe('badRequest', () => {
    it('should return 400', () => {
      const response = apiResponse.badRequest()
      
      expect(response.status).toBe(400)
    })
  })
})
