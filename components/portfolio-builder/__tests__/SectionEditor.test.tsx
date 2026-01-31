/**
 * SectionEditor Component Tests
 *
 * Tests for the Section Editor modal component.
 * Tests different section types, AI features, and save/cancel flows.
 */

import type { Database } from '@/lib/supabase/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

// Mock API client
const mockPatch = jest.fn()
const mockPost = jest.fn()
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    patch: (...args: unknown[]) => mockPatch(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}))

// Mock AI hooks
jest.mock('@/hooks/useImproveText', () => ({
  improveText: jest.fn().mockResolvedValue('Improved text content'),
}))

jest.mock('@/hooks/useGenerateSummary', () => ({
  generateSummary: jest.fn().mockResolvedValue('Generated summary content'),
}))

jest.mock('@/hooks/useSuggestTags', () => ({
  suggestTags: jest.fn().mockResolvedValue([
    { label: 'JavaScript', confidence: 0.9 },
    { label: 'React', confidence: 0.85 },
  ]),
}))

// Import after mocks
import { generateSummary } from '@/hooks/useGenerateSummary'
import { improveText } from '@/hooks/useImproveText'
import { suggestTags } from '@/hooks/useSuggestTags'
import { SectionEditor } from '../SectionEditor'

// Helper to create mock section
function createMockSection(overrides: Partial<Section> = {}): Section {
  return {
    id: 'section-1',
    portfolio_id: 'portfolio-1',
    section_type: 'summary',
    content: { text: '' },
    order_index: 0,
    title: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

describe('SectionEditor', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockPatch.mockResolvedValue({ section: createMockSection() })
  })

  describe('rendering', () => {
    it('should render editor modal with title', () => {
      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      expect(screen.getByText('Edit Section')).toBeInTheDocument()
      expect(screen.getByText(/section type:/i)).toBeInTheDocument()
    })

    it('should display section type', () => {
      render(
        <SectionEditor
          section={createMockSection({ section_type: 'skills' })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText(/section type:/i)).toBeInTheDocument()
      expect(screen.getByText(/section type: skills/i)).toBeInTheDocument()
    })

    it('should render cancel and save buttons', () => {
      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })
  })

  describe('summary section', () => {
    it('should render summary editor with textarea', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'summary',
            content: { text: 'Existing summary' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue('Existing summary')
    })

    it('should show AI summary generation buttons', () => {
      render(
        <SectionEditor
          section={createMockSection({ section_type: 'summary' })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // Should have summary generation options
      expect(screen.getByText('AI Summary Generator')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Generate from my data' })).toBeInTheDocument()
    })

    it('should call generateSummary when generate button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SectionEditor
          section={createMockSection({ section_type: 'summary' })}
          allSections={[
            createMockSection({
              section_type: 'skills',
              content: { skills: ['JavaScript', 'React'] },
            }),
          ]}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // Find and click generate from sections button
      const generateButton = screen.getByRole('button', { name: /Generate from sections/i })
      await user.click(generateButton)

      await waitFor(() => {
        expect(generateSummary).toHaveBeenCalled()
      })
    })
  })

  describe('skills section', () => {
    it('should render skills editor with textarea', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'skills',
            content: { skills: ['JavaScript', 'TypeScript'] },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // Skills are displayed in a textarea, one per line
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue('JavaScript\nTypeScript')
    })
  })

  describe('AI improvement', () => {
    it('should show AI improve toolbar for supported sections', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'summary',
            content: { text: 'Some text to improve' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Improve with AI:')).toBeInTheDocument()
    })

    it('should have tone selection options', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'summary',
            content: { text: 'Some text' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // Look for tone selector - check for the select element with options
      const toneSelect = screen.getByRole('combobox')
      expect(toneSelect).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Concise' })).toBeInTheDocument()
    })

    it('should call improveText when improve button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'summary',
            content: { text: 'Text to improve' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const improveButton = screen.getByRole('button', { name: 'Improve with AI' })
      await user.click(improveButton)

      await waitFor(() => {
        expect(improveText).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'Text to improve',
          })
        )
      })
    })
  })

  describe('tag suggestions', () => {
    it('should show tag suggestion toolbar for work_experience', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'work_experience',
            content: { description: 'Developed React applications' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('AI Tag Suggestions')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Suggest Tags' })).toBeInTheDocument()
    })

    it('should call suggestTags when suggest button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'work_experience',
            content: { description: 'Built web applications with React and Node.js' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const suggestButton = screen.getByRole('button', { name: 'Suggest Tags' })
      await user.click(suggestButton)

      await waitFor(() => {
        expect(suggestTags).toHaveBeenCalled()
      })
    })
  })

  describe('save and cancel', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should save section when save button is clicked', async () => {
      const user = userEvent.setup()
      const section = createMockSection({
        section_type: 'summary',
        content: { text: 'Original text' },
      })

      mockPatch.mockResolvedValue({
        section: { ...section, content: { text: 'Updated text' } },
      })

      render(<SectionEditor section={section} onSave={mockOnSave} onCancel={mockOnCancel} />)

      // Edit the text
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated text')

      // Click save
      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith(
          '/portfolio-sections/section-1',
          expect.objectContaining({
            content: { text: 'Updated text' },
          })
        )
      })
    })

    it('should show saving state while saving', async () => {
      const user = userEvent.setup()

      // Make patch hang
      mockPatch.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)))

      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    })

    it('should call onSave with updated section after successful save', async () => {
      const user = userEvent.setup()
      const updatedSection = createMockSection({ content: { text: 'New text' } })
      mockPatch.mockResolvedValue({ section: updatedSection })

      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(updatedSection)
      })
    })
  })

  describe('error handling', () => {
    it('should display error when save fails', async () => {
      const user = userEvent.setup()
      mockPatch.mockRejectedValue(new Error('Network error'))

      render(
        <SectionEditor section={createMockSection()} onSave={mockOnSave} onCancel={mockOnCancel} />
      )

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should display error when AI improvement fails', async () => {
      const user = userEvent.setup()
      ;(improveText as jest.Mock).mockRejectedValue(new Error('AI service unavailable'))

      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'summary',
            content: { text: 'Some text' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Improve with AI' }))

      await waitFor(() => {
        expect(screen.getByText(/ai service unavailable/i)).toBeInTheDocument()
      })
    })
  })

  describe('custom section', () => {
    it('should allow editing title for custom sections', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'custom',
            title: 'My Custom Section',
            content: { text: '' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      // Custom sections should show title in header
      expect(screen.getByText(/my custom section/i)).toBeInTheDocument()
    })

    it('should include title in save payload for custom sections', async () => {
      const user = userEvent.setup()
      mockPatch.mockResolvedValue({
        section: createMockSection({ section_type: 'custom', title: 'Updated Title' }),
      })

      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'custom',
            title: 'Original Title',
            content: { text: 'Content' },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByRole('button', { name: /save/i }))

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            title: expect.any(String),
          })
        )
      })
    })
  })

  describe('certifications section', () => {
    it('should disable save button for certifications section', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'certifications',
            content: { certifications: [] },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toBeDisabled()
    })

    it('should show tag suggestion toolbar for certifications', () => {
      render(
        <SectionEditor
          section={createMockSection({
            section_type: 'certifications',
            content: { certifications: [] },
          })}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('AI Tag Suggestions')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Suggest Tags' })).toBeInTheDocument()
    })
  })
})
