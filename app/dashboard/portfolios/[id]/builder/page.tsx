/**
 * Portfolio Builder Page
 * 
 * Server component that loads portfolio and section data
 * and passes it to the client-side BuilderWithSelector component.
 * 
 * Includes:
 * - Template selector sidebar
 * - Section drag-and-drop builder
 * - Live preview toggle
 */

import { notFound } from 'next/navigation'
import { requireUserId } from '@/lib/auth/requireSession'
import { createServerClient } from '@/lib/supabase/server'
import { BuilderWithSelector } from '@/components/portfolio-builder/BuilderWithSelector'
import type { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

export default async function PortfolioBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  // Enforce authentication
  const userId = await requireUserId()
  const { id } = params
  
  const supabase = await createServerClient()
  
  // Fetch portfolio
  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  
  if (portfolioError || !portfolio) {
    notFound()
  }
  
  // Fetch sections ordered by display_order
  const { data: sections, error: sectionsError } = await supabase
    .from('portfolio_sections')
    .select('*')
    .eq('portfolio_id', id)
    .order('display_order', { ascending: true })
  
  if (sectionsError) {
    console.error('Failed to fetch sections:', sectionsError)
  }
  
  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <BuilderWithSelector 
        portfolio={portfolio}
        initialSections={sections || []}
      />
    </div>
  )
}
