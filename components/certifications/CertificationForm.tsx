/**
 * Certification Form Component
 * 
 * Reusable form for creating and editing certifications.
 * Supports three certification types:
 * - file: Upload PDF or image
 * - external: Link to external provider (Credly, IBM, etc.)
 * - manual: Manual entry without file or link
 * 
 * Uses:
 * - uploadCertificationFile() for file uploads
 * - POST /api/v1/certifications for creation
 * - PATCH /api/v1/certifications/[id] for updates
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserId } from '@/lib/auth/SessionContext'
import { uploadCertificationFile, deleteCertificationFile } from '@/lib/storage/certifications'
import { TagSelector } from '@/components/tags/TagSelector'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Certification = Database['public']['Tables']['certifications']['Row']
type Tag = Database['public']['Tables']['tags']['Row']
type CertificationType = 'pdf' | 'image' | 'external_link' | 'manual'

interface CertificationFormProps {
  mode: 'create' | 'edit'
  initialData?: Certification
}

export function CertificationForm({ mode, initialData }: CertificationFormProps) {
  const router = useRouter()
  const userId = useUserId()
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '')
  const [issuer, setIssuer] = useState(initialData?.issuing_organization || '')
  const [issueDate, setIssueDate] = useState(initialData?.date_issued || '')
  const [expirationDate, setExpirationDate] = useState(initialData?.expiration_date || '')
  const [credentialId, setCredentialId] = useState(initialData?.credential_id || '')
  const [verificationUrl, setVerificationUrl] = useState(initialData?.verification_url || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  const [certificationType, setCertificationType] = useState<CertificationType>(
    initialData?.certification_type || 'manual'
  )
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url || '')
  const [file, setFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  
  // Load existing tags in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      loadCertificationTags(initialData.id)
    }
  }, [mode, initialData?.id])
  
  async function loadCertificationTags(certificationId: string) {
    try {
      const data = await apiClient.get<{ certification: Certification & { tags: Tag[] } }>(
        `/certifications/${certificationId}`
      )
      if (data.certification?.tags) {
        setSelectedTags(data.certification.tags)
      }
    } catch (error) {
      console.error('Failed to load certification tags:', error)
    }
  }

  // Reset file when switching away from file type
  useEffect(() => {
    if (certificationType !== 'pdf' && certificationType !== 'image') {
      setFile(null)
    }
  }, [certificationType])

  // Sync tags with certification
  async function syncTags(certificationId: string) {
    try {
      // Get current tags from database
      const data = await apiClient.get<{ certification: Certification & { tags: Tag[] } }>(
        `/certifications/${certificationId}`
      )
      const currentTags: Tag[] = data.certification?.tags || []
      
      const currentTagIds = new Set(currentTags.map(t => t.id))
      const selectedTagIds = new Set(selectedTags.map(t => t.id))
      
      // Add new tags
      const tagsToAdd = selectedTags.filter(t => !currentTagIds.has(t.id))
      for (const tag of tagsToAdd) {
        await apiClient.post('/certification-tags', {
          certification_id: certificationId,
          tag_id: tag.id,
        })
      }
      
      // Remove unselected tags
      const tagsToRemove = currentTags.filter(t => !selectedTagIds.has(t.id))
      for (const tag of tagsToRemove) {
        await apiClient.delete(`/certification-tags`, {
          body: JSON.stringify({
            certification_id: certificationId,
            tag_id: tag.id,
          }),
        })
      }
    } catch (error) {
      console.error('Failed to sync tags:', error)
      // Don't fail the operation
    }
  }
  
  // Validate form
  function validateForm(): string | null {
    if (!title.trim()) return 'Title is required'
    if (!issuer.trim()) return 'Issuer is required'
    
    if ((certificationType === 'pdf' || certificationType === 'image')) {
      if (mode === 'create' && !file) {
        return 'File is required for file-based certifications'
      }
    }
    
    if (certificationType === 'external_link' && !externalUrl.trim()) {
      return 'External URL is required for external link certifications'
    }
    
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      let filePath: string | null = null
      let fileType: string | null = null
      
      // Step 1: Upload file if needed
      if (file && (certificationType === 'pdf' || certificationType === 'image')) {
        setUploadProgress(0)
        
        try {
          filePath = await uploadCertificationFile(
            userId,
            file,
            mode === 'edit' ? initialData?.id : undefined
          )
          fileType = file.type
          setUploadProgress(100)
        } catch (uploadError) {
          throw new Error(
            uploadError instanceof Error 
              ? uploadError.message 
              : 'Failed to upload file'
          )
        }
      }
      
      // Step 2: Prepare request body
      const body: any = {
        title,
        issuing_organization: issuer,
        certification_type: certificationType,
        date_issued: issueDate || null,
        expiration_date: expirationDate || null,
        credential_id: credentialId || null,
        verification_url: verificationUrl || null,
        description: description || null,
        is_public: isPublic,
      }
      
      // Add type-specific fields
      if (certificationType === 'external_link') {
        body.external_url = externalUrl
      }
      
      if (filePath && fileType) {
        body.file_path = filePath
        body.file_type = fileType
      }
      
      // Step 3: Call API
      const result = mode === 'create'
        ? await apiClient.post<{ certification: Certification }>('/certifications', body)
        : await apiClient.patch<{ certification: Certification }>(
            `/certifications/${initialData!.id}`,
            body
          )
      
      const certificationId = result.certification.id
      
      // Step 4: Sync tags
      await syncTags(certificationId)
      
      // Step 5: Clean up old file if replaced (edit mode only)
      if (mode === 'edit' && filePath && initialData?.file_path && 
          filePath !== initialData.file_path) {
        try {
          await deleteCertificationFile(initialData.file_path)
        } catch (deleteError) {
          console.error('Failed to delete old file:', deleteError)
          // Don't fail the operation
        }
      }
      
      // Step 6: Redirect to certifications list
      router.push('/dashboard/certifications')
      router.refresh()
      
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., AWS Certified Solutions Architect"
        />
      </div>

      {/* Issuer */}
      <div>
        <label htmlFor="issuer" className="block text-sm font-medium text-gray-700">
          Issuing Organization <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="issuer"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Amazon Web Services"
        />
      </div>

      {/* Certification Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certification Type <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="manual"
              checked={certificationType === 'manual'}
              onChange={(e) => setCertificationType(e.target.value as CertificationType)}
              className="mr-2"
              disabled={mode === 'edit'} // Can't change type in edit mode
            />
            <span>Manual Entry (no file or link)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="pdf"
              checked={certificationType === 'pdf'}
              onChange={(e) => setCertificationType(e.target.value as CertificationType)}
              className="mr-2"
              disabled={mode === 'edit'}
            />
            <span>Upload PDF</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="image"
              checked={certificationType === 'image'}
              onChange={(e) => setCertificationType(e.target.value as CertificationType)}
              className="mr-2"
              disabled={mode === 'edit'}
            />
            <span>Upload Image</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="external_link"
              checked={certificationType === 'external_link'}
              onChange={(e) => setCertificationType(e.target.value as CertificationType)}
              className="mr-2"
              disabled={mode === 'edit'}
            />
            <span>External Link (Credly, IBM, etc.)</span>
          </label>
        </div>
        {mode === 'edit' && (
          <p className="mt-1 text-xs text-gray-500">
            Type cannot be changed after creation
          </p>
        )}
      </div>

      {/* File Upload (if type = pdf or image) */}
      {(certificationType === 'pdf' || certificationType === 'image') && (
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            {mode === 'create' ? 'Upload File' : 'Replace File (optional)'}
            {mode === 'create' && <span className="text-red-500"> *</span>}
          </label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept={certificationType === 'pdf' ? '.pdf' : 'image/*'}
            required={mode === 'create'}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            Max size: 10MB. {certificationType === 'pdf' ? 'PDF only' : 'JPEG, PNG, WebP'}
          </p>
          {mode === 'edit' && initialData?.file_path && !file && (
            <p className="mt-1 text-xs text-green-600">
              Current file: {initialData.file_path.split('/').pop()}
            </p>
          )}
        </div>
      )}

      {/* External URL (if type = external_link) */}
      {certificationType === 'external_link' && (
        <div>
          <label htmlFor="externalUrl" className="block text-sm font-medium text-gray-700">
            External URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="externalUrl"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://www.credly.com/badges/..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Link to Credly, IBM Digital Badge, or other external provider
          </p>
        </div>
      )}

      {/* Issue Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            Issue Date
          </label>
          <input
            type="date"
            id="issueDate"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Expiration Date */}
        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
            Expiration Date
          </label>
          <input
            type="date"
            id="expirationDate"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Credential ID */}
      <div>
        <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700">
          Credential ID
        </label>
        <input
          type="text"
          id="credentialId"
          value={credentialId}
          onChange={(e) => setCredentialId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., ABC-123-XYZ"
        />
      </div>

      {/* Verification URL */}
      <div>
        <label htmlFor="verificationUrl" className="block text-sm font-medium text-gray-700">
          Verification URL
        </label>
        <input
          type="url"
          id="verificationUrl"
          value={verificationUrl}
          onChange={(e) => setVerificationUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://verify.example.com/..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Link where others can verify this certification
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Additional details about this certification..."
        />
      </div>

      {/* Public Toggle */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">
            Make this certification public
          </span>
        </label>
        <p className="mt-1 ml-6 text-xs text-gray-500">
          Public certifications can be included in public portfolios
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <TagSelector 
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600 text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </span>
          ) : (
            mode === 'create' ? 'Create Certification' : 'Save Changes'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
