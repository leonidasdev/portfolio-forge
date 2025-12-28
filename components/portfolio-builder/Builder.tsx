/**
 * Portfolio Builder Component
 * 
 * Client component that manages the drag-and-drop interface
 * for building portfolio sections.
 * 
 * Uses:
 * - BuilderContext for state management
 * - dnd-kit for drag-and-drop functionality
 * - Modular AI feature components
 */

'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { BuilderProvider, useBuilder } from './BuilderContext'
import { SectionCard } from './SectionCard'
import { SectionAddMenu } from './SectionAddMenu'
import { SectionEditor } from './SectionEditor'
import { AIRewritePortfolio } from './AIRewritePortfolio'
import { AIJobOptimizer } from './AIJobOptimizer'
import { AIResumeGenerator } from './AIResumeGenerator'
import { AITemplateRecommender } from './AITemplateRecommender'
import { AIPortfolioAnalyzer } from './AIPortfolioAnalyzer'
import type { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface BuilderProps {
  portfolio: Portfolio
  initialSections: Section[]
}

/**
 * Builder wrapper that provides context
 */
export function Builder({ portfolio, initialSections }: BuilderProps) {
  return (
    <BuilderProvider portfolio={portfolio} initialSections={initialSections}>
      <BuilderContent />
    </BuilderProvider>
  )
}

/**
 * BuilderContent - Main builder UI
 * Uses context for all state management
 */
function BuilderContent() {
  const {
    portfolio,
    sections,
    editingSection,
    isReordering,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    setEditingSection,
    setSections,
    replaceSections,
  } = useBuilder()
  
  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Handle drag end
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    
    const newSections = arrayMove(sections, oldIndex, newIndex)
    await reorderSections(newSections)
  }
  
  return (
    <div className="space-y-6">
      {/* Add section menu */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <SectionAddMenu 
          portfolioId={portfolio.id}
          onSectionAdded={addSection}
        />
      </div>
      
      {/* AI Features - Only show when there are sections */}
      {sections.length > 0 && (
        <div className="space-y-4">
          {/* Portfolio Analyzer */}
          <AIPortfolioAnalyzer 
            sections={sections}
            onApplyRecommendation={(rec) => {
              // Handle applying a fix recommendation
              const section = sections.find(s => s.id === rec.sectionId)
              if (section && rec.suggestedRewrite) {
                const updatedContent = section.section_type === 'summary'
                  ? { text: rec.suggestedRewrite }
                  : { ...section.content, description: rec.suggestedRewrite }
                
                updateSection({ ...section, content: updatedContent })
              }
            }}
          />
          
          {/* Template Recommender */}
          <AITemplateRecommender 
            portfolioId={portfolio.id}
            sections={sections}
            onSectionsReorder={setSections}
          />
          
          {/* Rewrite Portfolio */}
          <AIRewritePortfolio 
            sections={sections}
            onSectionsUpdate={setSections}
          />
          
          {/* Job Optimizer */}
          <AIJobOptimizer 
            sections={sections}
            onSectionsUpdate={setSections}
          />
        </div>
      )}
      
      {/* Resume Generator - Always visible */}
      <AIResumeGenerator 
        portfolioId={portfolio.id}
        sections={sections}
        onSectionsReplace={replaceSections}
      />
      
      {/* Sections list with drag and drop */}
      {sections.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onEdit={() => setEditingSection(section)}
                  onDelete={() => deleteSection(section.id)}
                  disabled={isReordering}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      
      {/* Empty state */}
      {sections.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="text-4xl mb-3 text-gray-400">[+]</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No sections yet
          </h3>
          <p className="text-sm text-gray-500">
            Add your first section using the menu above, or generate from your resume.
          </p>
        </div>
      )}
      
      {/* Section editor modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={updateSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  )
}
