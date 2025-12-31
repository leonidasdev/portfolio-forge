import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Portfolio Forge</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Create and manage your professional portfolio
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
