/**
 * Modal Component
 *
 * A flexible modal dialog component for confirmations, forms, and alerts.
 * Includes built-in support for confirm dialogs.
 *
 * @example
 * import { Modal, useModal, ConfirmModal } from '@/components/ui/Modal'
 *
 * // Basic modal
 * <Modal isOpen={isOpen} onClose={onClose} title="My Modal">
 *   <p>Modal content here</p>
 * </Modal>
 *
 * // Confirm modal
 * <ConfirmModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   variant="danger"
 * />
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal content */
  children: React.ReactNode
  /** Size of the modal */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether clicking outside closes the modal */
  closeOnOverlayClick?: boolean
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean
  /** Whether to show the close button */
  showCloseButton?: boolean
  /** Footer content (usually buttons) */
  footer?: React.ReactNode
  /** Additional class names for the modal content */
  className?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn(
          'relative w-full bg-white rounded-lg shadow-xl',
          'animate-in zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

// ============================================================================
// Confirm Modal
// ============================================================================

export interface ConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
  /** Callback when the user confirms */
  onConfirm: () => void | Promise<void>
  /** Modal title */
  title: string
  /** Confirmation message */
  message: string | React.ReactNode
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** Variant for the confirm button */
  variant?: 'primary' | 'danger' | 'success'
  /** Whether the confirm action is loading */
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirm action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const isActionLoading = isLoading || loading

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnOverlayClick={!isActionLoading}
      closeOnEscape={!isActionLoading}
      showCloseButton={!isActionLoading}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isActionLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} isLoading={isActionLoading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="text-gray-600">{message}</div>
    </Modal>
  )
}

// ============================================================================
// Alert Modal
// ============================================================================

export interface AlertModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
  /** Modal title */
  title: string
  /** Alert message */
  message: string | React.ReactNode
  /** Alert type */
  type?: 'info' | 'success' | 'warning' | 'error'
  /** Text for the close button */
  closeText?: string
}

const alertIcons = {
  info: (
    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  closeText = 'OK',
}: AlertModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      footer={
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            {closeText}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">{alertIcons[type]}</div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="mt-2 text-gray-600">{message}</div>
        </div>
      </div>
    </Modal>
  )
}

// ============================================================================
// useModal Hook
// ============================================================================

export interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}

// ============================================================================
// useConfirm Hook - Replacement for window.confirm()
// ============================================================================

export interface UseConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger' | 'success'
}

export interface UseConfirmReturn {
  confirm: (options: UseConfirmOptions) => Promise<boolean>
  ConfirmDialog: React.FC
}

// Global confirm state for the hook
let globalConfirmResolve: ((value: boolean) => void) | null = null

export function useConfirm(): UseConfirmReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<UseConfirmOptions | null>(null)

  const confirm = useCallback((opts: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      globalConfirmResolve = resolve
      setOptions(opts)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (globalConfirmResolve) {
      globalConfirmResolve(true)
      globalConfirmResolve = null
    }
    setIsOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    if (globalConfirmResolve) {
      globalConfirmResolve(false)
      globalConfirmResolve = null
    }
    setIsOpen(false)
  }, [])

  const ConfirmDialog: React.FC = useCallback(
    () => (
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options?.title || 'Confirm'}
        message={options?.message || ''}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        variant={options?.variant}
      />
    ),
    [isOpen, options, handleCancel, handleConfirm]
  )

  return { confirm, ConfirmDialog }
}
