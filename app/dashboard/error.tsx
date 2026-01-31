'use client'

import { useEffect } from 'react'
import Link from 'next/link'

/**
 * Dashboard Error Boundary
 *
 * Handles errors within the dashboard routes while preserving
 * the dashboard layout and navigation.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto h-12 w-12 text-amber-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load this section</h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading this part of your dashboard.
        </p>

        {/* Error Details (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-3 bg-amber-50 rounded-lg text-left">
            <p className="text-sm font-mono text-amber-800 break-all">{error.message}</p>
            {error.digest && <p className="text-xs text-amber-600 mt-1">Digest: {error.digest}</p>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  )
}
