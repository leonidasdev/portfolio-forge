'use client'

import { useEffect } from 'react'

/**
 * Portfolios Error Boundary
 *
 * Handles errors in the portfolios section with recovery options.
 */
export default function PortfoliosError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Portfolios error:', error)
  }, [error])

  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load portfolios</h2>
        <p className="text-gray-600 mb-4">
          We couldn&apos;t load your portfolios. This might be a temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm text-red-600 mb-4 font-mono bg-red-100 p-2 rounded">
            {error.message}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
