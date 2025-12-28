/**
 * Session Helper - Get Authenticated Session
 * 
 * This helper provides a convenient way to read the authenticated user's session
 * in Server Components, Server Actions, and Route Handlers.
 * 
 * Returns null if no session exists (user not authenticated).
 * Returns session object if user is authenticated.
 * 
 * Usage:
 * ```tsx
 * import { getAuthSession } from '@/lib/auth/getSession'
 * 
 * export default async function MyPage() {
 *   const session = await getAuthSession()
 *   
 *   if (!session) {
 *     return <div>Not logged in</div>
 *   }
 *   
 *   return <div>Welcome {session.user.email}</div>
 * }
 * ```
 */

import { getSession } from '@/lib/supabase/server'
import type { Session } from '@supabase/supabase-js'

export type AuthSession = Session | null

/**
 * Get the current authenticated session
 * 
 * @returns Session object if authenticated, null otherwise
 * 
 * Note: This does NOT redirect. For automatic redirects, use requireSession()
 */
export async function getAuthSession(): Promise<AuthSession> {
  return await getSession()
}

/**
 * Get the authenticated user from the session
 * 
 * Convenience helper that extracts just the user object
 * Returns null if no session exists
 */
export async function getAuthUser() {
  const session = await getAuthSession()
  return session?.user ?? null
}

/**
 * Check if user is authenticated
 * 
 * Returns boolean without fetching full session details
 * Useful for conditional rendering
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession()
  return session !== null
}
