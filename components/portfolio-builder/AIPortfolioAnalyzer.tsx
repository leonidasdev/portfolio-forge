/**
 * AI Portfolio Analyzer Component
 * 
 * Analyzes portfolio quality with comprehensive scoring and
 * actionable recommendations for improvement.
 */

'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface AnalysisRecommendation {
  sectionId: string
  sectionType: string
  title: string
  description: string
  suggestedRewrite?: string
}

interface PortfolioAnalysis {
  score: number
  subscores: {
    clarity: number
    technicalDepth: number
    seniority: number
    atsAlignment: number
    completeness: number
    toneConsistency: number
  }
  strengths: string[]
  improvements: string[]
  recommendations: AnalysisRecommendation[]
}

interface AIPortfolioAnalyzerProps {
  sections: Section[]
  onApplyRecommendation: (recommendation: AnalysisRecommendation) => void
}

export function AIPortfolioAnalyzer({ 
  sections, 
  onApplyRecommendation 
}: AIPortfolioAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)

  async function handleAnalyze() {
    if (sections.length === 0) {
      setError('Please add some content to your portfolio first')
      return
    }
    
    setIsAnalyzing(true)
    setError(null)
    setAnalysis(null)
    
    try {
      const data = await apiClient.post<PortfolioAnalysis>(
        '/ai/analyze-portfolio',
        {}
      )
      
      setAnalysis(data)
    } catch (error) {
      console.error('Failed to analyze portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to analyze portfolio')
    } finally {
      setIsAnalyzing(false)
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Analyze Portfolio Quality
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Get a comprehensive score, detailed subscores, and actionable recommendations
          </p>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || sections.length === 0}
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-md hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Portfolio'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {analysis && (
        <div className="mt-4 space-y-3">
          {/* Overall Score */}
          <div className="bg-white rounded-md p-4 border border-cyan-200">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </div>
              <div className="text-xs text-gray-600 mt-1">Overall Score</div>
            </div>
          </div>
          
          {/* Subscores */}
          <div className="bg-white rounded-md p-3 border border-cyan-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Detailed Scores</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(analysis.subscores).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className={`font-semibold ${getScoreColor(value)}`}>{value}/100</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-cyan-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Strengths</h4>
              <ul className="text-xs space-y-1">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500">+</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Improvements */}
          {analysis.improvements.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-cyan-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Areas for Improvement</h4>
              <ul className="text-xs space-y-1">
                {analysis.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-white rounded-md p-3 border border-cyan-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Recommendations ({analysis.recommendations.length})
              </h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="border-l-2 border-cyan-300 pl-3 py-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-900">{rec.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{rec.description}</div>
                      </div>
                      {rec.suggestedRewrite && (
                        <button
                          onClick={() => onApplyRecommendation(rec)}
                          className="px-2 py-1 text-xs text-white bg-cyan-600 rounded hover:bg-cyan-700 transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
