/**
 * Section Components Registry
 * 
 * Maps section types to their corresponding React components.
 * This allows dynamic rendering of sections based on type.
 */

import { SummarySection } from './SummarySection'
import { SkillsSection } from './SkillsSection'
import { ExperienceSection } from './ExperienceSection'
import { CertificationsSection } from './CertificationsSection'
import { CustomSection } from './CustomSection'
import type { ComponentType } from 'react'
import type { Database } from '@/lib/supabase/types'

type Section = Database['public']['Tables']['portfolio_sections']['Row']

export interface SectionComponentProps {
  section: Section
  mode: 'edit' | 'view'
}

// Registry of section type → component
export const sectionRegistry: Record<string, ComponentType<SectionComponentProps>> = {
  summary: SummarySection,
  skills: SkillsSection,
  work_experience: ExperienceSection,
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
