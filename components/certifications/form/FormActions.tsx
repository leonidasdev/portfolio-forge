/**
 * Submit Button Component
 *
 * Button with loading spinner for form submission.
 */

'use client'

interface SubmitButtonProps {
  isSubmitting: boolean
  mode: 'create' | 'edit'
}

/**
 * Form submit button with loading state
 */
export function SubmitButton({ isSubmitting, mode }: SubmitButtonProps) {
  const labels = {
    create: { idle: 'Create Certification', loading: 'Creating...' },
    edit: { idle: 'Save Changes', loading: 'Saving...' },
  }

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner />
          {labels[mode].loading}
        </span>
      ) : (
        labels[mode].idle
      )}
    </button>
  )
}

/**
 * Loading spinner SVG
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

interface CancelButtonProps {
  onClick: () => void
  disabled?: boolean
}

/**
 * Cancel button
 */
export function CancelButton({ onClick, disabled }: CancelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
    >
      Cancel
    </button>
  )
}

interface FormActionsProps {
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onCancel: () => void
}

/**
 * Form action buttons container
 */
export function FormActions({ isSubmitting, mode, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-4">
      <SubmitButton isSubmitting={isSubmitting} mode={mode} />
      <CancelButton onClick={onCancel} disabled={isSubmitting} />
    </div>
  )
}
