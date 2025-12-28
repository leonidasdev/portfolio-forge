/**
 * API Types
 * 
 * Centralized type definitions for API requests and responses.
 * Provides type safety for client-server communication.
 * 
 * Import these types in API routes and client code:
 * ```typescript
 * import type { CreatePortfolioRequest, PortfolioResponse } from '@/types/api'
 * ```
 */

import type {
  Portfolio,
  Section,
  Certification,
  Tag,
  Template,
  Theme,
  CertificationWithTags
} from './portfolio'

// ============================================================================
// Common Response Types
// ============================================================================

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  code?: string
  details?: any
}

/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T = any> {
  data: T
  message?: string
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = any> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================================
// Portfolio API Types
// ============================================================================

/**
 * GET /api/v1/portfolios - List portfolios
 */
export interface ListPortfoliosResponse {
  portfolios: Portfolio[]
}

/**
 * POST /api/v1/portfolios - Create portfolio
 */
export interface CreatePortfolioRequest {
  title: string
  description?: string
  is_public?: boolean
  template?: string
  theme?: string
}

export interface CreatePortfolioResponse {
  portfolio: Portfolio
}

/**
 * GET /api/v1/portfolios/[id] - Get portfolio
 */
export interface GetPortfolioResponse {
  portfolio: Portfolio
}

/**
 * PATCH /api/v1/portfolios/[id] - Update portfolio
 */
export interface UpdatePortfolioRequest {
  title?: string
  description?: string
  is_public?: boolean
  template?: string
  theme?: string
}

export interface UpdatePortfolioResponse {
  portfolio: Portfolio
}

/**
 * DELETE /api/v1/portfolios/[id] - Delete portfolio
 */
export interface DeletePortfolioResponse {
  success: boolean
  message: string
}

// ============================================================================
// Section API Types
// ============================================================================

/**
 * GET /api/v1/portfolios/[id]/sections - List sections for a portfolio
 * 
 * Note: This endpoint has been moved from /api/v1/portfolio-sections/[portfolioId]
 * to follow RESTful conventions.
 */
export interface ListSectionsResponse {
  sections: Section[]
}

/**
 * POST /api/v1/portfolio-sections - Create section
 */
export interface CreateSectionRequest {
  portfolio_id: string
  section_type: string
  title?: string
  content?: Record<string, any>
  display_order?: number
  settings?: Record<string, any>
}

export interface CreateSectionResponse {
  section: Section
}

/**
 * PATCH /api/v1/portfolio-sections/[id] - Update section
 */
export interface UpdateSectionRequest {
  title?: string
  content?: Record<string, any>
  display_order?: number
  settings?: Record<string, any>
}

export interface UpdateSectionResponse {
  section: Section
}

/**
 * DELETE /api/v1/portfolio-sections/[id] - Delete section
 */
export interface DeleteSectionResponse {
  success: boolean
}

/**
 * POST /api/v1/portfolio-sections/reorder - Reorder sections
 */
export interface ReorderSectionsRequest {
  portfolio_id: string
  section_orders: Array<{
    id: string
    display_order: number
  }>
}

export interface ReorderSectionsResponse {
  success: boolean
  sections: Section[]
}

// ============================================================================
// Certification API Types
// ============================================================================

/**
 * GET /api/v1/certifications - List certifications
 */
export interface ListCertificationsRequest {
  is_public?: boolean
  limit?: number
  offset?: number
}

export interface ListCertificationsResponse {
  data: CertificationWithTags[]
  count: number
}

/**
 * POST /api/v1/certifications - Create certification
 */
export interface CreateCertificationRequest {
  title: string
  issuing_organization: string
  certification_type: 'pdf' | 'image' | 'external_link' | 'manual'
  date_issued?: string
  expiration_date?: string
  credential_id?: string
  verification_url?: string
  file_path?: string
  file_type?: string
  external_url?: string
  description?: string
  is_public?: boolean
  tag_ids?: string[]
}

export interface CreateCertificationResponse {
  certification: Certification
}

/**
 * PATCH /api/v1/certifications/[id] - Update certification
 */
export interface UpdateCertificationRequest {
  title?: string
  issuing_organization?: string
  certification_type?: 'pdf' | 'image' | 'external_link' | 'manual'
  date_issued?: string
  expiration_date?: string
  credential_id?: string
  verification_url?: string
  external_url?: string
  description?: string
  is_public?: boolean
  tag_ids?: string[]
}

export interface UpdateCertificationResponse {
  certification: Certification
}

/**
 * DELETE /api/v1/certifications/[id] - Delete (soft) certification
 */
export interface DeleteCertificationResponse {
  success: boolean
}

// ============================================================================
// Tag API Types
// ============================================================================

/**
 * GET /api/v1/tags - List tags
 */
export interface ListTagsResponse {
  tags: Tag[]
}

/**
 * POST /api/v1/tags - Create tag
 */
export interface CreateTagRequest {
  name: string
  color?: string
}

export interface CreateTagResponse {
  tag: Tag
}

/**
 * DELETE /api/v1/tags/[id] - Delete tag
 */
export interface DeleteTagResponse {
  success: boolean
}

// ============================================================================
// Template & Theme API Types
// ============================================================================

/**
 * GET /api/v1/templates - List templates
 */
export interface ListTemplatesResponse {
  templates: Template[]
}

/**
 * GET /api/v1/templates/[id] - Get template
 */
export interface GetTemplateResponse {
  template: Template
}

/**
 * GET /api/v1/themes - List themes
 */
export interface ListThemesResponse {
  themes: Theme[]
}

/**
 * GET /api/v1/themes/[id] - Get theme
 */
export interface GetThemeResponse {
  theme: Theme
}

// ============================================================================
// AI API Types
// ============================================================================

/**
 * Tone options for text generation
 */
export type Tone = 'concise' | 'formal' | 'casual' | 'senior' | 'technical'

/**
 * POST /api/v1/ai/improve-text - Improve text with AI
 */
export interface ImproveTextRequest {
  text: string
  tone?: Tone
}

export interface ImproveTextResponse {
  improved: string
}

/**
 * POST /api/v1/ai/generate-summary - Generate summary
 */
export interface GenerateSummaryRequest {
  portfolio_id: string
}

export interface GenerateSummaryResponse {
  summary: string
}

/**
 * POST /api/v1/ai/suggest-tags - Suggest tags
 */
export interface SuggestTagsRequest {
  text: string
  max_tags?: number
}

export interface SuggestTagsResponse {
  tags: string[]
}

/**
 * POST /api/v1/ai/rewrite-portfolio - Rewrite entire portfolio
 */
export interface RewritePortfolioRequest {
  portfolio_id: string
  tone: Tone
}

export interface RewritePortfolioResponse {
  success: boolean
  updated_sections: Section[]
  summary: string
}

/**
 * POST /api/v1/ai/optimize-portfolio-for-job - Optimize for job
 */
export interface OptimizePortfolioRequest {
  portfolio_id: string
  job_description: string
}

export interface OptimizePortfolioResponse {
  success: boolean
  optimized_sections: Section[]
  recommendations: string[]
  match_score: number
  key_skills_matched: string[]
  key_skills_missing: string[]
}

/**
 * POST /api/v1/ai/generate-portfolio-from-resume - Generate from resume
 */
export interface GenerateFromResumeRequest {
  portfolio_id: string
  resume_text: string
}

export interface GenerateFromResumeResponse {
  success: boolean
  created_sections: Section[]
  message: string
}

/**
 * POST /api/v1/ai/recommend-template-theme - Recommend template/theme
 */
export interface RecommendTemplateThemeRequest {
  portfolio_id: string
}

export interface RecommendTemplateThemeResponse {
  recommended_template: string
  recommended_theme: string
  recommended_section_order: string[]
  rationale: string
}

/**
 * POST /api/v1/ai/analyze-portfolio - Analyze portfolio
 */
export interface AnalyzePortfolioRequest {
  portfolio_id: string
}

export interface AnalysisRecommendation {
  type: 'critical' | 'major' | 'minor'
  section_id?: string
  section_type?: string
  issue: string
  suggestion: string
  suggested_rewrite?: string
}

export interface AnalyzePortfolioResponse {
  overall_score: number
  subscores: {
    clarity: number
    technical_depth: number
    seniority: number
    ats_alignment: number
    completeness: number
    tone_consistency: number
  }
  recommendations: AnalysisRecommendation[]
}

// ============================================================================
// File Upload Types
// ============================================================================

/**
 * File upload response
 */
export interface FileUploadResponse {
  file_path: string
  file_url: string
  file_type: string
  file_size: number
}

/**
 * Presigned URL response
 */
export interface PresignedUrlResponse {
  upload_url: string
  file_path: string
  expires_in: number
}

// ============================================================================
// Public Portfolio Types
// ============================================================================

/**
 * GET /api/v1/public/portfolio/[token] - Get public portfolio
 */
export interface GetPublicPortfolioRequest {
  token: string
}

export interface GetPublicPortfolioResponse {
  portfolio: Portfolio
  sections: Section[]
  certifications: CertificationWithTags[]
  template: Template | null
  theme: Theme | null
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is an error
 */
export function isApiError(response: any): response is ApiErrorResponse {
  return 'error' in response && typeof response.error === 'string'
}

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: any): response is ApiSuccessResponse<T> {
  return 'data' in response
}
