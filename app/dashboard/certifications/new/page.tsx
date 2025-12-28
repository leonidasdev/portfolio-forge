/**
 * Create Certification Page
 * 
 * Allows authenticated users to create a new certification.
 * 
 * Flow:
 * 1. User fills out form
 * 2. File uploaded (if applicable)
 * 3. POST /api/v1/certifications
 * 4. Redirect to certifications list
 */

import { requireSession } from '@/lib/auth/requireSession'
import { CertificationForm } from '@/components/certifications/CertificationForm'

export default async function NewCertificationPage() {
  // Enforce authentication
  await requireSession()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Add New Certification
        </h1>
        <p className="mt-2 text-gray-600">
          Add a certification to your profile. You can include it in your portfolios later.
        </p>
      </div>

      <CertificationForm mode="create" />
    </div>
  )
}
