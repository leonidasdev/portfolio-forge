/**
 * Edit Certification Page
 * 
 * Allows authenticated users to edit an existing certification.
 * 
 * Flow:
 * 1. Load certification data from database
 * 2. User edits form
 * 3. File uploaded (if replaced)
 * 4. Old file deleted (if replaced)
 * 5. PATCH /api/v1/certifications/[id]
 * 6. Redirect to certifications list
 */

import { notFound } from 'next/navigation'
import { requireUserId } from '@/lib/auth/requireSession'
import { createServerClient } from '@/lib/supabase/server'
import { CertificationForm } from '@/components/certifications/CertificationForm'

export default async function EditCertificationPage({
  params,
}: {
  params: { id: string }
}) {
  // Enforce authentication and get user ID
  const userId = await requireUserId()
  const { id } = params

  // Fetch certification data
  const supabase = await createServerClient()
  
  const { data: certification, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId) // Ensure user owns this certification
    .eq('is_deleted', false)
    .single()

  // Handle not found or no permission
  if (error || !certification) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Certification
        </h1>
        <p className="mt-2 text-gray-600">
          Update your certification details.
        </p>
      </div>

      <CertificationForm 
        mode="edit" 
        initialData={certification}
      />
    </div>
  )
}
