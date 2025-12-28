/**
 * Certifications Dashboard Page
 * 
 * Server component that fetches all certifications for the authenticated user
 * and passes them to the client component for rendering and interactions.
 * 
 * Data fetching happens on the server for optimal performance and SEO.
 */

import { requireUserId } from '@/lib/auth/requireSession'
import { createServerClient } from '@/lib/supabase/server'
import { CertificationList } from '@/components/certifications/CertificationList'
import type { Database } from '@/lib/supabase/types'

type Certification = Database['public']['Tables']['certifications']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

// Extended type with tags for client component
export type CertificationWithTags = Certification & {
  tags: Tag[]
}

export default async function CertificationsPage() {
  // Enforce authentication and get user ID
  const userId = await requireUserId()

  // Fetch certifications with tags
  const supabase = await createServerClient()
  
  const { data: certifications, error } = await supabase
    .from('certifications')
    .select(`
      *,
      certification_tags!inner(
        tags(*)
      )
    `)
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  // Handle errors gracefully
  if (error) {
    console.error('Failed to fetch certifications:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Failed to load certifications. Please try again later.
        </div>
      </div>
    )
  }

  // Transform data to include tags array
  const certificationsWithTags: CertificationWithTags[] = (certifications || []).map((cert: any) => ({
    ...cert,
    tags: cert.certification_tags?.map((ct: any) => ct.tags).filter(Boolean) || []
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Certifications
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your professional certifications and credentials.
        </p>
      </div>

      <CertificationList certifications={certificationsWithTags} />
    </div>
  )
}
