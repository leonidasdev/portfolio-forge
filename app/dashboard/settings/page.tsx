/**
 * Settings Page - Example of using session utilities
 * 
 * This page demonstrates different ways to handle authentication
 * in Server Components using the reusable session helpers.
 * 
 * Three patterns shown:
 * 1. getAuthSession() - Manual check with custom handling
 * 2. requireSession() - Automatic redirect if not authenticated
 * 3. requireUserId() - Quick access to just the user ID
 */

import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth/getSession'
import { requireSession, requireUser, requireUserId } from '@/lib/auth/requireSession'
import { createServerClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/app/(auth)/logout/LogoutButton'

export default async function SettingsPage() {
  // PATTERN 1: Manual session check with getAuthSession()
  // Use this when you want custom handling for unauthenticated users
  const session = await getAuthSession()
  
  if (!session) {
    // Custom redirect logic - could show error, log analytics, etc.
    redirect('/login?redirectTo=/dashboard/settings')
  }

  // PATTERN 2: Automatic authentication with requireSession()
  // This is cleaner for most cases - automatically redirects if not authenticated
  // Uncomment to use instead of Pattern 1:
  // const session = await requireSession('/dashboard/settings')

  // PATTERN 3: Get just the user ID (most concise)
  // Use when you only need the user ID and want auto-redirect
  const userId = await requireUserId()

  // PATTERN 4: Get just the user object
  // const user = await requireUser()

  // Now fetch user-specific data
  const supabase = await createServerClient()

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Fetch user statistics
  const { count: portfolioCount } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)

  const { count: certificationCount } = await supabase
    .from('certifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>
        <LogoutButton />
      </div>

      {/* User Information */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
        
        {profileError && (
          <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
            Error loading profile: {profileError.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <p className="mt-1 text-sm text-gray-900 font-mono">{userId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.full_name || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Headline</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.headline || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.location || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
              {profile?.bio || 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Unknown'}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">
              {portfolioCount ?? 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Portfolios</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">
              {certificationCount ?? 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Certifications</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-600">
              {projectCount ?? 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Projects</div>
          </div>
        </div>
      </section>

      {/* Session Information (for debugging) */}
      <section className="bg-gray-50 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Session Information</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Session ID:</span>
            <span className="font-mono text-gray-600">{session.access_token.substring(0, 20)}...</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Issued At:</span>
            <span className="text-gray-600">
              {new Date(session.user.created_at).toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Expires At:</span>
            <span className="text-gray-600">
              {new Date(session.expires_at! * 1000).toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-medium">Provider:</span>
            <span className="text-gray-600 capitalize">
              {session.user.app_metadata.provider || 'unknown'}
            </span>
          </div>
        </div>
      </section>

      {/* Edit Profile Link (placeholder) */}
      <div className="mt-8 text-center">
        <button 
          disabled
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Edit Profile (Coming Soon)
        </button>
      </div>
    </div>
  )
}
