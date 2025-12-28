/**
 * Portfolio List Component
 * 
 * Example of using the Supabase client for client-side queries
 * Demonstrates:
 * - Fetching data with RLS
 * - Real-time subscriptions
 * - Loading states
 * - Error handling
 * - Client-side mutations
 */

'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient, realtime } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']

export default function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Fetch portfolios on mount
  useEffect(() => {
    fetchPortfolios()
    
    // Subscribe to real-time changes
    const unsubscribe = subscribeToChanges()
    
    return () => {
      unsubscribe()
    }
  }, [])

  const fetchPortfolios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supabase = createBrowserClient()
      
      // RLS ensures we only get the user's portfolios
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select(`
          id,
          title,
          slug,
          description,
          theme,
          is_public,
          is_deleted,
          created_at,
          updated_at
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
      
      if (fetchError) {
        throw new Error(fetchError.message)
      }
      
      setPortfolios(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToChanges = () => {
    const supabase = createBrowserClient()
    
    // Subscribe to portfolio changes
    const subscription = supabase
      .channel('portfolios-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
        },
        (payload) => {
          console.log('Portfolio change detected:', payload)
          
          if (payload.eventType === 'INSERT') {
            setPortfolios((prev) => [payload.new as Portfolio, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setPortfolios((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Portfolio) : p
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setPortfolios((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(subscription)
    }
  }

  const createPortfolio = async () => {
    try {
      setCreating(true)
      setError(null)
      
      const supabase = createBrowserClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('You must be logged in')
      }
      
      // Generate unique slug
      const timestamp = Date.now()
      const slug = `portfolio-${timestamp}`
      
      const { data, error: insertError } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          title: `New Portfolio ${timestamp}`,
          slug,
          description: 'A new portfolio',
          theme: 'default',
          is_public: false,
        })
        .select()
        .single()
      
      if (insertError) {
        throw new Error(insertError.message)
      }
      
      // Portfolio will be added via real-time subscription
      console.log('Created portfolio:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio')
    } finally {
      setCreating(false)
    }
  }

  const togglePublic = async (portfolioId: string, currentState: boolean) => {
    try {
      const supabase = createBrowserClient()
      
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({ is_public: !currentState })
        .eq('id', portfolioId)
      
      if (updateError) {
        throw new Error(updateError.message)
      }
      
      // Update will be reflected via real-time subscription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio')
    }
  }

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return
    }
    
    try {
      const supabase = createBrowserClient()
      
      // Soft delete
      const { error: deleteError } = await supabase
        .from('portfolios')
        .update({ is_deleted: true })
        .eq('id', portfolioId)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }
      
      // Remove from local state immediately
      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Portfolios</h1>
        <button
          onClick={createPortfolio}
          disabled={creating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? 'Creating...' : 'Create Portfolio'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {portfolios.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No portfolios yet</p>
          <button
            onClick={createPortfolio}
            disabled={creating}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Portfolio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {portfolio.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    /{portfolio.slug}
                  </p>
                  {portfolio.description && (
                    <p className="text-gray-700 mt-2">{portfolio.description}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        portfolio.is_public
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {portfolio.is_public ? 'Public' : 'Private'}
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {portfolio.theme}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => togglePublic(portfolio.id, portfolio.is_public)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {portfolio.is_public ? 'Make Private' : 'Make Public'}
                  </button>
                  <button
                    onClick={() => deletePortfolio(portfolio.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-4">
                Created {new Date(portfolio.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
