/**
 * AI Template Recommender Component
 * 
 * Analyzes portfolio content and recommends optimal template,
 * theme, and section ordering.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface Recommendations {
  suggestedTemplate: string
  suggestedTheme: string
  reasoning: string
  alternativeTemplates: string[]
  alternativeThemes: string[]
  suggestedSectionOrder: string[]
}

interface AITemplateRecommenderProps {
  portfolioId: string
  sections: Section[]
  onSectionsReorder: (sections: Section[]) => void
}

export function AITemplateRecommender({ 
  portfolioId, 
  sections, 
  onSectionsReorder 
}: AITemplateRecommenderProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)

  async function handleGenerate() {
    if (sections.length === 0) {
      setError('Please add some content to your portfolio first')
      return
    }
    
    setIsGenerating(true)
    setError(null)
    setRecommendations(null)
    
    try {
      const data = await apiClient.post<Recommendations>(
        '/ai/recommend-template-theme',
        {}
      )
      
      setRecommendations(data)
      
      // If there are suggested section orders, offer to apply them
      if (data.suggestedSectionOrder && data.suggestedSectionOrder.length > 0) {
        // Reorder sections based on recommendation
        const reorderedSections = [...sections].sort((a, b) => {
          const indexA = data.suggestedSectionOrder.indexOf(a.section_type)
          const indexB = data.suggestedSectionOrder.indexOf(b.section_type)
          
          // If both found, sort by recommended order
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          // If only one found, prioritize it
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
          // Otherwise, maintain current order
          return 0
        })
        
        // Update display_order and send to server
        try {
          const reorderData = await apiClient.patch<{ sections: Section[] }>(
            '/portfolio-sections/reorder',
            {
              portfolio_id: portfolioId,
              section_ids: reorderedSections.map((s) => s.id),
            }
          )
          
          if (reorderData.sections) {
            onSectionsReorder(reorderData.sections)
          }
        } catch (error) {
          console.error('Failed to reorder sections:', error)
        }
      }
      
      // Note: Template and theme changes would need portfolio settings API
      alert(`Section order has been optimized!\n\nTo apply the recommended template (${data.suggestedTemplate}) and theme (${data.suggestedTheme}), please update your portfolio settings.`)
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate recommendations')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Recommend Template and Theme
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Get AI recommendations for template, theme, and section ordering
          </p>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || sections.length === 0}
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-yellow-600 to-orange-600 rounded-md hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Get Recommendations'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {recommendations && (
        <div className="mt-4 space-y-3">
          <div className="bg-white rounded-md p-3 border border-yellow-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h4>
            <div className="text-xs space-y-2">
              <div>
                <span className="font-medium">Template:</span> {recommendations.suggestedTemplate}
              </div>
              <div>
                <span className="font-medium">Theme:</span> {recommendations.suggestedTheme}
              </div>
              <div>
                <span className="font-medium">Reasoning:</span>
                <p className="mt-1 text-gray-600">{recommendations.reasoning}</p>
              </div>
            </div>
          </div>
          
          {recommendations.alternativeTemplates.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-yellow-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Alternative Templates</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.alternativeTemplates.map((template, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {template}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {recommendations.alternativeThemes.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-yellow-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Alternative Themes</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.alternativeThemes.map((theme, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
