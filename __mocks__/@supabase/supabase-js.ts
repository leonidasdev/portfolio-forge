/**
 * Mock for @supabase/supabase-js module
 */

export interface User {
  id: string
  email?: string
  aud: string
  role?: string
}

export interface SupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: User | null }, error: any }>
  }
  from: (table: string) => any
}

export const createClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
}))
