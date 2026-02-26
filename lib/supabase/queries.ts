/**
 * Typed Supabase Query Helpers
 *
 * This module provides type-safe wrappers around Supabase queries.
 * Eliminates the need for `as any` casts throughout the codebase.
 *
 * Benefits:
 * - Full TypeScript inference for query results
 * - Centralized query logic for easier maintenance
 * - Consistent error handling patterns
 * - Reusable across Server Components, API routes, and Server Actions
 *
 * Usage:
 * ```typescript
 * import { queries } from '@/lib/supabase/queries'
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * const supabase = await createServerClient()
 * const portfolios = await queries.portfolios.list(supabase)
 * ```
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Typed Supabase client - accepts any Supabase client typed with Database
 * Using a more permissive type to handle different client instantiations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedSupabaseClient = SupabaseClient<Database, any, any>

/**
 * Table row types (read)
 */
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type Section = Database['public']['Tables']['portfolio_sections']['Row']
export type Certification = Database['public']['Tables']['certifications']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type WorkExperience = Database['public']['Tables']['work_experience']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type Theme = Database['public']['Tables']['themes']['Row']
export type PublicLink = Database['public']['Tables']['public_links']['Row']
export type CertificationTag = Database['public']['Tables']['certification_tags']['Row']

/**
 * Table insert types
 */
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert']
export type SectionInsert = Database['public']['Tables']['portfolio_sections']['Insert']
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

/**
 * Table update types
 */
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update']
export type SectionUpdate = Database['public']['Tables']['portfolio_sections']['Update']
export type CertificationUpdate = Database['public']['Tables']['certifications']['Update']
export type TagUpdate = Database['public']['Tables']['tags']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Certification with tags (joined query result)
 */
export interface CertificationWithTags extends Certification {
  certification_tags: Array<{
    tag_id: string
    tags: Tag | null
  }>
}

/**
 * Custom error class that preserves Supabase/PostgREST error codes
 */
export class QueryError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'QueryError'
    this.code = code
  }
}

/**
 * Query result wrapper for consistent error handling
 */
export interface QueryResult<T> {
  data: T | null
  error: QueryError | null
}

/**
 * Query options for list operations
 */
export interface ListOptions {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
}

// ============================================================================
// Portfolio Queries
// ============================================================================

