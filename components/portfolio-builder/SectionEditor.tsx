/**
 * Section Editor Component
 *
 * Modal editor for portfolio sections.
 * Renders different edit interfaces based on section type.
 * Includes AI-powered text improvement functionality.
 *
 * Architecture:
 * - Main orchestration component (this file)
 * - Section-specific editors in ./editors/
 * - AI toolbars in ./toolbars/
 */

'use client'

import { generateSummary } from '@/hooks/useGenerateSummary'
import { improveText, type Tone } from '@/hooks/useImproveText'
import { suggestTags, type SuggestedTag } from '@/hooks/useSuggestTags'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'
import { useCallback, useEffect, useState } from 'react'

// Section editors
import {
  CertificationsEditor,
  CustomEditor,
  SkillsEditor,
  SummaryEditor,
  WorkExperienceEditor,
} from './editors'

// AI toolbars
import { AIImproveToolbar, SummaryAIToolbar, TagSuggestionToolbar } from './toolbars'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

// ============================================================================
// Content Type Definitions
// ============================================================================

/** Content structure for summary sections */
interface SummaryContent {
  text?: string
}

/** Content structure for skills sections */
interface SkillsContent {
  skills?: string[]
}

/** Content structure for work experience sections */
interface WorkExperienceContent {
  description?: string
  tags?: string[]
  role?: string
  company?: string
  jobs?: Array<{
    role?: string
    company?: string
    description?: string
  }>
}

/** Content structure for certifications sections */
interface CertificationsContent {
  certifications?: Array<{
    title?: string
    issuer?: string
    description?: string
  }>
}

/** Content structure for custom sections */
interface CustomContent {
  text?: string
}

/** Union type for all section content types */
type SectionContent =
  | SummaryContent
  | SkillsContent
  | WorkExperienceContent
  | CertificationsContent
  | CustomContent
  | Record<string, unknown>

/** Section update payload */
interface SectionUpdatePayload {
  content: SectionContent
  title?: string
}

// ============================================================================
// Component Props
// ============================================================================

interface SectionEditorProps {
  section: Section
  allSections?: Section[]
  onSave: (section: Section) => void
  onClose: () => void
}

// Section types that support AI improvement
const AI_IMPROVE_SUPPORTED = ['about', 'skills', 'experience', 'custom']

// Section types that support tag suggestions
const TAG_SUGGESTION_SUPPORTED = ['certifications', 'experience']

