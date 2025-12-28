/**
 * Welcome Message Component - Example Client Component using session context
 * 
 * This demonstrates PATTERN 2: Client Component accessing session from layout
 * Uses useSession() hook to access user data provided by dashboard layout
 */

'use client'

import { useSession, useUser, useUserId } from '@/lib/auth/SessionContext'

export function WelcomeMessage({ userName }: { userName?: string | null }) {
  // Access session from layout context
  // This is available because dashboard layout provides SessionProvider
  const { user, userId } = useSession()
  
  // Alternative: use convenience hooks
  // const user = useUser()
  // const userId = useUserId()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-3xl font-bold">
        Welcome back{userName ? `, ${userName}` : ''}!
      </h1>
      <p className="text-gray-600 mt-2">
        Logged in as: <span className="font-medium">{user.email}</span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        User ID: <code className="font-mono">{userId}</code>
      </p>
      
      {/* Display session metadata if available */}
      {user.user_metadata.full_name && (
        <p className="text-sm text-gray-600 mt-2">
          Profile: {user.user_metadata.full_name}
        </p>
      )}
      
      {user.app_metadata.provider && (
        <p className="text-xs text-gray-500 mt-1">
          Signed in via: <span className="capitalize">{user.app_metadata.provider}</span>
        </p>
      )}
    </div>
  )
}
