/**
 * Certification Upload Component
 * 
 * Example of using the Supabase client for file uploads
 * Demonstrates:
 * - File upload to Supabase Storage
 * - Progress tracking
 * - Error handling
 * - Creating a database record after upload
 */

'use client'

import { useState } from 'react'
import { createBrowserClient, storage } from '@/lib/supabase/client'

interface UploadResult {
  certificationId: string
  filePath: string
}

export default function CertificationUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<UploadResult | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF or image (JPEG, PNG)')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    try {
      const supabase = createBrowserClient()

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('You must be logged in to upload files')
      }

      setProgress(25)

      // Upload file to storage
      const uploadResult = await storage.uploadCertification(
        user.id,
        file,
        file.name
      )

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message)
      }

      setProgress(50)

      // Create certification record in database
      const certificationType = file.type === 'application/pdf' ? 'pdf' : 'image'
      
      const { data: certification, error: dbError } = await supabase
        .from('certifications')
        .insert({
          user_id: user.id,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          issuing_organization: 'Unknown', // User can update this later
          certification_type: certificationType,
          file_path: uploadResult.path,
          file_type: uploadResult.fileType,
          is_public: false,
        })
        .select()
        .single()

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await storage.deleteCertification(uploadResult.path!)
        throw new Error(dbError.message)
      }

      setProgress(100)
      setSuccess({
        certificationId: certification.id,
        filePath: uploadResult.path!,
      })

      // Reset form
      event.target.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Certification</h2>
      
      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select PDF or Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          PDF, JPEG, or PNG. Max 10MB.
        </p>
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm font-medium text-blue-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800 font-semibold">
            Upload successful!
          </p>
          <p className="text-xs text-green-700 mt-1">
            Certification ID: {success.certificationId}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p className="font-semibold mb-1">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF documents</li>
          <li>JPEG/JPG images</li>
          <li>PNG images</li>
        </ul>
      </div>
    </div>
  )
}
