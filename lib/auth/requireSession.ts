/**
 * Session Helper - Require Authentication
 * 
 * This helper enforces authentication in Server Components and Route Handlers.
 * If no session exists, it automatically redirects to /login.
 * If session exists, it returns the session object.
 * 
 * This simplifies protected page logic by eliminating manual session checks
 * and redirect handling.
 * 
 * Usage:
 * ```tsx
 * import { requireSession } from '@/lib/auth/requireSession'
 * 
 * export default async function ProtectedPage() {
 *   // This will redirect to /login if not authenticated
 *   const session = await requireSession()
 *   
 *   // If we reach here, user is authenticated
 *   return <div>Welcome {session.user.email}</div>
 * }
 * ```
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/supabase/server'
import type { Session } from '@supabase/supabase-js'

/**
 * Require an authenticated session
 * 
 * @param redirectTo - Optional path to redirect to after login (default: current path not preserved)
 * @returns Session object (guaranteed to exist)
 * @throws Redirects to /login if not authenticated
 * 
 * Note: This function uses Next.js redirect() which throws an error internally.
 * This is expected Next.js behavior - do not catch this error.
 */
export async function requireSession(redirectTo?: string): Promise<Session> {
  const session = await getSession()
  
  if (!session) {
    // Build redirect URL with optional returnTo parameter
    if (redirectTo) {
      redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)
    } else {
      redirect('/login')
    }
  }
  
  return session
}

/**
 * Require authenticated user
 * 
 * Convenience helper that returns just the user object
 * Redirects to /login if not authenticated
 */
export async function requireUser() {
  const session = await requireSession()
  return session.user
}

/**
 * Require authenticated user ID
 * 
 * Ultra-convenient helper for common case of just needing the user ID
 * Redirects to /login if not authenticated
 */
export async function requireUserId(): Promise<string> {
  const session = await requireSession()
  return session.user.id
}
