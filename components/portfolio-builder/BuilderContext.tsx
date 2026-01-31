/**
 * Builder Context
 *
 * Provides centralized state management for the Portfolio Builder.
 * Manages sections, editing state, and provides actions for CRUD operations.
 */

'use client'

import { AlertModal, ConfirmModal } from '@/components/ui/Modal'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

// Context state interface
interface BuilderState {
  portfolio: Portfolio
  sections: Section[]
  editingSection: Section | null
  isReordering: boolean
  isSaving: boolean
}

// Context actions interface
interface BuilderActions {
  // Section CRUD
  addSection: (section: Section) => void
  updateSection: (section: Section) => void
  deleteSection: (sectionId: string) => Promise<void>
  reorderSections: (newOrder: Section[]) => Promise<void>

  // Editing state
  setEditingSection: (section: Section | null) => void

  // Bulk updates (for AI features)
  setSections: (sections: Section[]) => void
  replaceSections: (sections: Section[]) => Promise<void>

  // Confirmation state (for modal-based confirmations)
  pendingDeleteSectionId: string | null
  setPendingDeleteSectionId: (id: string | null) => void
  confirmDeleteSection: () => Promise<void>

  // Error state
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
}

// Combined context type
interface BuilderContextType extends BuilderState, BuilderActions {}

// Create context
const BuilderContext = createContext<BuilderContextType | null>(null)

// Provider props
interface BuilderProviderProps {
  children: ReactNode
  portfolio: Portfolio
  initialSections: Section[]
}

/**
 * BuilderProvider
 *
 * Wraps the portfolio builder and provides state management.
 */
export function BuilderProvider({ children, portfolio, initialSections }: BuilderProviderProps) {
  const router = useRouter()

  // Core state
  const [sections, setSectionsState] = useState<Section[]>(initialSections)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingDeleteSectionId, setPendingDeleteSectionId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Add a new section
  const addSection = useCallback((section: Section) => {
    setSectionsState((prev) => [...prev, section])
  }, [])

  // Update an existing section
  const updateSection = useCallback((updatedSection: Section) => {
    setSectionsState((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)))
    setEditingSection(null)
  }, [])

  // Delete a section - now uses modal-based confirmation
  const deleteSection = useCallback(async (sectionId: string) => {
    // Set the pending delete ID to trigger confirmation modal
    setPendingDeleteSectionId(sectionId)
  }, [])

  // Confirm and execute delete
  const confirmDeleteSection = useCallback(async () => {
    if (!pendingDeleteSectionId) return

    const sectionId = pendingDeleteSectionId
    setPendingDeleteSectionId(null)

    try {
      await apiClient.delete(`/portfolio-sections/${sectionId}`)
      setSectionsState((prev) => prev.filter((s) => s.id !== sectionId))
      router.refresh()
    } catch (error) {
      console.error('Failed to delete section:', error)
      setErrorMessage('Failed to delete section. Please try again.')
    }
  }, [pendingDeleteSectionId, router])

  // Reorder sections (for drag and drop)
  const reorderSections = useCallback(
    async (newOrder: Section[]) => {
      // Optimistically update UI
      setSectionsState(newOrder)
      setIsReordering(true)

      try {
        const data = await apiClient.patch<{ sections: Section[] }>('/portfolio-sections/reorder', {
          portfolio_id: portfolio.id,
          section_ids: newOrder.map((s) => s.id),
        })

        // Update with server response to ensure consistency
        if (data.sections) {
          setSectionsState(data.sections)
        }
      } catch (error) {
        console.error('Failed to reorder sections:', error)
        setErrorMessage('Failed to save new order. Please refresh the page.')
        // Revert on error
        setSectionsState(initialSections)
      } finally {
        setIsReordering(false)
      }
    },
    [portfolio.id, initialSections]
  )

  // Direct setter for sections (used by AI features)
  const setSections = useCallback((newSections: Section[]) => {
    setSectionsState(newSections)
  }, [])

  // Replace all sections (used by resume generator)
  const replaceSections = useCallback(
    async (newSections: Section[]) => {
      setIsSaving(true)

      try {
        // Delete all existing sections
        for (const section of sections) {
          try {
            await apiClient.delete(`/portfolio-sections/${section.id}`)
          } catch (err) {
            console.error('Failed to delete section:', err)
          }
        }

        // Create new sections
        const createdSections: Section[] = []
        for (const sectionData of newSections) {
          try {
            // Spread sectionData first, then override portfolio_id to ensure correct value
            const { portfolio_id: _existingPortfolioId, ...restSectionData } = sectionData
            const created = await apiClient.post<{ section: Section }>('/portfolio-sections', {
              ...restSectionData,
              portfolio_id: portfolio.id,
            })
            createdSections.push(created.section)
          } catch (err) {
            console.error('Failed to create section:', err)
          }
        }

        setSectionsState(createdSections)
        router.refresh()
      } catch (error) {
        console.error('Failed to replace sections:', error)
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [sections, portfolio.id, router]
  )

  // Context value
  const value: BuilderContextType = {
    // State
    portfolio,
    sections,
    editingSection,
    isReordering,
    isSaving,

    // Actions
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    setEditingSection,
    setSections,
    replaceSections,

    // Confirmation state
    pendingDeleteSectionId,
    setPendingDeleteSectionId,
    confirmDeleteSection,

    // Error state
    errorMessage,
    setErrorMessage,
  }

  return (
    <BuilderContext.Provider value={value}>
      {children}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!pendingDeleteSectionId}
        onClose={() => setPendingDeleteSectionId(null)}
        onConfirm={confirmDeleteSection}
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Error alert modal */}
      <AlertModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Error"
        message={errorMessage || ''}
        type="error"
      />
    </BuilderContext.Provider>
  )
}

/**
 * useBuilder hook
 *
 * Provides access to builder context.
 * Must be used within a BuilderProvider.
 */
export function useBuilder() {
  const context = useContext(BuilderContext)

  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider')
  }

  return context
}

// Export types for use in components
export type { BuilderActions, BuilderContextType, BuilderState }
