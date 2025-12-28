/**
 * AI Resume Generator Component
 * 
 * Generates portfolio sections from resume text.
 * Extracts structured data and creates appropriate sections.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface ResumeGenerationResult {
  suggestedTemplate: string
  suggestedTheme: string
}

interface AIResumeGeneratorProps {
  portfolioId: string
  sections: Section[]
  onSectionsReplace: (sections: Section[]) => void
}

export function AIResumeGenerator({ 
  portfolioId, 
  sections, 
  onSectionsReplace 
}: AIResumeGeneratorProps) {
  const [showGenerator, setShowGenerator] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResumeGenerationResult | null>(null)

  async function handleGenerate() {
    if (!resumeText.trim()) {
      setError('Please paste your resume text')
      return
    }
    
    if (resumeText.trim().length < 100) {
      setError('Resume text must be at least 100 characters')
      return
    }
    
    const confirmed = confirm(
      'Generate portfolio from resume?\n\nThis will DELETE all existing sections and create new ones from your resume.\n\nThis action cannot be undone.'
    )
    
    if (!confirmed) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const data = await apiClient.post<{
        sections: any[]
        suggestedTemplate: string
        suggestedTheme: string
      }>(
        '/ai/generate-portfolio-from-resume',
        { resumeText }
      )
      
      const { sections: newSections, suggestedTemplate, suggestedTheme } = data
      
      // Delete all existing sections
      for (const section of sections) {
        try {
          await apiClient.delete(`/portfolio-sections/${section.id}`)
        } catch (err) {
          console.error('Failed to delete section:', err)
        }
      }
      
      // Create new sections from resume
      const createdSections: Section[] = []
      for (const sectionData of newSections) {
        try {
          const created = await apiClient.post<{ section: Section }>(
            '/portfolio-sections',
            {
              portfolio_id: portfolioId,
              ...sectionData,
            }
          )
          createdSections.push(created.section)
        } catch (err) {
          console.error('Failed to create section:', err)
        }
      }
      
      // Update parent state
      onSectionsReplace(createdSections)
      
      // Store results
      setResult({
        suggestedTemplate,
        suggestedTheme,
      })
      
      alert(`Successfully generated ${createdSections.length} section(s) from your resume!`)
      
      // Clear form
      setResumeText('')
      setShowGenerator(false)
    } catch (error) {
      console.error('Failed to generate portfolio from resume:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate portfolio from resume')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!showGenerator) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Generate from Resume
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Paste your resume text and AI will create sections automatically
            </p>
          </div>
          
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Open Generator
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Generate from Resume
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Paste your resume text below (will replace all existing sections)
          </p>
        </div>
        
        <button
          onClick={() => setShowGenerator(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume text here..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
        disabled={isGenerating}
      />
      
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">
          {resumeText.length} characters (min 100)
        </span>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || resumeText.trim().length < 100}
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Portfolio'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 bg-white rounded-md p-3 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h4>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Template:</span> {result.suggestedTemplate}</p>
            <p><span className="font-medium">Theme:</span> {result.suggestedTheme}</p>
          </div>
        </div>
      )}
    </div>
  )
}
