/**
 * Section Components Registry
 *
 * Maps section types to their corresponding React components.
 * This allows dynamic rendering of sections based on type.
 */

import type { Database } from '@/lib/supabase/types'
import type { ComponentType } from 'react'
import { CertificationsSection } from './CertificationsSection'
import { CustomSection } from './CustomSection'
import { ExperienceSection } from './ExperienceSection'
import { SkillsSection } from './SkillsSection'
import { SummarySection } from './SummarySection'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

export interface SectionComponentProps {
  section: Section
  mode: 'edit' | 'view'
}

// Registry of section type → component
export const sectionRegistry: Record<string, ComponentType<SectionComponentProps>> = {
  about: SummarySection,
  skills: SkillsSection,
  experience: ExperienceSection,
  projects: ExperienceSection, // Reuse experience for now
  certifications: CertificationsSection,
  custom: CustomSection,
}

// Helper to check if a section type is registered
export function isRegisteredSectionType(type: string): boolean {
  return type in sectionRegistry
}

// Helper to get component for a section type
export function getSectionComponent(type: string): ComponentType<SectionComponentProps> | null {
  return sectionRegistry[type] || null
}
