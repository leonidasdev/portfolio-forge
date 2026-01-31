/**
 * Form Field Components
 *
 * Reusable form input components with consistent styling
 * and validation support.
 */

'use client'

import { type ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

/**
 * Wrapper component for form fields with label, hint, and error
 */
export function FormField({ label, htmlFor, required, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface TextInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: 'text' | 'url'
  disabled?: boolean
}

/**
 * Standard text input field
 */
export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
  disabled,
}: TextInputProps) {
  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  )
}

interface DateInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Date input field
 */
export function DateInput({ id, value, onChange, disabled }: DateInputProps) {
  return (
    <input
      type="date"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
    />
  )
}

interface TextAreaProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
}

/**
 * Multiline text area field
 */
export function TextArea({ id, value, onChange, placeholder, rows = 3, disabled }: TextAreaProps) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
    />
  )
}

interface CheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}

/**
 * Checkbox with label and optional hint
 */
export function Checkbox({ id, checked, onChange, label, hint, disabled }: CheckboxProps) {
  return (
    <div>
      <label className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
      {hint && <p className="mt-1 ml-6 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
