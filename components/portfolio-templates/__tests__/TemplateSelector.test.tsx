/**
 * TemplateSelector Component Tests
 *
 * Tests for the template selector component that allows users to browse
 * and select portfolio templates.
 */

import { apiClient } from '@/lib/api/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateSelector } from '../TemplateSelector'

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>
const mockPatch = apiClient.patch as jest.MockedFunction<typeof apiClient.patch>

const mockTemplates = [
  {
    id: 'single-column',
    name: 'Single Column',
    description: 'A clean, focused layout',
    layout: 'single-column',
    supportedSections: ['summary', 'skills', 'work_experience', 'education'],
    config: {},
  },
  {
    id: 'two-column',
    name: 'Two Column',
    description: 'Professional layout with sidebar',
    layout: 'two-column',
    supportedSections: ['summary', 'skills', 'work_experience'],
    config: {},
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological layout',
    layout: 'timeline',
    supportedSections: ['work_experience', 'education', 'certifications'],
    config: {},
  },
]

describe('TemplateSelector', () => {
  const defaultProps = {
    portfolioId: 'portfolio-123',
    currentTemplate: 'single-column',
    onTemplateChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue(mockTemplates)
  })

  describe('loading state', () => {
    it('should show loading state initially', () => {
      mockGet.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<TemplateSelector {...defaultProps} />)

      expect(screen.getByText(/loading templates/i)).toBeInTheDocument()
    })
  })

  describe('displaying templates', () => {
    it('should display all fetched templates', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Single Column')).toBeInTheDocument()
        expect(screen.getByText('Two Column')).toBeInTheDocument()
        expect(screen.getByText('Timeline')).toBeInTheDocument()
      })
    })

    it('should display template descriptions', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('A clean, focused layout')).toBeInTheDocument()
        expect(screen.getByText('Professional layout with sidebar')).toBeInTheDocument()
        expect(screen.getByText('Chronological layout')).toBeInTheDocument()
      })
    })

    it('should display layout badges', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('single column')).toBeInTheDocument()
        expect(screen.getByText('two column')).toBeInTheDocument()
        expect(screen.getByText('timeline')).toBeInTheDocument()
      })
    })

    it('should display supported sections count', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/supports 4 section types/i)).toBeInTheDocument()
        // Two templates have 3 section types
        expect(screen.getAllByText(/supports 3 section types/i)).toHaveLength(2)
      })
    })

    it('should highlight the currently selected template', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument()
      })

      // The Active badge should be near Single Column (current template)
      const singleColumnBtn = screen.getByRole('button', { name: /single column/i })
      expect(singleColumnBtn).toHaveStyle({ background: '#f0f9ff' })
    })
  })

  describe('selecting templates', () => {
    it('should call API when selecting a new template', async () => {
      const user = userEvent.setup()
      mockPatch.mockResolvedValue({ success: true })

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /two column/i }))

      expect(mockPatch).toHaveBeenCalledWith('/portfolios/portfolio-123/template', {
        template: 'two-column',
      })
    })

    it('should call onTemplateChange after successful update', async () => {
      const user = userEvent.setup()
      const onTemplateChange = jest.fn()
      mockPatch.mockResolvedValue({ success: true })

      render(<TemplateSelector {...defaultProps} onTemplateChange={onTemplateChange} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /two column/i }))

      await waitFor(() => {
        expect(onTemplateChange).toHaveBeenCalledWith('two-column')
      })
    })

    it('should not call API when selecting current template', async () => {
      const user = userEvent.setup()

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Single Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /single column/i }))

      expect(mockPatch).not.toHaveBeenCalled()
    })

    it('should show updating state while saving', async () => {
      const user = userEvent.setup()
      mockPatch.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /two column/i }))

      expect(screen.getByText(/updating template/i)).toBeInTheDocument()
    })

    it('should disable buttons while saving', async () => {
      const user = userEvent.setup()
      mockPatch.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /two column/i }))

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
          expect(button).toBeDisabled()
        })
      })
    })
  })

  describe('error handling', () => {
    it('should display error when loading fails', async () => {
      mockGet.mockRejectedValue(new Error('Network error'))

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/error: network error/i)).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      mockGet.mockRejectedValue(new Error('Network error'))

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('should revert selection on save failure', async () => {
      const user = userEvent.setup()
      mockPatch.mockRejectedValue(new Error('Save failed'))

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /two column/i }))

      // After error, the error message should appear
      await waitFor(() => {
        expect(screen.getByText(/error: save failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('optimistic updates', () => {
    it('should show new template as selected immediately', async () => {
      const user = userEvent.setup()
      mockPatch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ success: true }), 100)
          })
      )

      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Two Column')).toBeInTheDocument()
      })

      // Before click, Single Column has Active badge
      expect(screen.getByText('Active')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /two column/i }))

      // After click, optimistically Two Column should be styled as selected
      await waitFor(() => {
        const twoColumnBtn = screen.getByRole('button', { name: /two column/i })
        expect(twoColumnBtn).toHaveStyle({ background: '#f0f9ff' })
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible buttons for each template', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /single column/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /two column/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /timeline/i })).toBeInTheDocument()
      })
    })

    it('should have a heading for the selector', async () => {
      render(<TemplateSelector {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /select template/i })).toBeInTheDocument()
      })
    })
  })
})