export const portfolioQueries = {
  /**
   * List all portfolios for the current user (RLS filtered)
   */
  async list(
    supabase: TypedSupabaseClient,
    options: ListOptions = {}
  ): Promise<QueryResult<Portfolio[]>> {
    const { limit, offset, orderBy = 'updated_at', ascending = false } = options

    let query = supabase
      .from('portfolios')
      .select('*')
      .eq('is_deleted', false)
      .order(orderBy, { ascending })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 20) - 1)

    const { data, error } = await query

    return {
      data: data as Portfolio[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * List portfolios with specific columns (optimized select)
   */
  async listSummary(
    supabase: TypedSupabaseClient
  ): Promise<
    QueryResult<
      Pick<Portfolio, 'id' | 'title' | 'description' | 'is_public' | 'created_at' | 'updated_at'>[]
    >
  > {
    const { data, error } = await supabase
      .from('portfolios')
      .select('id, title, description, is_public, created_at, updated_at')
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false })

    return {
      data: data as
        | Pick<
            Portfolio,
            'id' | 'title' | 'description' | 'is_public' | 'created_at' | 'updated_at'
          >[]
        | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get a single portfolio by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Portfolio>> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    return {
      data: data as Portfolio | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new portfolio
   */
  async create(
    supabase: TypedSupabaseClient,
    portfolio: PortfolioInsert
  ): Promise<QueryResult<Portfolio>> {
    const { data, error } = await supabase.from('portfolios').insert(portfolio).select().single()

    return {
      data: data as Portfolio | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update a portfolio
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: PortfolioUpdate
  ): Promise<QueryResult<Portfolio>> {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data: data as Portfolio | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Soft delete a portfolio
   */
  async softDelete(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Portfolio>> {
    return portfolioQueries.update(supabase, id, { is_deleted: true })
  },

  /**
   * Get a public portfolio by its public link token (no auth required)
   */
  async getByPublicToken(
    supabase: TypedSupabaseClient,
    token: string
  ): Promise<QueryResult<Portfolio>> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('public_link_token', token)
      .eq('is_deleted', false)
      .single()

    return {
      data: data as Portfolio | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get portfolio metadata by public link token (for SEO/page metadata)
   */
  async getMetadataByPublicToken(
    supabase: TypedSupabaseClient,
    token: string
  ): Promise<QueryResult<Pick<Portfolio, 'title' | 'description'>>> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('title, description')
      .eq('public_link_token', token)
      .eq('is_public', true)
      .eq('is_deleted', false)
      .single()

    return {
      data: data as Pick<Portfolio, 'title' | 'description'> | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Section Queries
// ============================================================================

export const sectionQueries = {
  /**
   * List all sections for a portfolio
   */
  async listByPortfolio(
    supabase: TypedSupabaseClient,
    portfolioId: string
  ): Promise<QueryResult<Section[]>> {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })

    return {
      data: data as Section[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get a single section by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Section>> {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .select('*')
      .eq('id', id)
      .single()

    return {
      data: data as Section | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new section
   */
  async create(
    supabase: TypedSupabaseClient,
    section: SectionInsert
  ): Promise<QueryResult<Section>> {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .insert(section)
      .select()
      .single()

    return {
      data: data as Section | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update a section
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: SectionUpdate
  ): Promise<QueryResult<Section>> {
    const { data, error } = await supabase
      .from('portfolio_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data: data as Section | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Delete a section
   */
  async delete(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<null>> {
    const { error } = await supabase.from('portfolio_sections').delete().eq('id', id)

    return {
      data: null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Reorder sections by position in array (for drag-and-drop)
   * Sets display_order to index + 1 for each section ID in order
   */
  async reorder(
    supabase: TypedSupabaseClient,
    portfolioId: string,
    sectionIds: string[]
  ): Promise<QueryResult<null>> {
    // Update display_order for each section based on position in array
    const results = await Promise.all(
      sectionIds.map((id, index) =>
        supabase
          .from('portfolio_sections')
          .update({ display_order: index + 1 })
          .eq('id', id)
          .eq('portfolio_id', portfolioId)
      )
    )

    const firstError = results.find((r) => r.error)?.error
    return {
      data: null,
      error: firstError ? new Error(firstError.message) : null,
    }
  },

  /**
   * Get section IDs with display_order greater than a given value
   * Used for reordering after a section is deleted
   */
  async getIdsAfterOrder(
    supabase: TypedSupabaseClient,
    portfolioId: string,
    deletedOrder: number
  ): Promise<string[]> {
    const { data } = await supabase
      .from('portfolio_sections')
      .select('id')
      .eq('portfolio_id', portfolioId)
      .gt('display_order', deletedOrder)
      .order('display_order', { ascending: true })

    return data?.map((s) => s.id) || []
  },

  /**
   * Decrement display_order for a list of section IDs
   * Used after deleting a section to close the gap
   */
  async decrementOrders(
    supabase: TypedSupabaseClient,
    sectionIds: string[]
  ): Promise<QueryResult<null>> {
    // Fetch current orders and decrement each by 1
    const { data: sections, error: fetchError } = await supabase
      .from('portfolio_sections')
      .select('id, display_order')
      .in('id', sectionIds)

    if (fetchError || !sections) {
      return {
        data: null,
        error: fetchError ? new Error(fetchError.message) : new Error('Failed to fetch sections'),
      }
    }

    const results = await Promise.all(
      sections.map((section) =>
        supabase
          .from('portfolio_sections')
          .update({ display_order: (section.display_order ?? 1) - 1 })
          .eq('id', section.id)
      )
    )

    const firstError = results.find((r) => r.error)?.error
    return {
      data: null,
      error: firstError ? new Error(firstError.message) : null,
    }
  },
}

// ============================================================================
// Certification Queries
// ============================================================================

export const certificationQueries = {
  /**
   * List all certifications for the current user
   */
  async list(
    supabase: TypedSupabaseClient,
    options: ListOptions = {}
  ): Promise<QueryResult<Certification[]>> {
    const { limit, offset, orderBy = 'date_issued', ascending = false } = options

    let query = supabase
      .from('certifications')
      .select('*')
      .eq('is_deleted', false)
      .order(orderBy, { ascending, nullsFirst: false })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 20) - 1)

    const { data, error } = await query

    return {
      data: data as Certification[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * List certifications with their tags (joined)
   */
  async listWithTags(
    supabase: TypedSupabaseClient,
    options: ListOptions = {}
  ): Promise<QueryResult<CertificationWithTags[]>> {
    const { limit, offset } = options

    let query = supabase
      .from('certifications')
      .select(
        `
        *,
        certification_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `
      )
      .eq('is_deleted', false)
      .order('date_issued', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 20) - 1)

    const { data, error } = await query

    return {
      data: data as CertificationWithTags[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get a single certification by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Certification>> {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    return {
      data: data as Certification | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get certification with tags
   */
  async getByIdWithTags(
    supabase: TypedSupabaseClient,
    id: string
  ): Promise<QueryResult<CertificationWithTags>> {
    const { data, error } = await supabase
      .from('certifications')
      .select(
        `
        *,
        certification_tags (
          tag_id,
          tags (
            id,
            name,
            color
          )
        )
      `
      )
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    return {
      data: data as CertificationWithTags | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new certification
   */
  async create(
    supabase: TypedSupabaseClient,
    certification: CertificationInsert
  ): Promise<QueryResult<Certification>> {
    const { data, error } = await supabase
      .from('certifications')
      .insert(certification)
      .select()
      .single()

    return {
      data: data as Certification | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update a certification
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: CertificationUpdate
  ): Promise<QueryResult<Certification>> {
    const { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data: data as Certification | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Soft delete a certification
   */
  async softDelete(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Certification>> {
    return certificationQueries.update(supabase, id, { is_deleted: true })
  },

  /**
   * Get public certifications by IDs for a user (used in public portfolio view)
   * Returns only id and is_public fields for filtering
   */
  async getPublicByIds(
    supabase: TypedSupabaseClient,
    userId: string,
    certificationIds: string[]
  ): Promise<QueryResult<Array<{ id: string; is_public: boolean | null }>>> {
    const { data, error } = await supabase
      .from('certifications')
      .select('id, is_public')
      .eq('user_id', userId)
      .in('id', certificationIds)
      .eq('is_deleted', false)

    return {
      data: data as Array<{ id: string; is_public: boolean | null }> | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Tag Queries
// ============================================================================

export const tagQueries = {
  /**
   * List all tags for the current user
   */
  async list(supabase: TypedSupabaseClient): Promise<QueryResult<Tag[]>> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

    return {
      data: data as Tag[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get a single tag by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Tag>> {
    const { data, error } = await supabase.from('tags').select('*').eq('id', id).single()

    return {
      data: data as Tag | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new tag
   */
  async create(supabase: TypedSupabaseClient, tag: TagInsert): Promise<QueryResult<Tag>> {
    const { data, error } = await supabase.from('tags').insert(tag).select().single()

    return {
      data: data as Tag | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update a tag
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: TagUpdate
  ): Promise<QueryResult<Tag>> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data: data as Tag | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Delete a tag
   */
  async delete(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<null>> {
    const { error } = await supabase.from('tags').delete().eq('id', id)

    return {
      data: null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Profile Queries
// ============================================================================

export const profileQueries = {
  /**
   * Get profile by user ID
   */
  async getByUserId(supabase: TypedSupabaseClient, userId: string): Promise<QueryResult<Profile>> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

    return {
      data: data as Profile | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new profile
   */
  async create(
    supabase: TypedSupabaseClient,
    profile: ProfileInsert
  ): Promise<QueryResult<Profile>> {
    const { data, error } = await supabase.from('profiles').insert(profile).select().single()

    return {
      data: data as Profile | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update profile
   */
  async update(
    supabase: TypedSupabaseClient,
    userId: string,
    updates: ProfileUpdate
  ): Promise<QueryResult<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    return {
      data: data as Profile | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Work Experience Queries
// ============================================================================

export const workExperienceQueries = {
  /**
   * List all work experience for the current user
   */
  async list(
    supabase: TypedSupabaseClient,
    options: ListOptions = {}
  ): Promise<QueryResult<WorkExperience[]>> {
    const { limit } = options

    let query = supabase
      .from('work_experience')
      .select('*')
      .eq('is_deleted', false)
      .order('start_date', { ascending: false, nullsFirst: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query

    return {
      data: data as WorkExperience[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Skills Queries
// ============================================================================

export const skillQueries = {
  /**
   * List all skills for the current user
   */
  async list(supabase: TypedSupabaseClient): Promise<QueryResult<Skill[]>> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('is_deleted', false)
      .order('name', { ascending: true })

    return {
      data: data as Skill[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Template & Theme Queries
// ============================================================================

export const templateQueries = {
  /**
   * List all active templates
   */
  async list(supabase: TypedSupabaseClient): Promise<QueryResult<Template[]>> {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    return {
      data: data as Template[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get template by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Template>> {
    const { data, error } = await supabase.from('templates').select('*').eq('id', id).single()

    return {
      data: data as Template | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

export const themeQueries = {
  /**
   * List all active themes
   */
  async list(supabase: TypedSupabaseClient): Promise<QueryResult<Theme[]>> {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    return {
      data: data as Theme[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get theme by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Theme>> {
    const { data, error } = await supabase.from('themes').select('*').eq('id', id).single()

    return {
      data: data as Theme | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Public Link Queries
// ============================================================================

// Type for public_links insert
type PublicLinkInsert = Database['public']['Tables']['public_links']['Insert']
type PublicLinkUpdate = Database['public']['Tables']['public_links']['Update']

export const publicLinkQueries = {
  /**
   * Get public link by token
   */
  async getByToken(supabase: TypedSupabaseClient, token: string): Promise<QueryResult<PublicLink>> {
    const { data, error } = await supabase
      .from('public_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    return {
      data: data as PublicLink | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get public link by portfolio ID
   */
  async getByPortfolioId(
    supabase: TypedSupabaseClient,
    portfolioId: string
  ): Promise<QueryResult<PublicLink>> {
    const { data, error } = await supabase
      .from('public_links')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .single()

    return {
      data: data as PublicLink | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a new public link
   */
  async create(
    supabase: TypedSupabaseClient,
    link: PublicLinkInsert
  ): Promise<QueryResult<PublicLink>> {
    const { data, error } = await supabase.from('public_links').insert(link).select().single()

    return {
      data: data as PublicLink | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Update a public link
   */
  async update(
    supabase: TypedSupabaseClient,
    id: string,
    updates: PublicLinkUpdate
  ): Promise<QueryResult<PublicLink>> {
    const { data, error } = await supabase
      .from('public_links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return {
      data: data as PublicLink | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Increment view count
   */
  async incrementViewCount(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<null>> {
    const { error } = await supabase.rpc('increment_view_count', { link_id: id })

    return {
      data: null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Certification Tags (Junction Table) Queries
// ============================================================================

export const certificationTagQueries = {
  /**
   * Get tags for a certification
   */
  async getTagsForCertification(
    supabase: TypedSupabaseClient,
    certificationId: string
  ): Promise<QueryResult<Tag[]>> {
    const { data, error } = await supabase
      .from('certification_tags')
      .select('tags (*)')
      .eq('certification_id', certificationId)

    if (error) {
      return { data: null, error: new QueryError(error.message, error.code) }
    }

    // Extract tags from the joined result - use unknown for safe cast
    const tags =
      (data as unknown as Array<{ tags: Tag }>)?.map((item) => item.tags).filter(Boolean) || []

    return { data: tags, error: null }
  },

  /**
   * Check if a certification-tag link exists
   */
  async get(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagId: string
  ): Promise<QueryResult<CertificationTag>> {
    const { data, error } = await supabase
      .from('certification_tags')
      .select('*')
      .eq('certification_id', certificationId)
      .eq('tag_id', tagId)
      .single()

    return {
      data: data as CertificationTag | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Create a certification-tag link
   */
  async create(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagId: string
  ): Promise<QueryResult<CertificationTag>> {
    const { data, error } = await supabase
      .from('certification_tags')
      .insert({ certification_id: certificationId, tag_id: tagId })
      .select()
      .single()

    return {
      data: data as CertificationTag | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Delete a certification-tag link
   */
  async delete(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagId: string
  ): Promise<QueryResult<null>> {
    const { error } = await supabase
      .from('certification_tags')
      .delete()
      .eq('certification_id', certificationId)
      .eq('tag_id', tagId)

    return {
      data: null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Add a tag to a certification (alias for create)
   */
  async addTag(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagId: string
  ): Promise<QueryResult<CertificationTag>> {
    return certificationTagQueries.create(supabase, certificationId, tagId)
  },

  /**
   * Remove a tag from a certification (alias for delete)
   */
  async removeTag(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagId: string
  ): Promise<QueryResult<null>> {
    return certificationTagQueries.delete(supabase, certificationId, tagId)
  },

  /**
   * Set tags for a certification (replace all)
   */
  async setTags(
    supabase: TypedSupabaseClient,
    certificationId: string,
    tagIds: string[]
  ): Promise<QueryResult<null>> {
    // Delete existing tags
    const { error: deleteError } = await supabase
      .from('certification_tags')
      .delete()
      .eq('certification_id', certificationId)

    if (deleteError) {
      return { data: null, error: new Error(deleteError.message) }
    }

    // Insert new tags
    if (tagIds.length > 0) {
      const { error: insertError } = await supabase.from('certification_tags').insert(
        tagIds.map((tagId) => ({
          certification_id: certificationId,
          tag_id: tagId,
        }))
      )

      if (insertError) {
        return { data: null, error: new Error(insertError.message) }
      }
    }

    return { data: null, error: null }
  },
}

// ============================================================================
// Count Queries (for dashboard stats)
// ============================================================================

export interface CountResult {
  count: number
  error: Error | null
}

export const countQueries = {
  /**
   * Count portfolios for a user
   */
  async portfolios(supabase: TypedSupabaseClient, userId: string): Promise<CountResult> {
    const { count, error } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)

    return {
      count: count ?? 0,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Count certifications for a user
   */
  async certifications(supabase: TypedSupabaseClient, userId: string): Promise<CountResult> {
    const { count, error } = await supabase
      .from('certifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)

    return {
      count: count ?? 0,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Count projects for a user
   */
  async projects(supabase: TypedSupabaseClient, userId: string): Promise<CountResult> {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)

    return {
      count: count ?? 0,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Count skills for a user
   */
  async skills(supabase: TypedSupabaseClient, userId: string): Promise<CountResult> {
    const { count, error } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_deleted', false)

    return {
      count: count ?? 0,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Project Queries
// ============================================================================

export const projectQueries = {
  /**
   * List all projects for the current user
   */
  async list(
    supabase: TypedSupabaseClient,
    options: ListOptions = {}
  ): Promise<QueryResult<Project[]>> {
    const { limit } = options

    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query

    return {
      data: data as Project[] | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },

  /**
   * Get a single project by ID
   */
  async getById(supabase: TypedSupabaseClient, id: string): Promise<QueryResult<Project>> {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()

    return {
      data: data as Project | null,
      error: error ? new QueryError(error.message, error.code) : null,
    }
  },
}

// ============================================================================
// Unified Queries Export
// ============================================================================

/**
 * All typed query helpers
 *
 * @example
 * ```typescript
 * import { queries } from '@/lib/supabase/queries'
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * const supabase = await createServerClient()
 *
 * // Portfolio queries
 * const { data: portfolios } = await queries.portfolios.list(supabase)
 *
 * // Certification queries with tags
 * const { data: certs } = await queries.certifications.listWithTags(supabase)
 *
 * // Profile queries
 * const { data: profile } = await queries.profiles.getByUserId(supabase, userId)
 * ```
 */
export const queries = {
  portfolios: portfolioQueries,
  sections: sectionQueries,
  certifications: certificationQueries,
  tags: tagQueries,
  profiles: profileQueries,
  workExperience: workExperienceQueries,
  skills: skillQueries,
  templates: templateQueries,
  themes: themeQueries,
  publicLinks: publicLinkQueries,
  certificationTags: certificationTagQueries,
  projects: projectQueries,
  counts: countQueries,
}

// Individual queries are already exported inline via 'export const'
// Use: import { portfolioQueries } from '@/lib/supabase/queries'
// Or: import { queries } from '@/lib/supabase/queries' for the unified object
