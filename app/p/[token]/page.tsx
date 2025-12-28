/**
 * Public Portfolio Renderer
 * 
 * Server component that renders a portfolio via its public link token.
 * Integrates with the modular section components from Subtask 5.4.
 * 
 * URL Pattern: /p/[token]
 * Example: /p/abc123xyz456
 * 
 * Flow:
 * 1. Validate token and fetch portfolio (using public_link_token field)
 * 2. Check if portfolio is public (is_public = true)
 * 3. Fetch all sections ordered by display_order
 * 4. Apply visibility rules (hide private items)
 * 5. Render sections using SectionRenderer (mode="view")
 * 
 * Visibility Rules:
 * - Portfolio must be public (is_public = true)
 * - Private certifications are excluded from certification sections
 * - Sections with no visible content are hidden
 */

import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { PortfolioRenderer } from '@/components/portfolio-renderer/PortfolioRenderer'
import type { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']
type Certification = Database['public']['Tables']['certifications']['Row']


export default async function PublicPortfolioPage({
  params,
}: {
  params: { token: string }
}) {
  const { token } = params
  const supabase = await createServerClient()
  
  // Step 1: Validate token and fetch portfolio using public_link_token
  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('public_link_token', token)
    .eq('is_deleted', false)
    .single()
  
  if (portfolioError || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portfolio Not Found
          </h1>
          <p className="text-gray-600">
            This portfolio link is invalid or has been removed.
          </p>
        </div>
      </div>
    )
  }
  
  // Step 2: Check if portfolio is public
  if (!portfolio.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Private Portfolio
          </h1>
          <p className="text-gray-600">
            This portfolio is not publicly accessible.
          </p>
        </div>
      </div>
    )
  }
  
  // Step 3: Fetch all sections ordered by display_order
  const { data: sections, error: sectionsError } = await supabase
    .from('portfolio_sections')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .order('display_order', { ascending: true })
  
  if (sectionsError) {
    console.error('Failed to fetch portfolio sections:', sectionsError)
  }
  
  // Step 4: Apply visibility rules to sections
  const visibleSections = await filterVisibleSections(
    sections || [],
    portfolio.user_id,
    supabase
  )
  
  // Step 5: Render the portfolio using PortfolioRenderer
  // PortfolioRenderer handles:
  // - Template selection (from portfolio.template)
  // - Theme application (from portfolio.theme)
  // - Section rendering with proper styling
  return (
    <div>
      {visibleSections.length === 0 ? (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {portfolio.title}
            </h1>
            <p style={{ color: '#6b7280' }}>
              This portfolio has no visible content yet.
            </p>
          </div>
        </div>
      ) : (
        <PortfolioRenderer portfolio={portfolio} sections={visibleSections} />
      )}
    </div>
  )
}

/**
 * Filter sections based on visibility rules
 * 
 * Rules:
 * - Certification sections: exclude private certifications
 * - If a section has no visible content, exclude it entirely
 * - Future: add filtering for projects, skills, work experience
 */
async function filterVisibleSections(
  sections: Section[],
  userId: string,
  supabase: any
): Promise<Section[]> {
  const visibleSections: Section[] = []
  
  for (const section of sections) {
    // Apply visibility rules based on section type
    if (section.section_type === 'certifications') {
      // Filter out private certifications
      const filteredSection = await filterCertificationSection(section, userId, supabase)
      if (filteredSection) {
        visibleSections.push(filteredSection)
      }
    } else if (section.section_type === 'summary' || section.section_type === 'custom') {
      // Summary and custom sections are always visible if they have content
      const content = section.content as { text?: string } | null
      if (content?.text && content.text.trim().length > 0) {
        visibleSections.push(section)
      }
    } else if (section.section_type === 'skills') {
      // Skills section visible if it has skills
      const content = section.content as { skills?: string[] } | null
      if (content?.skills && content.skills.length > 0) {
        visibleSections.push(section)
      }
    } else if (section.section_type === 'work_experience' || section.section_type === 'projects') {
      // Experience/projects sections visible if they have content
      const content = section.content as { description?: string } | null
      if (content?.description && content.description.trim().length > 0) {
        visibleSections.push(section)
      }
    } else {
      // Unknown section types: include as-is
      visibleSections.push(section)
    }
  }
  
  return visibleSections
}

/**
 * Filter certification section to exclude private certifications
 * Returns null if no certifications are visible
 * 
 * Implementation:
 * 1. Extract certification IDs from section content
 * 2. Fetch all referenced certifications
 * 3. Filter for public ones only (is_public = true)
 * 4. Return updated section with filtered IDs, or null if none are public
 */
async function filterCertificationSection(
  section: Section,
  userId: string,
  supabase: any
): Promise<Section | null> {
  const content = section.content as { certificationIds?: string[] } | null
  const certificationIds = content?.certificationIds || []
  
  if (certificationIds.length === 0) {
    // No certifications referenced, hide section
    return null
  }
  
  // Fetch certifications and filter for public ones
  const { data: certifications } = await supabase
    .from('certifications')
    .select('id, is_public')
    .eq('user_id', userId)
    .in('id', certificationIds)
    .eq('is_deleted', false)
  
  if (!certifications || certifications.length === 0) {
    return null
  }
  
  // Filter to only public certifications
  const publicCertificationIds = certifications
    .filter((cert: Certification) => cert.is_public)
    .map((cert: Certification) => cert.id)
  
  if (publicCertificationIds.length === 0) {
    // No public certifications, hide section
    return null
  }
  
  // Return section with filtered certification IDs
  return {
    ...section,
    content: {
      ...content,
      certificationIds: publicCertificationIds,
    },
  }
}

/**
 * Generate metadata for SEO
 * 
 * Fetches portfolio title and description for page metadata
 */
export async function generateMetadata({ params }: { params: { token: string } }) {
  const supabase = await createServerClient()
  
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('title, description')
    .eq('public_link_token', params.token)
    .eq('is_public', true)
    .eq('is_deleted', false)
    .single()

  return {
    title: portfolio?.title || 'Portfolio Not Found',
    description: portfolio?.description || 'View this portfolio on Portfolio Forge',
  }
}

