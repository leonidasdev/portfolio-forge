/**
 * Shared Portfolio Types
 * 
 * Centralized type definitions for portfolio-related entities.
 * Eliminates 20+ type duplications across components.
 * 
 * Import these types instead of defining them locally:
 * ```typescript
 * import type { Portfolio, Section, Certification, Tag } from '@/types/portfolio'
 * ```
 */

import type { Database } from '@/lib/supabase/types'

// ============================================================================
// Database Table Types
// ============================================================================

/**
 * Portfolio entity
 * Represents a complete portfolio with metadata
 */
export type Portfolio = Database['public']['Tables']['portfolios']['Row']

/**
 * Portfolio Section entity
 * Individual content sections within a portfolio (About, Experience, etc.)
 */
export type Section = Database['public']['Tables']['portfolio_sections']['Row']

/**
 * Certification entity
 * Professional certifications, licenses, and credentials
 */
export type Certification = Database['public']['Tables']['certifications']['Row']

/**
 * Tag entity
 * User-created tags for categorizing certifications
 */
export type Tag = Database['public']['Tables']['tags']['Row']

/**
 * Template entity
 * Portfolio layout templates (single-column, two-column, etc.)
 */
export type Template = Database['public']['Tables']['templates']['Row']

/**
 * Theme entity
 * Visual styling themes (professional, modern, creative, etc.)
 */
export type Theme = Database['public']['Tables']['themes']['Row']

/**
 * Certification-Tag junction
 * Many-to-many relationship between certifications and tags
 */
export type CertificationTag = Database['public']['Tables']['certification_tags']['Row']

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert']
export type SectionInsert = Database['public']['Tables']['portfolio_sections']['Insert']
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
export type TagInsert = Database['public']['Tables']['tags']['Insert']

// ============================================================================
// Update Types (for updating existing records)
// ============================================================================

export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update']
export type SectionUpdate = Database['public']['Tables']['portfolio_sections']['Update']
export type CertificationUpdate = Database['public']['Tables']['certifications']['Update']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

// ============================================================================
// Enum Types
// ============================================================================

/**
 * Section types for portfolio sections
 */
export type SectionType = Section['section_type']

/**
 * Valid section types as constants
 * Matches database enum: about, skills, projects, experience, certifications, contact, custom
 */
export const SECTION_TYPES = [
  'about',
  'skills',
  'projects',
  'experience',
  'certifications',
  'contact',
  'custom'
] as const

/**
 * Certification types
 */
export type CertificationType = Certification['certification_type']

/**
 * Valid certification types as constants
 */
export const CERTIFICATION_TYPES = [
  'pdf',
  'image',
  'external_link',
  'manual'
] as const

/**
 * Portfolio template names
 */
export type TemplateName = 
  | 'single-column'
  | 'two-column'
  | 'grid'
  | 'timeline'
  | 'modern'

/**
 * Portfolio theme names
 */
export type ThemeName = 
  | 'professional'
  | 'modern'
  | 'creative'
  | 'minimal'
  | 'elegant'

// ============================================================================
// Extended Types (with relations)
// ============================================================================

/**
 * Certification with populated tags
 * Used when fetching certifications with their associated tags
 */
export interface CertificationWithTags extends Certification {
  tags: Tag[]
}

/**
 * Portfolio with sections
 * Used when fetching a complete portfolio with all sections
 */
export interface PortfolioWithSections extends Portfolio {
  sections: Section[]
}

/**
 * Section with metadata
 * Extended section with additional computed fields
 */
export interface SectionWithMetadata extends Section {
  wordCount?: number
  isEmpty?: boolean
  lastEditedBy?: string
}

// ============================================================================
// View Types (for display)
// ============================================================================

/**
 * Portfolio summary for lists
 * Lightweight version for portfolio lists
 */
export interface PortfolioSummary {
  id: string
  title: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  sectionCount?: number
}

/**
 * Section summary for lists
 * Lightweight version for section lists
 */
export interface SectionSummary {
  id: string
  section_type: SectionType
  title: string | null
  display_order: number
  wordCount?: number
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Portfolio creation form data
 */
export interface CreatePortfolioForm {
  title: string
  description?: string
  is_public?: boolean
  template?: TemplateName
  theme?: ThemeName
}

/**
 * Section creation form data
 */
export interface CreateSectionForm {
  portfolio_id: string
  section_type: SectionType
  title?: string
  content?: Record<string, any>
  display_order?: number
}

/**
 * Certification creation form data
 */
export interface CreateCertificationForm {
  title: string
  issuing_organization: string
  certification_type: CertificationType
  date_issued?: string
  expiration_date?: string
  credential_id?: string
  verification_url?: string
  description?: string
  is_public?: boolean
  tagIds?: string[]
}

// ============================================================================
// Content Types (section-specific)
// ============================================================================

/**
 * About section content structure
 */
export interface AboutSectionContent {
  summary?: string
  headline?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  linkedIn?: string
  github?: string
}

/**
 * Experience section content structure
 */
export interface ExperienceSectionContent {
  items: Array<{
    company: string
    position: string
    startDate: string
    endDate?: string
    location?: string
    description: string
    achievements?: string[]
  }>
}

/**
 * Education section content structure
 */
export interface EducationSectionContent {
  items: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate?: string
    gpa?: string
    description?: string
  }>
}

/**
 * Skills section content structure
 */
export interface SkillsSectionContent {
  categories: Array<{
    name: string
    skills: string[]
  }>
}

/**
 * Projects section content structure
 */
export interface ProjectsSectionContent {
  items: Array<{
    title: string
    description: string
    technologies: string[]
    url?: string
    github?: string
    startDate?: string
    endDate?: string
  }>
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a section is of a specific type
 */
export function isSectionType(section: Section, type: SectionType): boolean {
  return section.section_type === type
}

/**
 * Type guard to check if certification is a file-based type
 */
export function isFileCertification(cert: Certification): boolean {
  return cert.certification_type === 'pdf' || cert.certification_type === 'image'
}

/**
 * Type guard to check if portfolio is public
 */
export function isPublicPortfolio(portfolio: Portfolio): boolean {
  return portfolio.is_public === true
}
