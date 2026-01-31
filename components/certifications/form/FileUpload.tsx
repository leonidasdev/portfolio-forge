/**
 * File Upload Component
 *
 * Handles file selection and displays upload progress.
 * Supports PDF and image files for certifications.
 */

'use client'

interface FileUploadProps {
  id: string
  file: File | null
  onChange: (file: File | null) => void
  accept: string
  required?: boolean
  currentFilePath?: string
  uploadProgress: number | null
  mode: 'create' | 'edit'
}

/**
 * File upload input with progress indicator
 */
export function FileUpload({
  id,
  file,
  onChange,
  accept,
  required,
  currentFilePath,
  uploadProgress,
  mode,
}: FileUploadProps) {
  const isUploading = uploadProgress !== null && uploadProgress < 100

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {mode === 'create' ? 'Upload File' : 'Replace File (optional)'}
        {mode === 'create' && required && <span className="text-red-500"> *</span>}
      </label>

      <input
        type="file"
        id={id}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        accept={accept}
        required={mode === 'create' && required}
        disabled={isUploading}
        className="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50"
      />

      <p className="mt-1 text-xs text-gray-500">
        Max size: 10MB. {accept === '.pdf' ? 'PDF only' : 'JPEG, PNG, WebP'}
      </p>

      {/* Current file indicator (edit mode) */}
      {mode === 'edit' && currentFilePath && !file && (
        <p className="mt-1 text-xs text-green-600">
          Current file: {currentFilePath.split('/').pop()}
        </p>
      )}

      {/* Selected file indicator */}
      {file && (
        <p className="mt-1 text-xs text-blue-600">
          Selected: {file.name} ({formatFileSize(file.size)})
        </p>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600 text-center">
            {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Upload complete!'}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Format file size to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
