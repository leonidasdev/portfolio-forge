/**
 * Authentication Middleware for API Routes
 * 
 * Provides centralized authentication helpers for Next.js API routes.
 * Eliminates code duplication across 30+ route handlers.
 * 
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const { user, supabase } = await requireAuth(request)
 *   // ... authenticated route logic
 * }
 * ```
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

/**
 * Custom error class for authentication failures
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Return type for requireAuth helper
 */
export interface AuthContext {
  user: User
  supabase: SupabaseClient<Database>
}

/**
 * Validates user authentication and returns user + Supabase client.
 * 
 * @param request - The Next.js request object
 * @returns Promise containing authenticated user and Supabase client
 * @throws {AuthError} If user is not authenticated
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { user, supabase } = await requireAuth(request)
 *   
 *   // Use authenticated user
 *   const { data } = await supabase
 *     .from('portfolios')
 *     .select('*')
 *     .eq('user_id', user.id)
 *   
 *   return NextResponse.json(data)
 * }
 * ```
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AuthError('Unauthorized', 401)
  }
  
  return { user, supabase }
}

/**
 * Optional authentication - returns user if authenticated, null otherwise.
 * Useful for public endpoints that can optionally personalize for logged-in users.
 * 
 * @param request - The Next.js request object
 * @returns Promise containing user (or null) and Supabase client
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const { user, supabase } = await optionalAuth(request)
 *   
 *   if (user) {
 *     // Return user-specific data
 *   } else {
 *     // Return public data
 *   }
 * }
 * ```
 */
export async function optionalAuth(request: NextRequest): Promise<{
  user: User | null
  supabase: SupabaseClient<Database>
}> {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  return { user, supabase }
}