export function SectionEditor({ section, allSections, onSave, onClose }: SectionEditorProps) {
  // Core state
  const [title, setTitle] = useState(section.title || '')
  const [content, setContent] = useState<SectionContent>(
    (section.custom_content as SectionContent) || {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI improvement state
  const [selectedTone, setSelectedTone] = useState<Tone>('concise')
  const [isImproving, setIsImproving] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // AI summary generation state
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingFromData, setIsGeneratingFromData] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // AI tag suggestion state
  const [isSuggestingTags, setIsSuggestingTags] = useState(false)
  const [suggestedTagsList, setSuggestedTagsList] = useState<SuggestedTag[]>([])
  const [tagSuggestionError, setTagSuggestionError] = useState<string | null>(null)

  // Initialize content based on section type
  useEffect(() => {
    if (!section.custom_content) {
      const defaultContent = getDefaultContent(section.section_type)
      setContent(defaultContent)
    }
  }, [section])

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setError(null)

    try {
      const updates: SectionUpdatePayload = { content }

      if (section.section_type === 'custom') {
        updates.title = title || 'Untitled Section'
      }

      const data = await apiClient.patch<{ section: Section }>(
        `/portfolio-sections/${section.id}`,
        updates
      )

      onSave(data.section)
    } catch (err) {
      console.error('Failed to save section:', err)
      setError(err instanceof Error ? err.message : 'Failed to save section')
    } finally {
      setIsSaving(false)
    }
  }, [content, title, section, onSave])

  // AI improvement handler
  const handleImproveWithAI = useCallback(async () => {
    setIsImproving(true)
    setAiError(null)

    try {
      const textToImprove = extractTextForImprovement(section.section_type, content)

      if (!textToImprove.trim()) {
        throw new Error('No content to improve')
      }

      const improved = await improveText({ text: textToImprove, tone: selectedTone })
      const updatedContent = applyImprovedText(section.section_type, content, improved)
      setContent(updatedContent)
    } catch (err) {
      console.error('Failed to improve text:', err)
      setAiError(err instanceof Error ? err.message : 'Failed to improve text')
    } finally {
      setIsImproving(false)
    }
  }, [section.section_type, content, selectedTone])

  // Summary generation handlers
  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true)
    setSummaryError(null)

    try {
      const context = extractContextFromSections(allSections)

      if (!context.certificationsText && !context.experienceText && !context.skillsText) {
        throw new Error(
          'No content found. Please add some certifications, experience, or skills first.'
        )
      }

      const summary = await generateSummary({ ...context, maxWords: 120 })
      setContent({ text: summary })
    } catch (err) {
      console.error('Failed to generate summary:', err)
      setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [allSections])

  const handleGenerateSummaryFromData = useCallback(async () => {
    setIsGeneratingFromData(true)
    setSummaryError(null)

    try {
      const data = await apiClient.post<{ summary: string }>('/ai/generate-portfolio-summary', {})
      setContent({ text: data.summary })
    } catch (err) {
      console.error('Failed to generate summary from data:', err)
      setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsGeneratingFromData(false)
    }
  }, [])

  // Tag suggestion handler
  const handleSuggestTags = useCallback(async () => {
    setIsSuggestingTags(true)
    setTagSuggestionError(null)
    setSuggestedTagsList([])

    try {
      const textToAnalyze = extractTextForTagSuggestion(section.section_type, content)

      if (!textToAnalyze.trim()) {
        throw new Error('No content available to analyze')
      }

      const tags = await suggestTags({ text: textToAnalyze, maxTags: 8 })
      setSuggestedTagsList(tags)
    } catch (err) {
      console.error('Failed to suggest tags:', err)
      setTagSuggestionError(err instanceof Error ? err.message : 'Failed to suggest tags')
    } finally {
      setIsSuggestingTags(false)
    }
  }, [section.section_type, content])

  // Add tag handler
  const handleAddTag = useCallback(
    (tagLabel: string) => {
      const workExpContent = content as WorkExperienceContent
      const currentTags = workExpContent.tags || []
      const tagExists = currentTags.some((t: string) => t.toLowerCase() === tagLabel.toLowerCase())

      if (!tagExists) {
        setContent({ ...content, tags: [...currentTags, tagLabel] } as SectionContent)
        setSuggestedTagsList((prev) =>
          prev.filter((t) => t.label.toLowerCase() !== tagLabel.toLowerCase())
        )
      }
    },
    [content]
  )

  // Feature flags
  const canUseAI = AI_IMPROVE_SUPPORTED.includes(section.section_type)
  const canSuggestTags = TAG_SUGGESTION_SUPPORTED.includes(section.section_type)
  const isSummarySection = section.section_type === 'about'
  const summaryText = (content as SummaryContent).text
  const hasSummary = Boolean(summaryText && summaryText.trim().length > 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Section
            {section.section_type === 'custom' && title && `: ${title}`}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Section type: {section.section_type}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Summary AI Toolbar */}
          {isSummarySection && (
            <SummaryAIToolbar
              hasSummary={hasSummary}
              isGeneratingSummary={isGeneratingSummary}
              isGeneratingFromData={isGeneratingFromData}
              error={summaryError}
              onGenerateFromData={handleGenerateSummaryFromData}
              onGenerateFromSections={handleGenerateSummary}
            />
          )}

          {/* Tag Suggestion Toolbar */}
          {canSuggestTags && (
            <TagSuggestionToolbar
              sectionType={section.section_type as 'certifications' | 'work_experience'}
              isSuggesting={isSuggestingTags}
              suggestedTags={suggestedTagsList}
              error={tagSuggestionError}
              onSuggest={handleSuggestTags}
              onAddTag={section.section_type !== 'certifications' ? handleAddTag : undefined}
            />
          )}

          {/* AI Improve Toolbar */}
          {canUseAI && (
            <AIImproveToolbar
              selectedTone={selectedTone}
              onToneChange={setSelectedTone}
              onImprove={handleImproveWithAI}
              isImproving={isImproving}
              error={aiError}
            />
          )}

          {/* Section Editor */}
          {renderEditor(section.section_type, {
            content,
            title,
            onContentChange: setContent,
            onTitleChange: setTitle,
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            type="button"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || section.section_type === 'certifications'}
            type="button"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper: Get default content for section type
function getDefaultContent(sectionType: string): SectionContent {
  switch (sectionType) {
    case 'about':
      return { text: '' } satisfies SummaryContent
    case 'skills':
      return { skills: [] } satisfies SkillsContent
    case 'experience':
      return { jobs: [] } satisfies WorkExperienceContent
    case 'custom':
      return { text: '' } satisfies CustomContent
    default:
      return {}
  }
}

// Helper: Extract text for AI improvement
function extractTextForImprovement(sectionType: string, content: SectionContent): string {
  switch (sectionType) {
    case 'about':
      return (content as SummaryContent).text || ''
    case 'skills':
      return ((content as SkillsContent).skills || []).join('\n')
    case 'experience':
      return (content as WorkExperienceContent).description || ''
    case 'custom':
      return (content as CustomContent).text || ''
    default:
      throw new Error('AI improvement not supported for this section type')
  }
}

// Helper: Apply improved text back to content
function applyImprovedText(
  sectionType: string,
  content: SectionContent,
  improved: string
): SectionContent {
  switch (sectionType) {
    case 'about':
      return { text: improved } satisfies SummaryContent
    case 'skills':
      return { skills: improved.split('\n').filter((s) => s.trim()) } satisfies SkillsContent
    case 'experience':
      return {
        ...(content as WorkExperienceContent),
        description: improved,
      } satisfies WorkExperienceContent
    case 'custom':
      return { text: improved } satisfies CustomContent
    default:
      return content
  }
}

// Helper: Extract context from all sections for summary generation
function extractContextFromSections(allSections?: Section[]) {
  if (!allSections) {
    return { certificationsText: undefined, experienceText: undefined, skillsText: undefined }
  }

  let certificationsText: string | undefined
  let experienceText: string | undefined
  let skillsText: string | undefined

  const certSection = allSections.find((s) => s.section_type === 'certifications')
  const certContent = certSection?.custom_content as CertificationsContent | undefined
  if (certContent?.certifications && Array.isArray(certContent.certifications)) {
    certificationsText = certContent.certifications
      .map((cert) => `${cert.title} - ${cert.issuer}`)
      .join('\n')
  }

  const expSection = allSections.find((s) => s.section_type === 'experience')
  const expContent = expSection?.custom_content as WorkExperienceContent | undefined
  if (expContent?.jobs && Array.isArray(expContent.jobs)) {
    experienceText = expContent.jobs
      .map((job) => `${job.role} at ${job.company}\n${job.description || ''}`)
      .join('\n\n')
  } else if (expContent?.description) {
    experienceText = expContent.description
  }

  const skillsSection = allSections.find((s) => s.section_type === 'skills')
  const skillsContent = skillsSection?.custom_content as SkillsContent | undefined
  if (skillsContent?.skills && Array.isArray(skillsContent.skills)) {
    skillsText = skillsContent.skills.join(', ')
  }

  return { certificationsText, experienceText, skillsText }
}

// Helper: Extract text for tag suggestion
function extractTextForTagSuggestion(sectionType: string, content: SectionContent): string {
  if (sectionType === 'certifications') {
    const certContent = content as CertificationsContent
    const certs = certContent.certifications || []
    if (!Array.isArray(certs) || certs.length === 0) return ''

    return certs
      .map((cert) => {
        const parts = [cert.title, cert.issuer]
        if (cert.description) parts.push(cert.description)
        return parts.filter(Boolean).join(' - ')
      })
      .join('\n\n')
  }

  if (sectionType === 'experience') {
    const expContent = content as WorkExperienceContent
    const parts: string[] = []

    if (expContent.role) parts.push(`Role: ${expContent.role}`)
    if (expContent.company) parts.push(`Company: ${expContent.company}`)
    if (expContent.description) parts.push(`Description: ${expContent.description}`)

    if (expContent.jobs && Array.isArray(expContent.jobs)) {
      const jobsText = expContent.jobs
        .map((job) => {
          const jobParts = []
          if (job.role) jobParts.push(`Role: ${job.role}`)
          if (job.company) jobParts.push(`Company: ${job.company}`)
          if (job.description) jobParts.push(`Description: ${job.description}`)
          return jobParts.join(' - ')
        })
        .join('\n\n')

      if (jobsText) parts.push(jobsText)
    }

    return parts.join('\n')
  }

  throw new Error('Tag suggestion not supported for this section type')
}

// Helper: Render the appropriate editor component
interface EditorProps {
  content: SectionContent
  title: string
  onContentChange: (content: SectionContent) => void
  onTitleChange: (title: string) => void
}

function renderEditor(sectionType: string, props: EditorProps) {
  switch (sectionType) {
    case 'about':
      return (
        <SummaryEditor content={props.content as SummaryContent} onChange={props.onContentChange} />
      )
    case 'skills':
      return (
        <SkillsEditor content={props.content as SkillsContent} onChange={props.onContentChange} />
      )
    case 'experience':
      return (
        <WorkExperienceEditor
          content={props.content as WorkExperienceContent}
          onChange={props.onContentChange}
        />
      )
    case 'certifications':
      return <CertificationsEditor />
    case 'custom':
      return (
        <CustomEditor
          title={props.title}
          content={props.content as CustomContent}
          onTitleChange={props.onTitleChange}
          onChange={props.onContentChange}
        />
      )
    default:
      return (
        <div className="text-sm text-gray-600">Editor not available for this section type.</div>
      )
  }
}
