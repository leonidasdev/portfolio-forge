/**
 * Section Add Menu Component
 * 
 * Allows users to add new sections to their portfolio.
 * Displays a menu of available section types.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface SectionAddMenuProps {
  portfolioId: string
  onSectionAdded: (section: Section) => void
}

export function SectionAddMenu({ portfolioId, onSectionAdded }: SectionAddMenuProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const sectionTypes = [
    { type: 'summary', label: 'Summary', description: 'A brief introduction about yourself' },
    { type: 'skills', label: 'Skills', description: 'Your technical and soft skills' },
    { type: 'work_experience', label: 'Work Experience', description: 'Your employment history' },
    { type: 'projects', label: 'Projects', description: 'Your personal and professional projects' },
    { type: 'certifications', label: 'Certifications', description: 'Your certifications and credentials' },
    { type: 'custom', label: 'Custom', description: 'A custom section with your own content' },
  ]
  
  async function handleAddSection(sectionType: string) {
    setIsAdding(true)
    setError(null)
    
    try {
      const data = await apiClient.post<{ section: Section }>('/portfolio-sections', {
        portfolio_id: portfolioId,
        section_type: sectionType,
        title: sectionType === 'custom' ? 'Untitled Section' : null,
        content: null,
        settings: null,
      })
      
      onSectionAdded(data.section)
    } catch (err) {
      console.error('Failed to add section:', err)
      setError(err instanceof Error ? err.message : 'Failed to add section')
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Add Section
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sectionTypes.map((section) => (
          <button
            key={section.type}
            onClick={() => handleAddSection(section.type)}
            disabled={isAdding}
            className="text-left p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-medium text-gray-900">
              {section.label}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {section.description}
            </div>
          </button>
        ))}
      </div>
      
      {isAdding && (
        <div className="text-sm text-gray-600 text-center">
          Adding section...
        </div>
      )}
    </div>
  )
}
