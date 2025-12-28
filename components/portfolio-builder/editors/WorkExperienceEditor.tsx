/**
 * Work Experience Section Editor
 * 
 * Editor for work experience sections with description and tags.
 */

'use client'

interface WorkExperienceContent {
  description?: string
  tags?: string[]
  jobs?: Array<{
    role?: string
    company?: string
    description?: string
  }>
}

interface WorkExperienceEditorProps {
  content: WorkExperienceContent
  onChange: (content: WorkExperienceContent) => void
}

export function WorkExperienceEditor({ content, onChange }: WorkExperienceEditorProps) {
  const tags = content.tags || []
  
  function handleRemoveTag(index: number) {
    const newTags = [...tags]
    newTags.splice(index, 1)
    onChange({ ...content, tags: newTags })
  }
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Work Experience (simplified for now)
      </label>
      <textarea
        value={content.description || ''}
        onChange={(e) => onChange({ ...content, description: e.target.value })}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Describe your work experience..."
      />
      <p className="text-xs text-gray-500">
        Full work experience editor coming soon
      </p>
      
      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(index)}
                className="text-blue-600 hover:text-blue-800 ml-1"
                type="button"
                aria-label={`Remove tag ${tag}`}
              >
                x
              </button>
            </div>
          ))}
          {tags.length === 0 && (
            <p className="text-xs text-gray-500">No tags yet. Use AI to suggest some!</p>
          )}
        </div>
      </div>
    </div>
  )
}
