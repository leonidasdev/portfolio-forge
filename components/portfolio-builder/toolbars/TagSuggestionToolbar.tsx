/**
 * Tag Suggestion Toolbar
 * 
 * Toolbar for AI-powered tag suggestions.
 * Supports certifications and work experience sections.
 */

'use client'

import type { SuggestedTag } from '@/hooks/useSuggestTags'

interface TagSuggestionToolbarProps {
  sectionType: 'certifications' | 'work_experience'
  isSuggesting: boolean
  suggestedTags: SuggestedTag[]
  error: string | null
  onSuggest: () => void
  onAddTag?: (label: string) => void
}

export function TagSuggestionToolbar({
  sectionType,
  isSuggesting,
  suggestedTags,
  error,
  onSuggest,
  onAddTag,
}: TagSuggestionToolbarProps) {
  const isCertifications = sectionType === 'certifications'
  
  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">
            AI Tag Suggestions
          </span>
          <p className="text-xs text-gray-600 mt-1">
            {isCertifications 
              ? 'Generate relevant tags to see what topics this section covers'
              : 'Generate relevant tags based on your content'
            }
          </p>
        </div>
        
        <button
          onClick={onSuggest}
          disabled={isSuggesting}
          type="button"
          className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-md hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
        >
          {isSuggesting ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner />
              Suggesting...
            </span>
          ) : (
            'Suggest Tags'
          )}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {suggestedTags.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            {isCertifications ? 'Suggested Tags (view only):' : 'Suggested Tags:'}
          </p>
          {isCertifications && (
            <p className="text-xs text-gray-600 mb-2">
              Add these tags to individual certifications on the Certifications page
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-orange-200 rounded-full text-sm"
              >
                <span className="text-gray-700">{tag.label}</span>
                <span className="text-xs text-gray-500">
                  {Math.round(tag.confidence * 100)}%
                </span>
                {!isCertifications && onAddTag && (
                  <button
                    onClick={() => onAddTag(tag.label)}
                    type="button"
                    className="ml-1 text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
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
