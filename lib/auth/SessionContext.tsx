/**
 * Session Context - Share authenticated session across dashboard
 * 
 * This context provides the authenticated session to all components
 * within the dashboard layout without requiring repeated session fetches.
 * 
 * The session is guaranteed to exist (enforced by layout's requireSession).
 */

'use client'

import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

interface SessionContextValue {
  session: Session
  user: User
  userId: string
}

const SessionContext = createContext<SessionContextValue | null>(null)

/**
 * Provider component that makes session available to children
 */
export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session
}) {
  const value: SessionContextValue = {
    session,
    user: session.user,
    userId: session.user.id,
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

/**
 * Hook to access session in client components
 * 
 * Usage:
 * ```tsx
 * 'use client'
 * import { useSession } from '@/lib/auth/SessionContext'
 * 
 * export function MyComponent() {
 *   const { user, userId } = useSession()
 *   return <div>Welcome {user.email}</div>
 * }
 * ```
 */
export function useSession() {
  const context = useContext(SessionContext)
  
  if (!context) {
    throw new Error('useSession must be used within SessionProvider (dashboard layout)')
  }
  
  return context
}

/**
 * Convenience hooks for common use cases
 */
export function useUser() {
  const { user } = useSession()
  return user
}

export function useUserId() {
  const { userId } = useSession()
  return userId
}
