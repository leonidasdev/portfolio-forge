/**
 * Auth Middleware Tests
 * 
 * Tests for the authentication middleware functions.
 */

import { requireAuth, optionalAuth, AuthError } from '../auth-middleware'

// Mock Supabase server client
const mockGetUser = jest.fn()
const mockSupabaseClient = {
  auth: {
    getUser: mockGetUser,
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Create a minimal mock request for testing
const createMockRequest = (url: string = 'http://localhost:3000/api/v1/test') => ({
  url,
  method: 'GET',
  headers: new Map(),
})

describe('Auth Middleware', () => {
  let mockRequest: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = createMockRequest()
  })
  
  describe('requireAuth', () => {
    it('should return user and supabase client when authenticated', async () => {
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }
      
      mockGetUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })
      
      const result = await requireAuth(mockRequest)
      
      expect(result.user).toEqual(mockUser)
      expect(result.supabase).toBeDefined()
      expect(mockGetUser).toHaveBeenCalled()
    })
    
    it('should throw AuthError when user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
      
      await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
      await expect(requireAuth(mockRequest)).rejects.toThrow('Unauthorized')
    })
    
    it('should throw AuthError with 401 status on auth failure', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' },
      })
      
      try {
        await requireAuth(mockRequest)
        fail('Should have thrown AuthError')
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError)
        expect((error as AuthError).status).toBe(401)
        expect((error as AuthError).message).toBe('Unauthorized')
      }
    })
    
    it('should throw AuthError when getUser returns error', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Session expired' },
      })
      
      await expect(requireAuth(mockRequest)).rejects.toThrow(AuthError)
    })
  })
  
  describe('optionalAuth', () => {
    it('should return user when authenticated', async () => {
      const mockUser = { 
        id: 'user-456', 
        email: 'optional@example.com',
        aud: 'authenticated',
        role: 'authenticated',
      }
      
      mockGetUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      })
      
      const result = await optionalAuth(mockRequest)
      
      expect(result.user).toEqual(mockUser)
      expect(result.supabase).toBeDefined()
    })
    
    it('should return null user when not authenticated', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })
      
      const result = await optionalAuth(mockRequest)
      
      expect(result.user).toBeNull()
      expect(result.supabase).toBeDefined()
    })
    
    it('should not throw when there is an auth error', async () => {
      mockGetUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid session' },
      })
      
      const result = await optionalAuth(mockRequest)
      
      expect(result.user).toBeNull()
      expect(result.supabase).toBeDefined()
    })
  })
  
  describe('AuthError', () => {
    it('should create error with message and default status', () => {
      const error = new AuthError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(401)
      expect(error.name).toBe('AuthError')
    })
    
    it('should create error with custom status', () => {
      const error = new AuthError('Forbidden', 403)
      
      expect(error.message).toBe('Forbidden')
      expect(error.status).toBe(403)
    })
    
    it('should be instanceof Error', () => {
      const error = new AuthError('Test')
      
      expect(error instanceof Error).toBe(true)
      expect(error instanceof AuthError).toBe(true)
    })
  })
})
