import { fireEvent, render, screen } from '@testing-library/react'
import { AlertModal, ConfirmModal, Modal, useModal } from '../Modal'

// Test component that uses useModal hook
function ModalTrigger({ title, children }: { title: string; children: React.ReactNode }) {
  const { isOpen, open, close } = useModal()
  return (
    <>
      <button onClick={open}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={close} title={title}>
        {children}
      </Modal>
    </>
  )
}

describe('Modal', () => {
  describe('rendering', () => {
    it('should not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      )
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      )
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should render title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="My Title">
          Content
        </Modal>
      )
      expect(screen.getByText('My Title')).toBeInTheDocument()
    })

    it('should render children', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal">
          <p>Custom content here</p>
        </Modal>
      )
      expect(screen.getByText('Custom content here')).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it('should render small size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Small" size="sm">
          Content
        </Modal>
      )
      // Modal content is rendered to document.body via portal
      expect(document.querySelector('.max-w-sm')).toBeInTheDocument()
    })

    it('should render medium size by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Medium">
          Content
        </Modal>
      )
      expect(document.querySelector('.max-w-md')).toBeInTheDocument()
    })

    it('should render large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Large" size="lg">
          Content
        </Modal>
      )
      expect(document.querySelector('.max-w-lg')).toBeInTheDocument()
    })

    it('should render extra large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="XL" size="xl">
          Content
        </Modal>
      )
      expect(document.querySelector('.max-w-xl')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      )

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      fireEvent.click(closeButton)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      )

      // Click on the backdrop overlay (the outer div with role="dialog" parent)
      const overlay = document.querySelector('.bg-black\\/50')
      fireEvent.click(overlay!)

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when modal content is clicked', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      )

      fireEvent.click(screen.getByText('Content'))

      expect(handleClose).not.toHaveBeenCalled()
    })

    it('should call onClose when Escape key is pressed', () => {
      const handleClose = jest.fn()
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          Content
        </Modal>
      )

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have role dialog', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should have aria-modal', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('should have aria-labelledby pointing to title', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </Modal>
      )
      const dialog = screen.getByRole('dialog')
      const labelledBy = dialog.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      expect(document.getElementById(labelledBy!)).toHaveTextContent('Test Title')
    })
  })
})

describe('ConfirmModal', () => {
  it('should render title and message', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Are you sure?"
      />
    )

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('should render default button labels', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Sure?"
      />
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    // Get confirm button by role since title also contains "Confirm"
    const buttons = screen.getAllByRole('button')
    const confirmButton = buttons.find((btn) => btn.textContent === 'Confirm')
    expect(confirmButton).toBeInTheDocument()
  })

  it('should render custom button labels', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete"
        message="Delete this?"
        confirmText="Yes, delete"
        cancelText="No, keep it"
      />
    )

    expect(screen.getByText('No, keep it')).toBeInTheDocument()
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
  })

  it('should call onConfirm when confirm button is clicked', () => {
    const handleConfirm = jest.fn()
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={handleConfirm}
        title="Confirm Action"
        message="Sure?"
      />
    )

    // Get the confirm button by role
    const buttons = screen.getAllByRole('button')
    const confirmButton = buttons.find((btn) => btn.textContent === 'Confirm')
    fireEvent.click(confirmButton!)

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when cancel button is clicked', () => {
    const handleClose = jest.fn()
    render(
      <ConfirmModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Confirm"
        message="Sure?"
      />
    )

    fireEvent.click(screen.getByText('Cancel'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should apply destructive styling for danger variant', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Delete"
        message="Delete this?"
        variant="danger"
      />
    )

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toHaveClass('bg-red-600')
  })

  it('should show loading state on confirm button', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Confirm Action"
        message="Sure?"
        isLoading={true}
      />
    )

    const buttons = screen.getAllByRole('button')
    const confirmButton = buttons.find((btn) => btn.textContent?.includes('Confirm'))
    expect(confirmButton).toBeDisabled()
  })
})

describe('AlertModal', () => {
  it('should render title and message', () => {
    render(
      <AlertModal isOpen={true} onClose={() => {}} title="Alert" message="Something happened" />
    )

    expect(screen.getByText('Alert')).toBeInTheDocument()
    expect(screen.getByText('Something happened')).toBeInTheDocument()
  })

  it('should render default close label', () => {
    render(<AlertModal isOpen={true} onClose={() => {}} title="Alert" message="Message" />)

    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('should render custom close label', () => {
    render(
      <AlertModal
        isOpen={true}
        onClose={() => {}}
        title="Alert"
        message="Message"
        closeText="Got it"
      />
    )

    expect(screen.getByText('Got it')).toBeInTheDocument()
  })

  it('should call onClose when button is clicked', () => {
    const handleClose = jest.fn()
    render(<AlertModal isOpen={true} onClose={handleClose} title="Alert" message="Message" />)

    fireEvent.click(screen.getByText('OK'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('should apply error styling', () => {
    render(
      <AlertModal
        isOpen={true}
        onClose={() => {}}
        title="Error"
        message="An error occurred"
        type="error"
      />
    )

    // Error variant should show error icon
    const iconContainer = document.querySelector('.text-red-600')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should apply success styling', () => {
    render(
      <AlertModal
        isOpen={true}
        onClose={() => {}}
        title="Success"
        message="Operation completed"
        type="success"
      />
    )

    // Success variant should show success icon
    const iconContainer = document.querySelector('.text-green-600')
    expect(iconContainer).toBeInTheDocument()
  })

  it('should apply warning styling', () => {
    render(
      <AlertModal
        isOpen={true}
        onClose={() => {}}
        title="Warning"
        message="Be careful"
        type="warning"
      />
    )

    // Warning variant should show warning icon
    const iconContainer = document.querySelector('.text-yellow-600')
    expect(iconContainer).toBeInTheDocument()
  })
})

describe('useModal hook', () => {
  it('should start with isOpen false', () => {
    render(<ModalTrigger title="Test">Content</ModalTrigger>)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('should open modal when open is called', () => {
    render(<ModalTrigger title="Test">Content</ModalTrigger>)

    fireEvent.click(screen.getByText('Open Modal'))

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should close modal when close is called', () => {
    render(<ModalTrigger title="Test">Content</ModalTrigger>)

    // Open the modal
    fireEvent.click(screen.getByText('Open Modal'))
    expect(screen.getByText('Content')).toBeInTheDocument()

    // Close it
    const closeButton = screen.getByRole('button', { name: /close modal/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })
})
