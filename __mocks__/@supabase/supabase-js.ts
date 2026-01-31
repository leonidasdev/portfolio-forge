/**
 * Mock for @supabase/supabase-js module
 */

export interface User {
  id: string
  email?: string
  aud: string
  role?: string
}

export interface AuthError {
  message: string
  status?: number
}

export interface QueryBuilder {
  select: () => QueryBuilder
  eq: () => QueryBuilder
  insert: () => QueryBuilder
  update: () => QueryBuilder
  delete: () => QueryBuilder
}

export interface SupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: User | null }; error: AuthError | null }>
  }
  from: (table: string) => QueryBuilder
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
