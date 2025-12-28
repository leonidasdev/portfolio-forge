/**
 * Tag Selector Component
 * 
 * Reusable component for selecting tags and managing them inline.
 * 
 * Features:
 * - Display all user's tags as selectable chips
 * - Select/unselect tags
 * - Create new tag inline
 * - Delete tag (with confirmation)
 * - Minimal UI with good UX
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Database } from '@/lib/supabase/types'

type Tag = Database['public']['Tables']['tags']['Row']

interface TagSelectorProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Load all tags on mount
  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await apiClient.get<{ tags: Tag[] }>('/tags')
      setAllTags(data.tags || [])
    } catch (err) {
      console.error('Failed to load tags:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle tag selection
  function toggleTag(tag: Tag) {
    const isSelected = selectedTags.some((t) => t.id === tag.id)
    
    if (isSelected) {
      onChange(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  // Create new tag
  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newTagName.trim()) return
    
    setIsCreating(true)
    setError(null)
    
    try {
      const data = await apiClient.post<{ tag: Tag }>('/tags', { 
        name: newTagName.trim() 
      })
      const newTag = data.tag
      
      // Add to all tags
      setAllTags([...allTags, newTag])
      
      // Auto-select the newly created tag
      onChange([...selectedTags, newTag])
      
      // Reset form
      setNewTagName('')
    } catch (err) {
      console.error('Failed to create tag:', err)
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setIsCreating(false)
    }
  }

  // Delete tag
  async function handleDeleteTag(tag: Tag, e: React.MouseEvent) {
    e.stopPropagation() // Prevent tag toggle
    
    const confirmed = confirm(
      `Are you sure you want to delete the tag "${tag.name}"?\n\nThis will remove it from all certifications, projects, skills, and work experience.`
    )
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/tags/${tag.id}`)
      
      // Remove from all tags
      setAllTags(allTags.filter((t) => t.id !== tag.id))
      
      // Remove from selected tags
      onChange(selectedTags.filter((t) => t.id !== tag.id))
    } catch (err) {
      console.error('Failed to delete tag:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2 text-sm text-gray-600">Loading tags...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Selected tags display */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Select tags ({selectedTags.length} selected)
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const isSelected = selectedTags.some((t) => t.id === tag.id)
              
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`group relative inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                  
                  {/* Delete button (shows on hover) */}
                  <span
                    onClick={(e) => handleDeleteTag(tag, e)}
                    className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete tag"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Create new tag form */}
      <div>
        <form onSubmit={handleCreateTag} className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Create new tag..."
            maxLength={50}
            disabled={isCreating}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isCreating || !newTagName.trim()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
          >
            {isCreating ? 'Creating...' : '+ Add Tag'}
          </button>
        </form>
        <p className="mt-1 text-xs text-gray-500">
          Create tags to organize your certifications, projects, skills, and work experience
        </p>
      </div>
    </div>
  )
}
