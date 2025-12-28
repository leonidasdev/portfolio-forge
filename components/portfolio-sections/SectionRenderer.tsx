/**
 * Section Renderer Component
 * 
 * Dynamically renders the appropriate section component
 * based on the section type using the registry.
 */

import { getSectionComponent } from './registry'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface SectionRendererProps {
  section: Section
  mode: 'edit' | 'view'
}

export function SectionRenderer({ section, mode }: SectionRendererProps) {
  const SectionComponent = getSectionComponent(section.section_type)
  
  if (!SectionComponent) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
        <p className="text-sm text-yellow-800">
          Unknown section type: <code>{section.section_type}</code>
        </p>
      </div>
    )
  }
  
  return <SectionComponent section={section} mode={mode} />
}
