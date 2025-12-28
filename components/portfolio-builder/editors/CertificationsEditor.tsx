/**
 * Certifications Section Editor
 * 
 * Read-only editor showing info about auto-populated certifications.
 */

'use client'

export function CertificationsEditor() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm">
        Certification sections are auto-populated from your certifications.
        You can suggest tags to understand what topics this section covers, but tags must be added to individual certifications on the Certifications page.
      </div>
      <p className="text-sm text-gray-600">
        To manage certifications and their tags, go to the Certifications page in your dashboard.
      </p>
    </div>
  )
}
