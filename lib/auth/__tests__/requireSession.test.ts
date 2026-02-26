/**
 * Require Session Helper Tests
 *
 * Tests for requireSession, requireUser, and requireUserId functions.
 */

import { getSession } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSession, requireUser, requireUserId } from '../requireSession'

// Mock modules
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation')

const mockedGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('Require Session Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requireSession', () => {
    it('should redirect to /login when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      await expect(requireSession()).rejects.toThrow('NEXT_REDIRECT:/login')
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('should redirect with returnTo param when redirectTo is provided', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      await expect(requireSession('/dashboard')).rejects.toThrow('NEXT_REDIRECT')
      expect(redirect).toHaveBeenCalledWith('/login?redirectTo=%2Fdashboard')
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

      const result = await requireSession()

      expect(result).toEqual(mockSession)
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('requireUser', () => {
    it('should redirect to /login when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT:/login')
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

      const result = await requireUser()

      expect(result).toEqual(mockUser)
    })
  })

  describe('requireUserId', () => {
    it('should redirect to /login when no session exists', async () => {
      mockedGetSession.mockResolvedValueOnce(null)

      await expect(requireUserId()).rejects.toThrow('NEXT_REDIRECT:/login')
    })

    it('should return user ID when session exists', async () => {
      const mockSession = {
        access_token: 'token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() / 1000 + 3600,
        refresh_token: 'refresh',
        user: {
          id: 'specific-user-id-789',
          email: 'id@example.com',
          aud: 'authenticated',
        },
      }
      mockedGetSession.mockResolvedValueOnce(mockSession as any)

      const result = await requireUserId()

      expect(result).toBe('specific-user-id-789')
    })
  })
})
