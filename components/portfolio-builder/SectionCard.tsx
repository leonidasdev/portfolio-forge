/**
 * Section Card Component
 * 
 * Displays a single portfolio section with drag handle,
 * edit, and delete actions.
 * 
 * Uses dnd-kit's useSortable hook for drag-and-drop.
 * Integrates with SectionRenderer to display section content.
 */

'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SectionRenderer } from '@/components/portfolio-sections/SectionRenderer'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface SectionCardProps {
  section: Section
  onEdit: () => void
  onDelete: () => void
}

export function SectionCard({ section, onEdit, onDelete }: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  // Get section type label
  function getTypeLabel(type: string): string {
    switch (type) {
      case 'summary':
        return 'Summary'
      case 'skills':
        return 'Skills'
      case 'work_experience':
        return 'Work Experience'
      case 'projects':
        return 'Projects'
      case 'certifications':
        return 'Certifications'
      case 'custom':
        return 'Custom'
      default:
        return type
    }
  }
  
  // Get section type color
  function getTypeColor(type: string): string {
    switch (type) {
      case 'summary':
        return 'bg-blue-100 text-blue-800'
      case 'skills':
        return 'bg-green-100 text-green-800'
      case 'work_experience':
        return 'bg-purple-100 text-purple-800'
      case 'projects':
        return 'bg-orange-100 text-orange-800'
      case 'certifications':
        return 'bg-pink-100 text-pink-800'
      case 'custom':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Header with drag handle and actions */}
      <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        {/* Section info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(section.section_type)}`}>
              {getTypeLabel(section.section_type)}
            </span>
            {section.title && (
              <span className="text-sm font-medium text-gray-900">
                {section.title}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Position: {section.display_order}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Section content preview (edit mode) */}
      <div className="p-4">
        <SectionRenderer section={section} mode="edit" />
      </div>
    </div>
  )
}
