/**
 * Mock for @/lib/supabase/server module
 */

export const createServerClient = jest.fn(() => Promise.resolve({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
}))
