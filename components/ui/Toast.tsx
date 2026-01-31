/**
 * Toast Notification System
 *
 * A flexible toast notification system for displaying temporary messages.
 *
 * @example
 * import { ToastProvider, useToast } from '@/components/ui/Toast'
 *
 * // Wrap your app with ToastProvider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // Use the hook in any component
 * const { toast } = useToast()
 * toast.success('Item saved successfully!')
 * toast.error('Failed to save item')
 * toast.info('Processing...')
 * toast.warning('This action cannot be undone')
 */

'use client'

import { cn } from '@/lib/utils'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
}

export interface ToastOptions {
  title?: string
  duration?: number
}

export interface ToastContextValue {
  toasts: Toast[]
  toast: {
    success: (message: string, options?: ToastOptions) => void
    error: (message: string, options?: ToastOptions) => void
    warning: (message: string, options?: ToastOptions) => void
    info: (message: string, options?: ToastOptions) => void
    custom: (type: ToastType, message: string, options?: ToastOptions) => void
  }
  removeToast: (id: string) => void
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// ============================================================================
// Toast Provider
// ============================================================================

export interface ToastProviderProps {
  children: React.ReactNode
  /** Position of the toast container */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
  /** Default duration for toasts in milliseconds */
  defaultDuration?: number
  /** Maximum number of toasts to show at once */
  maxToasts?: number
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export function ToastProvider({
  children,
  position = 'top-right',
  defaultDuration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      const duration = options?.duration ?? defaultDuration

      const newToast: Toast = {
        id,
        type,
        message,
        title: options?.title,
        duration,
      }

      setToasts((prev) => {
        const updated = [...prev, newToast]
        // Limit the number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts)
        }
        return updated
      })

      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [defaultDuration, maxToasts, removeToast]
  )

  const toast = {
    success: (message: string, options?: ToastOptions) => addToast('success', message, options),
    error: (message: string, options?: ToastOptions) => addToast('error', message, options),
    warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
    info: (message: string, options?: ToastOptions) => addToast('info', message, options),
    custom: (type: ToastType, message: string, options?: ToastOptions) =>
      addToast(type, message, options),
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={cn(
              'fixed z-[100] flex flex-col gap-2 pointer-events-none',
              positionClasses[position]
            )}
            role="region"
            aria-label="Notifications"
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

// ============================================================================
// Toast Item
// ============================================================================

interface ToastItemProps {
  toast: Toast
  onDismiss: () => void
}

const typeStyles = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
}

const typeIcons = {
  success: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const styles = typeStyles[toast.type]

  return (
    <div
      className={cn(
        'pointer-events-auto w-80 rounded-lg border shadow-lg p-4',
        'animate-in slide-in-from-right-full duration-300',
        styles.bg
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0', styles.icon)}>{typeIcons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          {toast.title && <p className={cn('text-sm font-medium', styles.title)}>{toast.title}</p>}
          <p className={cn('text-sm', styles.message, toast.title && 'mt-1')}>{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
            styles.icon
          )}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// useToast Hook
// ============================================================================

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
