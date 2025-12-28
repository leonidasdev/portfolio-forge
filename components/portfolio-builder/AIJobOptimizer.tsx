/**
 * AI Job Optimizer Component
 * 
 * Optimizes portfolio sections based on a job description.
 * Analyzes job requirements and tailors content to match.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface OptimizationResults {
  suggestedSkills: string[]
  jobInsights: {
    matches: string[]
    gaps: string[]
    suggestions: string[]
  }
}

interface AIJobOptimizerProps {
  sections: Section[]
  onSectionsUpdate: (sections: Section[]) => void
}

export function AIJobOptimizer({ sections, onSectionsUpdate }: AIJobOptimizerProps) {
  const [showOptimizer, setShowOptimizer] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<OptimizationResults | null>(null)

  async function handleOptimize() {
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }
    
    if (jobDescription.trim().length < 50) {
      setError('Job description must be at least 50 characters')
      return
    }
    
    setIsOptimizing(true)
    setError(null)
    setResults(null)
    
    try {
      const data = await apiClient.post<{ 
        updatedSections: any[]
        suggestedSkills: string[]
        jobInsights: { matches: string[], gaps: string[], suggestions: string[] }
      }>(
        '/ai/optimize-portfolio-for-job',
        { jobDescription }
      )
      
      const { updatedSections, suggestedSkills, jobInsights } = data
      
      // Update sections with optimized content
      const optimizedSections = sections.map((section) => {
        const updated = updatedSections.find((u: any) => u.id === section.id)
        if (updated) {
          return {
            ...section,
            content: updated.updatedContent,
          }
        }
        return section
      })
      
      onSectionsUpdate(optimizedSections)
      
      // Store results for display
      setResults({
        suggestedSkills,
        jobInsights,
      })
      
      alert(`Successfully optimized ${updatedSections.length} section(s) for the job!`)
    } catch (error) {
      console.error('Failed to optimize portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to optimize portfolio')
    } finally {
      setIsOptimizing(false)
    }
  }

  if (!showOptimizer) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Optimize for Job
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Tailor your portfolio content to match a specific job description
            </p>
          </div>
          
          <button
            onClick={() => setShowOptimizer(true)}
            disabled={sections.length === 0}
            className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-md hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Open Optimizer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Optimize for Job
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Paste a job description below to tailor your portfolio
          </p>
        </div>
        
        <button
          onClick={() => setShowOptimizer(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
        disabled={isOptimizing}
      />
      
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">
          {jobDescription.length} characters (min 50)
        </span>
        
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || jobDescription.trim().length < 50}
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-md hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isOptimizing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Optimizing...
            </span>
          ) : (
            'Optimize Portfolio'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {results && (
        <div className="mt-4 space-y-3">
          <div className="bg-white rounded-md p-3 border border-green-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Suggested Skills</h4>
            <div className="flex flex-wrap gap-2">
              {results.suggestedSkills.map((skill, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-md p-3 border border-green-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Insights</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium text-green-600">Matches:</span>
                <ul className="ml-4 mt-1 space-y-1">
                  {results.jobInsights.matches.map((match, i) => (
                    <li key={i}>• {match}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-medium text-orange-600">Gaps:</span>
                <ul className="ml-4 mt-1 space-y-1">
                  {results.jobInsights.gaps.map((gap, i) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
