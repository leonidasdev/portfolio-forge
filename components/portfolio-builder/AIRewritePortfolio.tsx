/**
 * AI Rewrite Portfolio Component
 * 
 * Allows users to rewrite all portfolio sections in a specific tone.
 * Uses AI to maintain content while adjusting writing style.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']
type Tone = 'concise' | 'formal' | 'senior' | 'technical'

interface AIRewritePortfolioProps {
  sections: Section[]
  onSectionsUpdate: (sections: Section[]) => void
}

export function AIRewritePortfolio({ sections, onSectionsUpdate }: AIRewritePortfolioProps) {
  const [tone, setTone] = useState<Tone>('concise')
  const [isRewriting, setIsRewriting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRewrite() {
    const confirmed = confirm(
      `Rewrite entire portfolio with AI?\n\nThis will rewrite all text sections (summary, skills, experience, custom) in a ${tone} tone.\n\nYou can save or discard changes after reviewing.`
    )
    
    if (!confirmed) return
    
    setIsRewriting(true)
    setError(null)
    
    try {
      const data = await apiClient.post<{ sections: any[] }>(
        '/ai/rewrite-portfolio',
        { tone }
      )
      
      const rewrittenSections = data.sections || []
      
      // Update sections with rewritten content
      const updatedSections = sections.map((section) => {
        const rewritten = rewrittenSections.find((r: any) => r.id === section.id)
        if (rewritten) {
          return {
            ...section,
            content: rewritten.updatedContent,
          }
        }
        return section
      })
      
      onSectionsUpdate(updatedSections)
      alert(`Successfully rewrote ${rewrittenSections.length} section(s)!`)
    } catch (error) {
      console.error('Failed to rewrite portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to rewrite portfolio')
      alert('Failed to rewrite portfolio. Please try again.')
    } finally {
      setIsRewriting(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            AI Rewrite Portfolio
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Rewrite all sections in a specific tone while maintaining content
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isRewriting}
          >
            <option value="concise">Concise</option>
            <option value="formal">Formal</option>
            <option value="senior">Senior</option>
            <option value="technical">Technical</option>
          </select>
          
          <button
            onClick={handleRewrite}
            disabled={isRewriting || sections.length === 0}
            className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRewriting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rewriting...
              </span>
            ) : (
              'Rewrite All Sections'
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
