/**
 * Certification Form Component (Refactored)
 *
 * Reusable form for creating and editing certifications.
 * Uses modular form components for better maintainability.
 *
 * Supports three certification types:
 * - file: Upload PDF or image
 * - external: Link to external provider (Credly, IBM, etc.)
 * - manual: Manual entry without file or link
 */

'use client'

import { TagSelector } from '@/components/tags/TagSelector'
import { apiClient } from '@/lib/api/client'
import { useUserId } from '@/lib/auth/SessionContext'
import { deleteCertificationFile, uploadCertificationFile } from '@/lib/storage/certifications'
import type { Database } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// Form components
import {
  CertificationTypeSelector,
  Checkbox,
  DateInput,
  FileUpload,
  FormActions,
  FormField,
  TextArea,
  TextInput,
  type CertificationType,
} from './form'

type Certification = Database['public']['Tables']['certifications']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

interface CertificationFormProps {
  mode: 'create' | 'edit'
  initialData?: Certification
}

/**
 * Hook for managing certification form state
 */
function useCertificationFormState(initialData?: Certification) {
  // Form fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [issuer, setIssuer] = useState(initialData?.issuing_organization || '')
  const [issueDate, setIssueDate] = useState(initialData?.date_issued || '')
  const [expirationDate, setExpirationDate] = useState(initialData?.expiration_date || '')
  const [credentialId, setCredentialId] = useState(initialData?.credential_id || '')
  const [verificationUrl, setVerificationUrl] = useState(initialData?.verification_url || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? true)
  const [certificationType, setCertificationType] = useState<CertificationType>(
    (initialData?.certification_type as CertificationType) || 'manual'
  )
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url || '')
  const [file, setFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])

  // Reset file when switching away from file type
  useEffect(() => {
    if (certificationType !== 'pdf' && certificationType !== 'image') {
      setFile(null)
    }
  }, [certificationType])

  return {
    title,
    setTitle,
    issuer,
    setIssuer,
    issueDate,
    setIssueDate,
    expirationDate,
    setExpirationDate,
    credentialId,
    setCredentialId,
    verificationUrl,
    setVerificationUrl,
    description,
    setDescription,
    isPublic,
    setIsPublic,
    certificationType,
    setCertificationType,
    externalUrl,
    setExternalUrl,
    file,
    setFile,
    selectedTags,
    setSelectedTags,
  }
}

/**
 * Validate certification form data
 */
function validateForm(
  title: string,
  issuer: string,
  certificationType: CertificationType,
  externalUrl: string,
  file: File | null,
  mode: 'create' | 'edit'
): string | null {
  if (!title.trim()) return 'Title is required'
  if (!issuer.trim()) return 'Issuer is required'

  if (certificationType === 'pdf' || certificationType === 'image') {
    if (mode === 'create' && !file) {
      return 'File is required for file-based certifications'
    }
  }

  if (certificationType === 'external_link' && !externalUrl.trim()) {
    return 'External URL is required for external link certifications'
  }

  return null
}

