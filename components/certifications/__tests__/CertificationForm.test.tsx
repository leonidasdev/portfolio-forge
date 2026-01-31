/**
 * CertificationForm Component Tests
 *
 * Tests for the Certification Form component.
 * Tests form validation, submission, file upload, and different certification types.
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    back: mockBack,
  }),
}))

// Mock session context
jest.mock('@/lib/auth/SessionContext', () => ({
  useUserId: () => 'test-user-id',
}))

// Mock API client
const mockGet = jest.fn()
const mockPost = jest.fn()
const mockPatch = jest.fn()
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: jest.fn(),
  },
}))

// Mock storage functions
jest.mock('@/lib/storage/certifications', () => ({
  uploadCertificationFile: jest.fn().mockResolvedValue('path/to/file.pdf'),
  deleteCertificationFile: jest.fn().mockResolvedValue(undefined),
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}))

// Import after mocks
import { CertificationForm } from '../CertificationForm'

describe('CertificationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({ certification: { tags: [] } })
    mockPost.mockResolvedValue({ certification: { id: 'new-cert-id' } })
    mockPatch.mockResolvedValue({ certification: { id: 'existing-cert-id' } })
  })

  describe('create mode', () => {
    it('should render empty form in create mode', () => {
      render(<CertificationForm mode="create" />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('')
      expect(screen.getByLabelText(/issuing organization/i)).toHaveValue('')
      expect(screen.getByRole('button', { name: /create certification/i })).toBeInTheDocument()
    })

    it('should have required fields marked', () => {
      render(<CertificationForm mode="create" />)

      // Title and issuer inputs should have required attribute
      const titleInput = screen.getByLabelText(/title/i)
      const issuerInput = screen.getByLabelText(/issuing organization/i)

      expect(titleInput).toBeRequired()
      expect(issuerInput).toBeRequired()
    })

    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      await user.type(screen.getByLabelText(/title/i), 'AWS Solutions Architect')
      await user.type(screen.getByLabelText(/issuing organization/i), 'Amazon Web Services')

      await user.click(screen.getByRole('button', { name: /create certification/i }))

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith(
          '/certifications',
          expect.objectContaining({
            title: 'AWS Solutions Architect',
            issuing_organization: 'Amazon Web Services',
          })
        )
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/certifications')
    })

    it('should default to manual certification type', () => {
      render(<CertificationForm mode="create" />)

      const manualRadio = screen.getByRole('radio', { name: /manual entry/i })
      expect(manualRadio).toBeChecked()
    })
  })

  describe('edit mode', () => {
    const existingCertification = {
      id: 'cert-123',
      user_id: 'test-user-id',
      title: 'Existing Certification',
      issuing_organization: 'Test Issuer',
      certification_type: 'manual' as const,
      date_issued: '2024-01-01',
      expiration_date: null,
      credential_id: 'CRED-123',
      verification_url: 'https://example.com/verify',
      description: 'Test description',
      is_public: true,
      file_path: null,
      file_type: null,
      external_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    it('should pre-fill form in edit mode', () => {
      render(<CertificationForm mode="edit" initialData={existingCertification} />)

      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Certification')
      expect(screen.getByLabelText(/issuing organization/i)).toHaveValue('Test Issuer')
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
    })

    it('should call PATCH when updating', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="edit" initialData={existingCertification} />)

      // Update title
      const titleInput = screen.getByLabelText(/title/i)
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith(
          '/certifications/cert-123',
          expect.objectContaining({
            title: 'Updated Title',
          })
        )
      })
    })

    it('should disable certification type change in edit mode', () => {
      render(<CertificationForm mode="edit" initialData={existingCertification} />)

      const manualRadio = screen.getByRole('radio', { name: /manual entry/i })
      expect(manualRadio).toBeDisabled()
    })
  })

  describe('certification types', () => {
    it('should show external URL field when external link type is selected', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const externalRadio = screen.getByRole('radio', { name: /external link/i })
      await user.click(externalRadio)

      expect(screen.getByLabelText(/external url/i)).toBeInTheDocument()
    })

    it('should show file upload when PDF type is selected', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const pdfRadio = screen.getByRole('radio', { name: /upload pdf/i })
      await user.click(pdfRadio)

      expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument()
    })
  })

  describe('optional fields', () => {
    it('should allow setting issue date', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const dateInput = screen.getByLabelText(/issue date/i)
      await user.type(dateInput, '2024-01-15')

      expect(dateInput).toHaveValue('2024-01-15')
    })

    it('should allow setting expiration date', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const dateInput = screen.getByLabelText(/expiration date/i)
      await user.type(dateInput, '2027-01-15')

      expect(dateInput).toHaveValue('2027-01-15')
    })

    it('should allow setting credential ID', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const credentialInput = screen.getByLabelText(/credential id/i)
      await user.type(credentialInput, 'CERT-12345')

      expect(credentialInput).toHaveValue('CERT-12345')
    })

    it('should allow setting verification URL', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const urlInput = screen.getByLabelText(/verification url/i)
      await user.type(urlInput, 'https://verify.example.com')

      expect(urlInput).toHaveValue('https://verify.example.com')
    })

    it('should allow setting description', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const descInput = screen.getByLabelText(/description/i)
      await user.type(descInput, 'Test description')

      expect(descInput).toHaveValue('Test description')
    })
  })

  describe('visibility toggle', () => {
    it('should default to public', () => {
      render(<CertificationForm mode="create" />)

      const checkbox = screen.getByLabelText(/public/i)
      expect(checkbox).toBeChecked()
    })

    it('should allow toggling visibility', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const checkbox = screen.getByLabelText(/public/i)
      await user.click(checkbox)

      expect(checkbox).not.toBeChecked()
    })
  })

  describe('error handling', () => {
    it('should display API error on submit failure', async () => {
      const user = userEvent.setup()
      mockPost.mockRejectedValue(new Error('Server error'))

      render(<CertificationForm mode="create" />)

      await user.type(screen.getByLabelText(/title/i), 'Test Cert')
      await user.type(screen.getByLabelText(/issuing organization/i), 'Test Issuer')

      await user.click(screen.getByRole('button', { name: /create certification/i }))

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument()
      })
    })

    it('should show submitting state while saving', async () => {
      const user = userEvent.setup()
      mockPost.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

      render(<CertificationForm mode="create" />)

      await user.type(screen.getByLabelText(/title/i), 'Test Cert')
      await user.type(screen.getByLabelText(/issuing organization/i), 'Test Issuer')

      await user.click(screen.getByRole('button', { name: /create certification/i }))

      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument()
    })
  })

  describe('tag selection', () => {
    it('should render tag selector label', () => {
      render(<CertificationForm mode="create" />)

      expect(screen.getByText('Tags')).toBeInTheDocument()
    })
  })

  describe('cancel button', () => {
    it('should navigate back when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<CertificationForm mode="create" />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })
})
