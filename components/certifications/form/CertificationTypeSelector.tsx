/**
 * Certification Type Selector
 *
 * Radio button group for selecting certification type.
 * Supports pdf, image, external_link, and manual types.
 */

'use client'

export type CertificationType = 'pdf' | 'image' | 'external_link' | 'manual'

interface CertificationTypeSelectorProps {
  value: CertificationType
  onChange: (type: CertificationType) => void
  disabled?: boolean
}

const CERTIFICATION_TYPES: Array<{
  value: CertificationType
  label: string
  description?: string
}> = [
  {
    value: 'manual',
    label: 'Manual Entry',
    description: 'No file or link required',
  },
  {
    value: 'pdf',
    label: 'Upload PDF',
    description: 'Upload a PDF certificate',
  },
  {
    value: 'image',
    label: 'Upload Image',
    description: 'Upload an image certificate',
  },
  {
    value: 'external_link',
    label: 'External Link',
    description: 'Credly, IBM Digital Badge, etc.',
  },
]

export function CertificationTypeSelector({
  value,
  onChange,
  disabled,
}: CertificationTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Certification Type <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {CERTIFICATION_TYPES.map((type) => (
          <label key={type.value} className="flex items-center">
            <input
              type="radio"
              name="certificationType"
              value={type.value}
              checked={value === type.value}
              onChange={(e) => onChange(e.target.value as CertificationType)}
              disabled={disabled}
              className="mr-2 disabled:opacity-50"
            />
            <span className={disabled ? 'text-gray-400' : ''}>
              {type.label}
              {type.description && (
                <span className="text-gray-500 text-sm ml-1">({type.description})</span>
              )}
            </span>
          </label>
        ))}
      </div>
      {disabled && (
        <p className="mt-1 text-xs text-gray-500">Type cannot be changed after creation</p>
      )}
    </div>
  )
}
