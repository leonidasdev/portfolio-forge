/**
 * Zod Validation Schemas
 * 
 * Centralized validation schemas for API routes.
 * Provides type-safe request validation with clear error messages.
 */

import { z } from 'zod'

// ============================================================================
// Common Schemas
// ============================================================================

export const idSchema = z.string().uuid('Invalid ID format')

export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
})

// ============================================================================
// Portfolio Schemas
// ============================================================================

export const createPortfolioSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional().nullable(),
  is_public: z.boolean().optional().default(false),
  template: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
})

export const updatePortfolioSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  is_public: z.boolean().optional(),
  template: z.string().optional().nullable(),
  theme: z.string().optional().nullable(),
})

export const updatePortfolioTemplateSchema = z.object({
  template: z.string().min(1, 'Template is required'),
})

export const updatePortfolioThemeSchema = z.object({
  theme: z.string().min(1, 'Theme is required'),
})

// ============================================================================
// Section Schemas
// ============================================================================

export const sectionTypeSchema = z.enum([
  'summary',
  'skills',
  'work_experience',
  'education',
  'projects',
  'certifications',
  'custom',
])

export const createSectionSchema = z.object({
  portfolio_id: idSchema,
  section_type: sectionTypeSchema,
  title: z.string().max(200).optional().nullable(),
  content: z.record(z.any()).optional().nullable(),
  settings: z.record(z.any()).optional().nullable(),
})

export const updateSectionSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.record(z.any()).optional().nullable(),
  settings: z.record(z.any()).optional().nullable(),
})

export const reorderSectionsSchema = z.object({
  portfolio_id: idSchema,
  section_ids: z.array(idSchema).min(1, 'At least one section ID required'),
})

// ============================================================================
// Certification Schemas
// ============================================================================

export const certificationTypeSchema = z.enum(['pdf', 'image', 'external_link', 'manual'])

// Base certification fields (without conditional validation)
const baseCertificationFields = {
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  issuing_organization: z.string().min(1, 'Issuing organization is required').max(200),
  certification_type: certificationTypeSchema,
  date_issued: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional().nullable(),
  credential_id: z.string().max(200).optional().nullable(),
  verification_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  description: z.string().max(2000).optional().nullable(),
  is_public: z.boolean().optional().default(true),
  external_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  file_path: z.string().optional().nullable(),
  file_type: z.string().optional().nullable(),
  tag_ids: z.array(idSchema).optional(),
}

export const createCertificationSchema = z.object(baseCertificationFields).refine(
  (data) => {
    // For pdf/image types, file_path is required
    if ((data.certification_type === 'pdf' || data.certification_type === 'image') && !data.file_path) {
      return false
    }
    // For external_link type, external_url is required
    if (data.certification_type === 'external_link' && !data.external_url) {
      return false
    }
    return true
  },
  {
    message: 'file_path is required for pdf/image types, external_url is required for external_link type',
  }
)

export const updateCertificationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  issuing_organization: z.string().min(1).max(200).optional(),
  date_issued: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  expiration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional().nullable(),
  credential_id: z.string().max(200).optional().nullable(),
  verification_url: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  description: z.string().max(2000).optional().nullable(),
  is_public: z.boolean().optional(),
})

// ============================================================================
// Tag Schemas
// ============================================================================

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional().nullable(),
})

export const updateTagSchema = createTagSchema.partial()

// ============================================================================
// AI Feature Schemas
// ============================================================================

export const toneSchema = z.enum(['concise', 'formal', 'senior', 'technical'])

export const improveTextSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  tone: toneSchema,
})

export const generateSummarySchema = z.object({
  certificationsText: z.string().max(10000).optional(),
  experienceText: z.string().max(10000).optional(),
  skillsText: z.string().max(10000).optional(),
  maxWords: z.number().int().min(50).max(500).optional().default(150),
})

export const suggestTagsSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text too long'),
  maxTags: z.number().int().min(1).max(20).optional().default(5),
})

export const rewritePortfolioSchema = z.object({
  tone: toneSchema,
})

export const optimizeForJobSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters').max(20000, 'Job description too long'),
})

export const generateFromResumeSchema = z.object({
  resumeText: z.string().min(100, 'Resume text must be at least 100 characters').max(50000, 'Resume text too long'),
})

// ============================================================================
// File Upload Schemas
// ============================================================================

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().regex(/^(application\/pdf|image\/(jpeg|jpg|png))$/, 'Invalid file type'),
  fileSize: z.number().int().min(1).max(10 * 1024 * 1024, 'File size must be less than 10MB'),
})

// ============================================================================
// Public Portfolio Schemas
// ============================================================================

export const getPublicPortfolioSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
})

// ============================================================================
// Helper Types
// ============================================================================

export type CreatePortfolio = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolio = z.infer<typeof updatePortfolioSchema>
export type CreateSection = z.infer<typeof createSectionSchema>
export type UpdateSection = z.infer<typeof updateSectionSchema>
export type ReorderSections = z.infer<typeof reorderSectionsSchema>
export type CreateCertification = z.infer<typeof createCertificationSchema>
export type UpdateCertification = z.infer<typeof updateCertificationSchema>
export type CreateTag = z.infer<typeof createTagSchema>
export type UpdateTag = z.infer<typeof updateTagSchema>
export type ImproveText = z.infer<typeof improveTextSchema>
export type GenerateSummary = z.infer<typeof generateSummarySchema>
export type SuggestTags = z.infer<typeof suggestTagsSchema>
export type RewritePortfolio = z.infer<typeof rewritePortfolioSchema>
export type OptimizeForJob = z.infer<typeof optimizeForJobSchema>
export type GenerateFromResume = z.infer<typeof generateFromResumeSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type GetPublicPortfolio = z.infer<typeof getPublicPortfolioSchema>
