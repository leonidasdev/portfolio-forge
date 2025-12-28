/**
 * Summary AI Toolbar
 * 
 * Toolbar for AI-powered summary generation.
 * Supports generation from database data or section content.
 */

'use client'

interface SummaryAIToolbarProps {
  hasSummary: boolean
  isGeneratingSummary: boolean
  isGeneratingFromData: boolean
  error: string | null
  onGenerateFromData: () => void
  onGenerateFromSections: () => void
}

export function SummaryAIToolbar({
  hasSummary,
  isGeneratingSummary,
  isGeneratingFromData,
  error,
  onGenerateFromData,
  onGenerateFromSections,
}: SummaryAIToolbarProps) {
  const isLoading = isGeneratingSummary || isGeneratingFromData
  
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg">
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-700">
            AI Summary Generator
          </span>
          <p className="text-xs text-gray-600 mt-1">
            Generate a professional summary from your portfolio data
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Generate from database data */}
          <button
            onClick={onGenerateFromData}
            disabled={isLoading}
            type="button"
            className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-md hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingFromData ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Generating...
              </span>
            ) : (
              'Generate from my data'
            )}
          </button>
          
          {/* Generate from other sections */}
          <button
            onClick={onGenerateFromSections}
            disabled={isLoading}
            type="button"
            className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-md hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGeneratingSummary ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Generating...
              </span>
            ) : (
              hasSummary ? 'Rewrite from sections' : 'Generate from sections'
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500">
          Tip: "From my data" uses your saved certifications, experience, and skills. "From sections" uses current portfolio section content.
        </p>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4" 
        fill="none" 
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
      />
    </svg>
  )
}
