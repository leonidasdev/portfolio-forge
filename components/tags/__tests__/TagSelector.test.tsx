/**
 * Tests for TagSelector Component
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagSelector } from '../TagSelector'

// Mock apiClient
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

// Import the mocked module
import { apiClient } from '@/lib/api/client'
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Sample tags for testing
const mockTags = [
  { id: '1', name: 'JavaScript', user_id: 'user-1', created_at: '2024-01-01' },
  { id: '2', name: 'TypeScript', user_id: 'user-1', created_at: '2024-01-02' },
  { id: '3', name: 'React', user_id: 'user-1', created_at: '2024-01-03' },
]

describe('TagSelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockApiClient.get.mockResolvedValue({ tags: mockTags })
    // Mock window.confirm
    window.confirm = jest.fn(() => true)
  })

  describe('loading state', () => {
    it('should show loading spinner initially', () => {
      // Make the get hang to keep loading state
      mockApiClient.get.mockImplementation(() => new Promise(() => {}))

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      expect(screen.getByText('Loading tags...')).toBeInTheDocument()
    })
  })

  describe('displaying tags', () => {
    it('should display all fetched tags', async () => {
      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.getByText('React')).toBeInTheDocument()
      })
    })

    it('should show selected count', async () => {
      render(<TagSelector selectedTags={[mockTags[0], mockTags[1]]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText(/2 selected/)).toBeInTheDocument()
      })
    })

    it('should highlight selected tags', async () => {
      render(<TagSelector selectedTags={[mockTags[0]]} onChange={mockOnChange} />)

      await waitFor(() => {
        const jsTag = screen.getByRole('button', { name: /JavaScript/i })
        expect(jsTag).toHaveClass('bg-blue-600', 'text-white')
      })
    })

    it('should show unselected tags with gray styling', async () => {
      render(<TagSelector selectedTags={[mockTags[0]]} onChange={mockOnChange} />)

      await waitFor(() => {
        const tsTag = screen.getByRole('button', { name: /TypeScript/i })
        expect(tsTag).toHaveClass('bg-gray-100', 'text-gray-700')
      })
    })
  })

  describe('selecting tags', () => {
    it('should call onChange when selecting a tag', async () => {
      const user = userEvent.setup()
      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const jsTag = screen.getByRole('button', { name: /JavaScript/i })
      await user.click(jsTag)

      expect(mockOnChange).toHaveBeenCalledWith([mockTags[0]])
    })

    it('should call onChange when unselecting a tag', async () => {
      const user = userEvent.setup()
      render(<TagSelector selectedTags={[mockTags[0]]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const jsTag = screen.getByRole('button', { name: /JavaScript/i })
      await user.click(jsTag)

      expect(mockOnChange).toHaveBeenCalledWith([])
    })

    it('should add to existing selection', async () => {
      const user = userEvent.setup()
      render(<TagSelector selectedTags={[mockTags[0]]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
      })

      const tsTag = screen.getByRole('button', { name: /TypeScript/i })
      await user.click(tsTag)

      expect(mockOnChange).toHaveBeenCalledWith([mockTags[0], mockTags[1]])
    })
  })

  describe('creating tags', () => {
    it('should create a new tag when form is submitted', async () => {
      const user = userEvent.setup()
      const newTag = { id: '4', name: 'Vue', user_id: 'user-1', created_at: '2024-01-04' }
      mockApiClient.post.mockResolvedValue({ tag: newTag })

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Create new tag...')
      await user.type(input, 'Vue')

      const addButton = screen.getByRole('button', { name: /Add Tag/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/tags', { name: 'Vue' })
      })

      // Should auto-select the new tag
      expect(mockOnChange).toHaveBeenCalledWith([newTag])
    })

    it('should not submit empty tag name', async () => {
      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /Add Tag/i })
      expect(addButton).toBeDisabled()
    })

    it('should disable button while creating', async () => {
      const user = userEvent.setup()
      // Make post hang to simulate loading
      mockApiClient.post.mockImplementation(() => new Promise(() => {}))

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Create new tag...')
      await user.type(input, 'NewTag')

      const addButton = screen.getByRole('button', { name: /Add Tag/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Creating/i })).toBeDisabled()
      })
    })
  })

  describe('deleting tags', () => {
    it('should show confirmation before deleting', async () => {
      const user = userEvent.setup()

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      // Find delete button within the JavaScript tag
      const jsTag = screen.getByRole('button', { name: /JavaScript/i })
      const deleteIcon = jsTag.querySelector('span[title="Delete tag"]')

      if (deleteIcon) {
        await user.click(deleteIcon)
      }

      // Should show the confirmation modal
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Delete Tag')).toBeInTheDocument()
      })

      // Click cancel to dismiss
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      // Modal should close and API should not be called
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
      expect(mockApiClient.delete).not.toHaveBeenCalled()
    })

    it('should delete tag when confirmed', async () => {
      const user = userEvent.setup()
      mockApiClient.delete.mockResolvedValue({})

      render(<TagSelector selectedTags={[mockTags[0]]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      // Find delete button within the JavaScript tag
      const jsTag = screen.getByRole('button', { name: /JavaScript/i })
      const deleteIcon = jsTag.querySelector('span[title="Delete tag"]')

      if (deleteIcon) {
        await user.click(deleteIcon)
      }

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Click the Delete button to confirm
      const deleteButton = screen.getByRole('button', { name: /^Delete$/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockApiClient.delete).toHaveBeenCalledWith('/tags/1')
      })

      // Should remove from selection
      expect(mockOnChange).toHaveBeenCalledWith([])
    })
  })

  describe('error handling', () => {
    it('should display error when loading fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'))

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('should display error when creating fails', async () => {
      const user = userEvent.setup()
      mockApiClient.post.mockRejectedValue(new Error('Failed to create'))

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('Create new tag...')
      await user.type(input, 'NewTag')

      const addButton = screen.getByRole('button', { name: /Add Tag/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create')).toBeInTheDocument()
      })
    })

    it('should display error when deleting fails', async () => {
      const user = userEvent.setup()
      mockApiClient.delete.mockRejectedValue(new Error('Failed to delete'))

      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const jsTag = screen.getByRole('button', { name: /JavaScript/i })
      const deleteIcon = jsTag.querySelector('span[title="Delete tag"]')

      if (deleteIcon) {
        await user.click(deleteIcon)
      }

      // Wait for modal to appear and click delete
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: /^Delete$/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to delete')).toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible form elements', async () => {
      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      // Input should have placeholder
      expect(screen.getByPlaceholderText('Create new tag...')).toBeInTheDocument()

      // Tags should be buttons
      const tagButtons = screen.getAllByRole('button')
      expect(tagButtons.length).toBeGreaterThan(0)
    })

    it('should have disabled state on submit button when empty', async () => {
      render(<TagSelector selectedTags={[]} onChange={mockOnChange} />)

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument()
      })

      const addButton = screen.getByRole('button', { name: /Add Tag/i })
      expect(addButton).toBeDisabled()
    })
  })
})
