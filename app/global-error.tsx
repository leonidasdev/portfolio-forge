'use client'

import { useEffect } from 'react'

/**
 * Global Error Boundary
 *
 * Catches unhandled errors in the application and displays
 * a user-friendly error message with recovery options.
 *
 * Note: This component intentionally uses <a> tags instead of
 * Next.js <Link> components because the router may be in a broken
 * state when this error boundary is triggered.
 */

/* eslint-disable @next/next/no-html-link-for-pages */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="mx-auto h-16 w-16 text-red-500 mb-6">
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            {/* Error Details (development only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 break-all">{error.message}</p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to homepage
              </a>
            </div>

            {/* Support Link */}
            <p className="mt-8 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a href="mailto:support@portfolioforge.com" className="text-blue-600 hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
