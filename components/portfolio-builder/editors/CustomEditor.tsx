/**
 * Custom Section Editor
 * 
 * Editor for custom sections with title and content fields.
 */

'use client'

interface CustomContent {
  text?: string
}

interface CustomEditorProps {
  title: string
  content: CustomContent
  onTitleChange: (title: string) => void
  onChange: (content: CustomContent) => void
}

export function CustomEditor({ title, content, onTitleChange, onChange }: CustomEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Hobbies, Volunteering, etc."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <textarea
          value={content.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your custom section content..."
        />
      </div>
    </div>
  )
}
