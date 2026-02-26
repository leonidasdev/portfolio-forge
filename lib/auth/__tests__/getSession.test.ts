/**
 * Auth Session Helper Tests
 *
 * Tests for getAuthSession, getAuthUser, and isAuthenticated functions.
 */

import { getSession } from '@/lib/supabase/server'
import { getAuthSession, getAuthUser, isAuthenticated } from '../getSession'

// Mock the supabase server module
jest.mock('@/lib/supabase/server')

const mockedGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('Auth Session Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAuthSession', () => {
    it('should return null when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      const result = await getAuthSession()

      expect(result).toBeNull()
      expect(mockedGetSession).toHaveBeenCalledTimes(1)
    })

    it('should return session when user is authenticated', async () => {
      const mockSession = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        refresh_token: 'refresh-token',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
        },
      }
      mockedGetSession.mockResolvedValueOnce(mockSession as any)

      const result = await getAuthSession()

      expect(result).toEqual(mockSession)
    })
  })

  describe('getAuthUser', () => {
    it('should return null when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      const result = await getAuthUser()

      expect(result).toBeNull()
    })

    it('should return user when session exists', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      }
      const mockSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        refresh_token: 'refresh',
        user: mockUser,
      }
      mockedGetSession.mockResolvedValueOnce(mockSession as any)

      const result = await getAuthUser()

      expect(result).toEqual(mockUser)
    })

    it('should return null when session exists but user is missing', async () => {
      const mockSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        refresh_token: 'refresh',
        user: undefined,
      }
      mockedGetSession.mockResolvedValueOnce(mockSession as any)

      const result = await getAuthUser()

      // Should return null because user is undefined
      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      const result = await isAuthenticated()

      expect(result).toBe(false)
    })

    it('should return true when session exists', async () => {
      const mockSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        refresh_token: 'refresh',
        user: { id: 'user-789', email: 'auth@example.com', aud: 'authenticated' },
      }
      mockedGetSession.mockResolvedValueOnce(mockSession as any)

      const result = await isAuthenticated()

      expect(result).toBe(true)
    })
  })
})
