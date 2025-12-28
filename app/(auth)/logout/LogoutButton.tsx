/**
 * Logout Button Component
 * 
 * Example client component that uses the signOut server action
 * Can be used in any client component throughout the app
 */

'use client'

import { useState } from 'react'
import { signOut } from './actions'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      // Redirect happens in the server action
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
