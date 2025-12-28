/**
 * Template Registry
 * 
 * Maps template IDs to their corresponding layout components.
 * Each template component receives portfolio, sections, and theme props.
 * Templates use SectionRenderer to render individual sections.
 */

import { SingleColumnTemplate } from './SingleColumnTemplate'
import { TwoColumnTemplate } from './TwoColumnTemplate'
import { TimelineTemplate } from './TimelineTemplate'
import { GridTemplate } from './GridTemplate'
import type { Database } from '@/lib/supabase/types'
import type { Theme } from '@/lib/templates-themes/definitions'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

export interface TemplateComponentProps {
  portfolio: Portfolio
  sections: Section[]
  theme: Theme
}

export type TemplateComponent = React.ComponentType<TemplateComponentProps>

/**
 * Registry mapping template layout types to components
 */
export const templateRegistry: Record<string, TemplateComponent> = {
  'single-column': SingleColumnTemplate,
  'two-column': TwoColumnTemplate,
  'timeline': TimelineTemplate,
  'grid': GridTemplate,
}

/**
 * Check if a template layout type is registered
 */
export function isRegisteredTemplate(layout: string): layout is keyof typeof templateRegistry {
  return layout in templateRegistry
}

/**
 * Get template component by layout type
 */
export function getTemplateComponent(layout: string): TemplateComponent | null {
  if (!isRegisteredTemplate(layout)) {
    console.warn(`Unknown template layout: ${layout}`)
    return null
  }
  return templateRegistry[layout]
}
