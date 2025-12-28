/**
 * Dashboard Overview Page - Example of using session from layout
 * 
 * This page demonstrates:
 * - Reading session from layout via useSession() hook (client component)
 * - Reading session directly via requireUserId() (server component)
 * - Accessing authenticated user ID
 * - Fetching user-specific data
 * 
 * Two patterns shown:
 * 1. Client Component with useSession() - For interactive UI
 * 2. Server Component with requireUserId() - For data fetching
 */

import { requireUserId } from '@/lib/auth/requireSession'
import { createServerClient } from '@/lib/supabase/server'
import { WelcomeMessage } from './WelcomeMessage'

export default async function DashboardOverviewPage() {
  // PATTERN 1: Server Component - Direct session access
  // Use requireUserId() to get user ID and fetch data
  const userId = await requireUserId()
  const supabase = await createServerClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // Fetch quick stats
  const [
    { count: portfolioCount },
    { count: certificationCount },
    { count: projectCount },
    { count: skillCount },
  ] = await Promise.all([
    supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false),
    
    supabase
      .from('certifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false),
    
    supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false),
    
    supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false),
  ])

  // Fetch recent activity (last 5 items)
  const { data: recentPortfolios } = await supabase
    .from('portfolios')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with welcome message - Client Component using useSession() */}
      <WelcomeMessage userName={profile?.full_name} />

      {/* Quick Stats Grid */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Portfolios"
          count={portfolioCount ?? 0}
          color="blue"
          description="Active portfolios"
        />
        <StatCard
          title="Certifications"
          count={certificationCount ?? 0}
          color="green"
          description="Verified credentials"
        />
        <StatCard
          title="Projects"
          count={projectCount ?? 0}
          color="purple"
          description="Showcased projects"
        />
        <StatCard
          title="Skills"
          count={skillCount ?? 0}
          color="orange"
          description="Technical skills"
        />
      </section>

      {/* Recent Activity */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        {recentPortfolios && recentPortfolios.length > 0 ? (
          <div className="bg-white rounded-lg shadow divide-y">
            {recentPortfolios.map((portfolio) => (
              <div key={portfolio.id} className="p-4 hover:bg-gray-50">
                <h3 className="font-semibold">{portfolio.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No recent activity. Create your first portfolio to get started!
          </div>
        )}
      </section>

      {/* User ID Display (for debugging) */}
      <section className="mt-8 bg-gray-100 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Authenticated User ID:
        </h3>
        <code className="text-xs text-gray-600 font-mono">{userId}</code>
      </section>
    </div>
  )
}

/**
 * Stat Card Component - Displays a statistic with color coding
 */
function StatCard({
  title,
  count,
  color,
  description,
}: {
  title: string
  count: number
  color: 'blue' | 'green' | 'purple' | 'orange'
  description: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6 shadow`}>
      <div className="text-3xl font-bold">{count}</div>
      <div className="text-sm font-medium mt-2">{title}</div>
      <div className="text-xs opacity-75 mt-1">{description}</div>
    </div>
  )
}
