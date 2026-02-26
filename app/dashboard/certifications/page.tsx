/**
 * Certifications Dashboard Page
 *
 * Server component that fetches all certifications for the authenticated user
 * and passes them to the client component for rendering and interactions.
 *
 * Data fetching happens on the server for optimal performance and SEO.
 */

import { CertificationList } from '@/components/certifications/CertificationList'
import { requireUserId } from '@/lib/auth/requireSession'
import { queries, type Tag } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/server'

// Extended type with tags for client component
export type CertificationWithTags = Awaited<
  ReturnType<typeof queries.certifications.listWithTags>
>['data'] extends (infer T)[] | null
  ? T & { tags: Tag[] }
  : never

export default async function CertificationsPage() {
  // Enforce authentication and get user ID
  await requireUserId()

  // Fetch certifications with tags using typed query helpers
  const supabase = await createServerClient()
  const { data: certifications, error } = await queries.certifications.listWithTags(supabase)

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
  const certificationsWithTags = (certifications || []).map((cert) => ({
    ...cert,
    tags:
      cert.certification_tags?.map((ct) => ct.tags).filter((tag): tag is Tag => tag !== null) || [],
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
        <p className="mt-2 text-gray-600">
          Manage your professional certifications and credentials.
        </p>
      </div>

      <CertificationList certifications={certificationsWithTags} />
    </div>
  )
}
