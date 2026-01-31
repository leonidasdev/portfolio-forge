/**
 * Builder Component Tests
 *
 * Tests for the Portfolio Builder component.
 * Tests section management, drag-and-drop, and AI features integration.
 */

import type { Database } from '@/lib/supabase/types'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock the API client
const mockDelete = jest.fn()
const mockPut = jest.fn()
const mockPost = jest.fn()

jest.mock('@/lib/api/client', () => ({
  apiClient: {
    delete: (...args: unknown[]) => mockDelete(...args),
    put: (...args: unknown[]) => mockPut(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}))

// Note: @dnd-kit mocks are in __mocks__/@dnd-kit/

// Mock AI feature components (they're tested separately)
jest.mock('../AIRewritePortfolio', () => ({
  AIRewritePortfolio: () => <div data-testid="ai-rewrite">AI Rewrite</div>,
}))

jest.mock('../AIJobOptimizer', () => ({
  AIJobOptimizer: () => <div data-testid="ai-job-optimizer">AI Job Optimizer</div>,
}))

jest.mock('../AIResumeGenerator', () => ({
  AIResumeGenerator: () => <div data-testid="ai-resume-generator">AI Resume Generator</div>,
}))

jest.mock('../AITemplateRecommender', () => ({
  AITemplateRecommender: () => (
    <div data-testid="ai-template-recommender">AI Template Recommender</div>
  ),
}))

jest.mock('../AIPortfolioAnalyzer', () => ({
  AIPortfolioAnalyzer: () => <div data-testid="ai-portfolio-analyzer">AI Portfolio Analyzer</div>,
}))

// Mock SectionCard
jest.mock('../SectionCard', () => ({
  SectionCard: ({
    section,
    onEdit,
    onDelete,
  }: {
    section: Section
    onEdit: () => void
    onDelete: () => void
    disabled?: boolean
  }) => (
    <div data-testid={`section-card-${section.id}`}>
      <span>{section.section_type}</span>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

// Mock SectionAddMenu
jest.mock('../SectionAddMenu', () => ({
  SectionAddMenu: ({
    onSectionAdded,
  }: {
    portfolioId: string
    onSectionAdded: (section: Section) => void
  }) => (
    <button
      data-testid="add-section-menu"
      onClick={() =>
        onSectionAdded({
          id: 'new-section',
          portfolio_id: 'test-portfolio',
          section_type: 'about',
          title: '',
          description: null,
          display_order: 0,
          is_visible: true,
          custom_content: { text: 'New summary' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    >
      Add Section
    </button>
  ),
}))

// Mock SectionEditor
jest.mock('../SectionEditor', () => ({
  SectionEditor: ({
    section,
    onSave,
    onClose,
  }: {
    section: Section
    onSave: (section: Section) => void
    onClose: () => void
  }) => (
    <div data-testid="section-editor">
      <span>Editing: {section.section_type}</span>
      <button
        onClick={() =>
          onSave({
            ...section,
            custom_content: { text: 'Updated content' },
          })
        }
      >
        Save
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}))

// Import Builder after all mocks are set up
import { Builder } from '../Builder'

// Test fixtures
const createMockPortfolio = (overrides: Partial<Portfolio> = {}): Portfolio => ({
  id: 'test-portfolio',
  user_id: 'test-user',
  title: 'Test Portfolio',
  slug: 'test-portfolio',
  description: 'A test portfolio',
  is_public: false,
  is_deleted: false,
  template: 'single-column',
  theme: 'default',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  ...overrides,
})

const createMockSection = (
  overrides: Partial<Section> & { id: string; section_type: Section['section_type'] }
): Section => ({
  portfolio_id: 'test-portfolio',
  title: '',
  description: null,
  display_order: 0,
  is_visible: true,
  custom_content: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  ...overrides,
})

describe('Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDelete.mockResolvedValue({})
    mockPut.mockResolvedValue({})
  })

  describe('rendering', () => {
    it('should render empty state when no sections', () => {
      render(<Builder portfolio={createMockPortfolio()} initialSections={[]} />)

      expect(screen.getByText('No sections yet')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Add your first section using the menu above, or generate from your resume.'
        )
      ).toBeInTheDocument()
    })

    it('should render section add menu', () => {
      render(<Builder portfolio={createMockPortfolio()} initialSections={[]} />)

      expect(screen.getByTestId('add-section-menu')).toBeInTheDocument()
    })

    it('should render AI resume generator even with no sections', () => {
      render(<Builder portfolio={createMockPortfolio()} initialSections={[]} />)

      expect(screen.getByTestId('ai-resume-generator')).toBeInTheDocument()
    })

    it('should not render other AI features when no sections', () => {
      render(<Builder portfolio={createMockPortfolio()} initialSections={[]} />)

      expect(screen.queryByTestId('ai-portfolio-analyzer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('ai-template-recommender')).not.toBeInTheDocument()
      expect(screen.queryByTestId('ai-rewrite')).not.toBeInTheDocument()
      expect(screen.queryByTestId('ai-job-optimizer')).not.toBeInTheDocument()
    })

    it('should render all AI features when sections exist', () => {
      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      expect(screen.getByTestId('ai-portfolio-analyzer')).toBeInTheDocument()
      expect(screen.getByTestId('ai-template-recommender')).toBeInTheDocument()
      expect(screen.getByTestId('ai-rewrite')).toBeInTheDocument()
      expect(screen.getByTestId('ai-job-optimizer')).toBeInTheDocument()
      expect(screen.getByTestId('ai-resume-generator')).toBeInTheDocument()
    })

    it('should render sections as cards', () => {
      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Summary text' },
        }),
        createMockSection({
          id: 'section-2',
          section_type: 'experience',
          display_order: 1,
          custom_content: { title: 'Developer', company: 'Test Corp' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Empty state should not be visible
      expect(screen.queryByText('No sections yet')).not.toBeInTheDocument()
    })
  })

  describe('section management', () => {
    it('should add a new section when triggered', async () => {
      const user = userEvent.setup()

      render(<Builder portfolio={createMockPortfolio()} initialSections={[]} />)

      // Empty state should be visible initially
      expect(screen.getByText('No sections yet')).toBeInTheDocument()

      // Click add section
      await user.click(screen.getByTestId('add-section-menu'))

      // Empty state should disappear after adding section
      await waitFor(() => {
        expect(screen.queryByText('No sections yet')).not.toBeInTheDocument()
      })
    })

    it('should delete a section when confirmed', async () => {
      const user = userEvent.setup()

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Find and click delete button on the section card
      const sectionCard = screen.getByTestId('section-card-section-1')
      const deleteButton = within(sectionCard).getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Confirmation modal should appear with title
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /delete section/i })).toBeInTheDocument()

      // Confirm deletion - find the button in the dialog footer
      const dialog = screen.getByRole('dialog')
      const confirmButton = within(dialog).getByRole('button', { name: /^delete$/i })
      await user.click(confirmButton)

      // API should be called
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith('/portfolio-sections/section-1')
      })
    })

    it('should cancel section deletion', async () => {
      const user = userEvent.setup()

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Find and click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // API should NOT be called
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })

  describe('section editing', () => {
    it('should open editor when edit is clicked', async () => {
      const user = userEvent.setup()

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Editor should not be visible initially
      expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument()

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i })
      await user.click(editButton)

      // Editor should appear
      expect(screen.getByTestId('section-editor')).toBeInTheDocument()
      expect(screen.getByText('Editing: about')).toBeInTheDocument()
    })

    it('should close editor when close is clicked', async () => {
      const user = userEvent.setup()

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Open editor
      await user.click(screen.getByRole('button', { name: /edit/i }))
      expect(screen.getByTestId('section-editor')).toBeInTheDocument()

      // Close editor
      await user.click(screen.getByRole('button', { name: /close/i }))

      // Editor should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument()
      })
    })

    it('should update section when saved', async () => {
      const user = userEvent.setup()

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Open editor
      await user.click(screen.getByRole('button', { name: /edit/i }))

      // Save changes
      await user.click(screen.getByRole('button', { name: /save/i }))

      // Editor should close after save
      await waitFor(() => {
        expect(screen.queryByTestId('section-editor')).not.toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('should show error modal when delete fails', async () => {
      const user = userEvent.setup()
      mockDelete.mockRejectedValue(new Error('Network error'))

      const sections = [
        createMockSection({
          id: 'section-1',
          section_type: 'about',
          custom_content: { text: 'Test' },
        }),
      ]

      render(<Builder portfolio={createMockPortfolio()} initialSections={sections} />)

      // Trigger delete
      await user.click(screen.getByRole('button', { name: /delete/i }))

      // Confirm deletion
      const confirmButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(confirmButtons[confirmButtons.length - 1])

      // Error modal should appear
      await waitFor(() => {
        expect(screen.getByText(/failed to delete section/i)).toBeInTheDocument()
      })
    })
  })
})