export function CertificationForm({ mode, initialData }: CertificationFormProps) {
  const router = useRouter()
  const userId = useUserId()

  // Form state
  const formState = useCertificationFormState(initialData)

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // Load existing tags in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      loadCertificationTags(initialData.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id])

  async function loadCertificationTags(certificationId: string) {
    try {
      const data = await apiClient.get<{ certification: Certification & { tags: Tag[] } }>(
        `/certifications/${certificationId}`
      )
      if (data.certification?.tags) {
        formState.setSelectedTags(data.certification.tags)
      }
    } catch (err) {
      console.error('Failed to load certification tags:', err)
    }
  }

  // Sync tags with certification
  const syncTags = useCallback(
    async (certificationId: string) => {
      try {
        const data = await apiClient.get<{ certification: Certification & { tags: Tag[] } }>(
          `/certifications/${certificationId}`
        )
        const currentTags: Tag[] = data.certification?.tags || []

        const currentTagIds = new Set(currentTags.map((t) => t.id))
        const selectedTagIds = new Set(formState.selectedTags.map((t) => t.id))

        // Add new tags
        const tagsToAdd = formState.selectedTags.filter((t) => !currentTagIds.has(t.id))
        for (const tag of tagsToAdd) {
          await apiClient.post('/certification-tags', {
            certification_id: certificationId,
            tag_id: tag.id,
          })
        }

        // Remove unselected tags
        const tagsToRemove = currentTags.filter((t) => !selectedTagIds.has(t.id))
        for (const tag of tagsToRemove) {
          await apiClient.delete('/certification-tags', {
            body: JSON.stringify({
              certification_id: certificationId,
              tag_id: tag.id,
            }),
          })
        }
      } catch (err) {
        console.error('Failed to sync tags:', err)
      }
    },
    [formState.selectedTags]
  )

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate
    const validationError = validateForm(
      formState.title,
      formState.issuer,
      formState.certificationType,
      formState.externalUrl,
      formState.file,
      mode
    )
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      let filePath: string | null = null
      let fileType: string | null = null

      // Step 1: Upload file if needed
      if (
        formState.file &&
        (formState.certificationType === 'pdf' || formState.certificationType === 'image')
      ) {
        setUploadProgress(0)
        try {
          filePath = await uploadCertificationFile(
            userId,
            formState.file,
            mode === 'edit' ? initialData?.id : undefined
          )
          fileType = formState.file.type
          setUploadProgress(100)
        } catch (uploadError) {
          throw new Error(
            uploadError instanceof Error ? uploadError.message : 'Failed to upload file'
          )
        }
      }

      // Step 2: Prepare request body
      const body: Record<string, unknown> = {
        title: formState.title,
        issuing_organization: formState.issuer,
        certification_type: formState.certificationType,
        date_issued: formState.issueDate || null,
        expiration_date: formState.expirationDate || null,
        credential_id: formState.credentialId || null,
        verification_url: formState.verificationUrl || null,
        description: formState.description || null,
        is_public: formState.isPublic,
      }

      if (formState.certificationType === 'external_link') {
        body.external_url = formState.externalUrl
      }

      if (filePath && fileType) {
        body.file_path = filePath
        body.file_type = fileType
      }

      // Step 3: Call API
      const result =
        mode === 'create'
          ? await apiClient.post<{ certification: Certification }>('/certifications', body)
          : await apiClient.patch<{ certification: Certification }>(
              `/certifications/${initialData!.id}`,
              body
            )

      const certificationId = result.certification.id

      // Step 4: Sync tags
      await syncTags(certificationId)

      // Step 5: Clean up old file if replaced
      if (
        mode === 'edit' &&
        filePath &&
        initialData?.file_path &&
        filePath !== initialData.file_path
      ) {
        try {
          await deleteCertificationFile(initialData.file_path)
        } catch (deleteError) {
          console.error('Failed to delete old file:', deleteError)
        }
      }

      // Step 6: Redirect
      router.push('/dashboard/certifications')
      router.refresh()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  const isFileType =
    formState.certificationType === 'pdf' || formState.certificationType === 'image'
  const isExternalLink = formState.certificationType === 'external_link'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <FormField label="Title" htmlFor="title" required>
        <TextInput
          id="title"
          value={formState.title}
          onChange={formState.setTitle}
          placeholder="e.g., AWS Certified Solutions Architect"
          required
        />
      </FormField>

      {/* Issuer */}
      <FormField label="Issuing Organization" htmlFor="issuer" required>
        <TextInput
          id="issuer"
          value={formState.issuer}
          onChange={formState.setIssuer}
          placeholder="e.g., Amazon Web Services"
          required
        />
      </FormField>

      {/* Certification Type */}
      <CertificationTypeSelector
        value={formState.certificationType}
        onChange={formState.setCertificationType}
        disabled={mode === 'edit'}
      />

      {/* File Upload */}
      {isFileType && (
        <FileUpload
          id="file"
          file={formState.file}
          onChange={formState.setFile}
          accept={formState.certificationType === 'pdf' ? '.pdf' : 'image/*'}
          required={mode === 'create'}
          currentFilePath={initialData?.file_path || undefined}
          uploadProgress={uploadProgress}
          mode={mode}
        />
      )}

      {/* External URL */}
      {isExternalLink && (
        <FormField
          label="External URL"
          htmlFor="externalUrl"
          required
          hint="Link to Credly, IBM Digital Badge, or other external provider"
        >
          <TextInput
            id="externalUrl"
            type="url"
            value={formState.externalUrl}
            onChange={formState.setExternalUrl}
            placeholder="https://www.credly.com/badges/..."
            required
          />
        </FormField>
      )}

      {/* Date Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Issue Date" htmlFor="issueDate">
          <DateInput id="issueDate" value={formState.issueDate} onChange={formState.setIssueDate} />
        </FormField>
        <FormField label="Expiration Date" htmlFor="expirationDate">
          <DateInput
            id="expirationDate"
            value={formState.expirationDate}
            onChange={formState.setExpirationDate}
          />
        </FormField>
      </div>

      {/* Credential ID */}
      <FormField label="Credential ID" htmlFor="credentialId">
        <TextInput
          id="credentialId"
          value={formState.credentialId}
          onChange={formState.setCredentialId}
          placeholder="e.g., ABC-123-XYZ"
        />
      </FormField>

      {/* Verification URL */}
      <FormField
        label="Verification URL"
        htmlFor="verificationUrl"
        hint="Link where others can verify this certification"
      >
        <TextInput
          id="verificationUrl"
          type="url"
          value={formState.verificationUrl}
          onChange={formState.setVerificationUrl}
          placeholder="https://verify.example.com/..."
        />
      </FormField>

      {/* Description */}
      <FormField label="Description" htmlFor="description">
        <TextArea
          id="description"
          value={formState.description}
          onChange={formState.setDescription}
          placeholder="Additional details about this certification..."
          rows={3}
        />
      </FormField>

      {/* Public Toggle */}
      <Checkbox
        id="isPublic"
        checked={formState.isPublic}
        onChange={formState.setIsPublic}
        label="Make this certification public"
        hint="Public certifications can be included in public portfolios"
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <TagSelector selectedTags={formState.selectedTags} onChange={formState.setSelectedTags} />
      </div>

      {/* Submit Buttons */}
      <FormActions isSubmitting={isSubmitting} mode={mode} onCancel={() => router.back()} />
    </form>
  )
}
