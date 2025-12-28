/**
 * Dashboard Page - Example of using Supabase server client in a Server Component
 * 
 * This page demonstrates:
 * - Reading the authenticated user session
 * - Fetching data with RLS (user only sees their own data)
 * - Redirecting if not authenticated
 * - Using the logout server action
 */

import { redirect } from 'next/navigation'
import { createServerClient, getUser, getSession } from '@/lib/supabase/server'
import { LogoutButton } from '@/app/(auth)/logout/LogoutButton'

export default async function DashboardPage() {
  // Get the current session
  // This contains the authenticated user and tokens
  const session = await getSession()
  
  // Redirect to login if no session exists
  if (!session) {
    redirect('/login')
  }

  // Get the current user (alternative to session.user)
  const user = await getUser()
  
  // Redirect to login if not authenticated (redundant check, but shows pattern)
  if (!user) {
    redirect('/login')
  }
  
  // Create a Supabase client
  const supabase = await createServerClient()
  
  // Fetch user's portfolios (RLS ensures only their portfolios are returned)
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
  
  // Fetch user's certifications
  const { data: certifications, error: certificationsError } = await supabase
    .from('certifications')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(5)
  
  // Fetch user's tags
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {profile?.full_name || user.email}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Session expires: {new Date(session.expires_at! * 1000).toLocaleString()}
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Portfolios Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Portfolios</h2>
        {portfoliosError && (
          <p className="text-red-600">Error loading portfolios: {portfoliosError.message}</p>
        )}
        {portfolios && portfolios.length === 0 && (
          <p className="text-gray-500">No portfolios yet. Create your first one!</p>
        )}
        {portfolios && portfolios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{portfolio.title}</h3>
                <p className="text-sm text-gray-600">{portfolio.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    portfolio.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {portfolio.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Certifications Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Certifications</h2>
        {certificationsError && (
          <p className="text-red-600">Error loading certifications: {certificationsError.message}</p>
        )}
        {certifications && certifications.length === 0 && (
          <p className="text-gray-500">No certifications yet. Add your first one!</p>
        )}
        {certifications && certifications.length > 0 && (
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{cert.title}</h3>
                <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Issued: {cert.date_issued ? new Date(cert.date_issued).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tags Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Tags</h2>
        {tagsError && (
          <p className="text-red-600">Error loading tags: {tagsError.message}</p>
        )}
        {tags && tags.length === 0 && (
          <p className="text-gray-500">No tags yet. Create tags to organize your content!</p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: tag.color || '#e5e7eb',
                  color: '#1f2937'
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
