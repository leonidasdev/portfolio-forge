/**
 * Dashboard Layout - Protected layout for authenticated users
 * 
 * This layout:
 * - Enforces authentication using requireSession()
 * - Provides session to all nested pages via SessionContext
 * - Wraps all routes under /dashboard/*
 * - Redirects to /login if not authenticated
 * 
 * All pages under /dashboard/* will automatically:
 * - Be protected by authentication
 * - Have access to session via useSession() hook
 * - Receive a consistent layout wrapper
 */

import { requireSession } from '@/lib/auth/requireSession'
import { SessionProvider } from '@/lib/auth/SessionContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce authentication - redirects to /login if not authenticated
  // This runs on every request to /dashboard/*
  const session = await requireSession()

  // Session is guaranteed to exist here (or user was redirected)
  // Pass it to all children via Context
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        {/* 
          Simple wrapper div - no navigation UI yet
          Children will have access to session via useSession() hook
        */}
        {children}
      </div>
    </SessionProvider>
  )
}
