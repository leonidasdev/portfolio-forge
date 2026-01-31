'use client'

import { useEffect } from 'react'

/**
 * Certifications Error Boundary
 *
 * Handles errors in the certifications section with recovery options.
 */
export default function CertificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Certifications error:', error)
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to load certifications</h2>
        <p className="text-gray-600 mb-4">
          We couldn&apos;t load your certifications. Please try again.
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
