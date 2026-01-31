import Link from 'next/link'

/**
 * Not Found Page
 *
 * Displayed when a user navigates to a route that doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to homepage
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          If you believe this is an error, please{' '}
          <a href="mailto:support@portfolioforge.com" className="text-blue-600 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
