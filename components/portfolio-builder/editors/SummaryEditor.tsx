/**
 * Summary Section Editor
 * 
 * Editor for summary/about sections with text area input.
 */

'use client'

interface SummaryContent {
  text?: string
}

interface SummaryEditorProps {
  content: SummaryContent
  onChange: (content: SummaryContent) => void
}

export function SummaryEditor({ content, onChange }: SummaryEditorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Summary Text
      </label>
      <textarea
        value={content.text || ''}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write a brief summary about yourself..."
      />
    </div>
  )
}
