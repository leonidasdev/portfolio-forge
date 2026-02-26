/**
 * Mock for @/lib/supabase/server module
 */

// Mock client instance
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  })),
}

export const createServerClient = jest.fn(() => Promise.resolve(mockSupabaseClient))

export const getUser = jest.fn().mockResolvedValue(null)

export const getSession = jest.fn().mockResolvedValue(null)

export const getUserProfile = jest.fn().mockResolvedValue(null)

export const isAuthenticated = jest.fn().mockResolvedValue(false)

// Export mock client for test manipulation
export const __mockSupabaseClient = mockSupabaseClient
