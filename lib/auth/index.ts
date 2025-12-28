/**
 * Auth Utilities - Barrel Export
 * 
 * Centralized exports for all authentication utilities.
 * Import from this file for convenience:
 * 
 * ```tsx
 * // Server Components
 * import { requireSession, getAuthSession, requireUserId } from '@/lib/auth'
 * 
 * // Client Components
 * import { useSession, useUser, useUserId } from '@/lib/auth'
 * ```
 */

// Session reading utilities (Server)
export { 
  getAuthSession, 
  getAuthUser, 
  isAuthenticated,
  type AuthSession 
} from './getSession'

// Session enforcement utilities (Server)
export { 
  requireSession, 
  requireUser, 
  requireUserId 
} from './requireSession'

// Session context utilities (Client)
export { 
  SessionProvider,
  useSession, 
  useUser, 
  useUserId 
} from './SessionContext'
