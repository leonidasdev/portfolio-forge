/**
 * Supabase Server Client for Portfolio Forge
 * 
 * This module provides server-side Supabase client utilities for:
 * - Server Components
 * - Server Actions
 * - Route Handlers (API routes)
 * 
 * The client automatically includes the user's session for Row-Level Security (RLS).
 * 
 * Usage in Server Components:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase/server'
 * 
 * export default async function Page() {
 *   const supabase = await createServerClient()
 *   const { data: portfolios } = await supabase.from('portfolios').select('*')
 *   return <div>{portfolios?.length} portfolios</div>
 * }
 * ```
 * 
 * Usage in Server Actions:
 * ```tsx
 * 'use server'
 * import { createServerClient } from '@/lib/supabase/server'
 * 
 * export async function createPortfolio(formData: FormData) {
 *   const supabase = await createServerClient()
 *   const { data, error } = await supabase.from('portfolios').insert({...})
 *   return { data, error }
 * }
 * ```
 * 
 * Usage in Route Handlers:
 * ```tsx
 * import { createServerClient } from '@/lib/supabase/server'
 * 
 * export async function GET() {
 *   const supabase = await createServerClient()
 *   const { data } = await supabase.from('portfolios').select('*')
 *   return Response.json(data)
 * }
 * ```
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './types'

/**
 * Creates a Supabase client for server-side use
 * Automatically reads cookies and includes auth session
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current authenticated user from the session
 * Returns null if no user is authenticated
 */
export async function getUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Gets the current session
 * Returns null if no session exists
 */
export async function getSession() {
  const supabase = await createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session) {
    return null
  }
  
  return session
}

/**
 * Gets the user's profile from the profiles table
 * Returns null if user is not authenticated or profile doesn't exist
 */
export async function getUserProfile() {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const supabase = await createServerClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile
}

/**
 * Checks if the current user is authenticated
 * Useful for protecting pages and actions
 */
export async function isAuthenticated() {
  const user = await getUser()
  return !!user
}
