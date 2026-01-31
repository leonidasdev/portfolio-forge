import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from '../Toast'

// Test component that uses the toast hook
function ToastTrigger({
  type,
  message,
  options,
}: {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  options?: { title?: string; duration?: number }
}) {
  const { toast } = useToast()
  return <button onClick={() => toast[type](message, options)}>Show Toast</button>
}

// Component to test all toast types
function AllToastsTrigger() {
  const { toast } = useToast()
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Success</button>
      <button onClick={() => toast.error('Error message')}>Error</button>
      <button onClick={() => toast.warning('Warning message')}>Warning</button>
      <button onClick={() => toast.info('Info message')}>Info</button>
    </div>
  )
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Child content</div>
        </ToastProvider>
      )
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should render toast container', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      )
      // Toast container is rendered to document.body via portal
      const toastContainer = document.querySelector('[role="region"]')
      expect(toastContainer).toBeInTheDocument()
    })
  })

  describe('useToast hook', () => {
    it('should show success toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Operation successful" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      expect(screen.getByText('Operation successful')).toBeInTheDocument()
    })

    it('should show error toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="error" message="Something went wrong" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should show warning toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="warning" message="Please be careful" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      expect(screen.getByText('Please be careful')).toBeInTheDocument()
    })

    it('should show info toast', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="info" message="Here is some information" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      expect(screen.getByText('Here is some information')).toBeInTheDocument()
    })

    it('should show toast with title', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="File saved" options={{ title: 'Success!' }} />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('File saved')).toBeInTheDocument()
    })
  })

  describe('toast auto-dismiss', () => {
    it('should auto-dismiss toast after duration', async () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Will disappear" options={{ duration: 1000 }} />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))
      expect(screen.getByText('Will disappear')).toBeInTheDocument()

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1100)
      })

      await waitFor(() => {
        expect(screen.queryByText('Will disappear')).not.toBeInTheDocument()
      })
    })
  })

  describe('toast dismiss button', () => {
    it('should dismiss toast when close button is clicked', async () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Dismissable toast" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))
      expect(screen.getByText('Dismissable toast')).toBeInTheDocument()

      // Find and click the close button
      const closeButton = screen.getByRole('button', { name: /dismiss/i })
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByText('Dismissable toast')).not.toBeInTheDocument()
      })
    })
  })

  describe('multiple toasts', () => {
    it('should show multiple toasts', () => {
      render(
        <ToastProvider>
          <AllToastsTrigger />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Success'))
      fireEvent.click(screen.getByText('Error'))

      expect(screen.getByText('Success message')).toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    it('should limit toasts to maxToasts', () => {
      render(
        <ToastProvider maxToasts={2}>
          <AllToastsTrigger />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Success'))
      fireEvent.click(screen.getByText('Error'))
      fireEvent.click(screen.getByText('Warning'))

      // Should only show 2 toasts (last 2)
      expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.getByText('Warning message')).toBeInTheDocument()
    })
  })

  describe('toast positioning', () => {
    it('should position toasts at top-right by default', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Test" />
        </ToastProvider>
      )

      // Toast container is rendered to document.body via portal
      const toastContainer = document.querySelector('[role="region"]')
      expect(toastContainer).toHaveClass('top-4', 'right-4')
    })

    it('should position toasts at bottom-right when specified', () => {
      render(
        <ToastProvider position="bottom-right">
          <ToastTrigger type="success" message="Test" />
        </ToastProvider>
      )

      const toastContainer = document.querySelector('[role="region"]')
      expect(toastContainer).toHaveClass('bottom-4', 'right-4')
    })

    it('should position toasts at top-left when specified', () => {
      render(
        <ToastProvider position="top-left">
          <ToastTrigger type="success" message="Test" />
        </ToastProvider>
      )

      const toastContainer = document.querySelector('[role="region"]')
      expect(toastContainer).toHaveClass('top-4', 'left-4')
    })
  })

  describe('toast types styling', () => {
    it('should apply success styling', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="success" message="Success" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      // Success toasts have green background
      const toast = screen.getByText('Success').closest('[class*="bg-green"]')
      expect(toast).toBeInTheDocument()
    })

    it('should apply error styling', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="error" message="Error" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      // Error toasts have red background
      const toast = screen.getByText('Error').closest('[class*="bg-red"]')
      expect(toast).toBeInTheDocument()
    })

    it('should apply warning styling', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="warning" message="Warning" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      // Warning toasts have yellow background
      const toast = screen.getByText('Warning').closest('[class*="bg-yellow"]')
      expect(toast).toBeInTheDocument()
    })

    it('should apply info styling', () => {
      render(
        <ToastProvider>
          <ToastTrigger type="info" message="Info" />
        </ToastProvider>
      )

      fireEvent.click(screen.getByText('Show Toast'))

      // Info toasts have blue background
      const toast = screen.getByText('Info').closest('[class*="bg-blue"]')
      expect(toast).toBeInTheDocument()
    })
  })
})
