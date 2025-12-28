/**
 * Skills Section Editor
 * 
 * Editor for skills sections with multi-line text input.
 * Each line represents a skill.
 */

'use client'

interface SkillsContent {
  skills?: string[]
}

interface SkillsEditorProps {
  content: SkillsContent
  onChange: (content: SkillsContent) => void
}

export function SkillsEditor({ content, onChange }: SkillsEditorProps) {
  const skills = content.skills || []
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Skills (one per line)
      </label>
      <textarea
        value={skills.join('\n')}
        onChange={(e) => onChange({ 
          skills: e.target.value.split('\n').filter(s => s.trim()) 
        })}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="JavaScript&#10;React&#10;TypeScript&#10;..."
      />
      <p className="mt-2 text-xs text-gray-500">
        {skills.length} skill(s)
      </p>
    </div>
  )
}
