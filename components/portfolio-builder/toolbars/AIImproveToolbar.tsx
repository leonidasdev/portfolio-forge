/**
 * AI Improve Toolbar
 * 
 * Toolbar component for AI-powered text improvement.
 * Allows selecting tone and triggering improvement.
 */

'use client'

import type { Tone } from '@/hooks/useImproveText'

interface AIImproveToolbarProps {
  selectedTone: Tone
  onToneChange: (tone: Tone) => void
  onImprove: () => void
  isImproving: boolean
  error: string | null
}

export function AIImproveToolbar({
  selectedTone,
  onToneChange,
  onImprove,
  isImproving,
  error,
}: AIImproveToolbarProps) {
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Improve with AI:
          </span>
          <select
            value={selectedTone}
            onChange={(e) => onToneChange(e.target.value as Tone)}
            disabled={isImproving}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <option value="concise">Concise</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="senior">Senior</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        
        <button
          onClick={onImprove}
          disabled={isImproving}
          type="button"
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isImproving ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner />
              Improving...
            </span>
          ) : (
            'Improve with AI'
          )}
        </button>
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
