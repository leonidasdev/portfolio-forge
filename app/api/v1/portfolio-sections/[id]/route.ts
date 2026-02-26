/**
 * Portfolio Sections API Routes (Individual)
 *
 * PATCH  /api/v1/portfolio-sections/[id] - Update a section
 * DELETE /api/v1/portfolio-sections/[id] - Delete a section
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { queries } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/server'
import { validateBody } from '@/lib/validation/helpers'
import { updateSectionSchema } from '@/lib/validation/schemas'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/v1/portfolio-sections/[id] - Update a section
export const PATCH = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { supabase } = await requireAuth(request)

    // Get section ID from params (Next.js 15 - params is a Promise)
    const { id } = await params

    if (!id) {
      throw new ApiError('Section ID is required', 400)
    }

    // Validate request body
    const body = await validateBody(request, updateSectionSchema)

    // Verify section exists using typed query helper
    const { data: section, error: fetchError } = await queries.sections.getById(supabase, id)

    if (fetchError || !section) {
      throw new ApiError('Section not found', 404)
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {}

    if (body.title !== undefined) {
      updates.title = body.title
    }

    if (body.content !== undefined) {
      updates.custom_content = body.content
    }

    if (body.settings !== undefined) {
      updates.settings = body.settings
    }

    if (body.display_order !== undefined) {
      updates.display_order = body.display_order
    }

    // Ensure we have something to update
    if (Object.keys(updates).length === 0) {
      throw new ApiError('No valid fields to update', 400)
    }

    // Update the section using typed query helper
    const { data: updatedSection, error } = await queries.sections.update(supabase, id, updates)

    if (error || !updatedSection) {
      console.error('Failed to update section:', error)
      throw new ApiError('Failed to update section', 500)
    }

    return NextResponse.json({ section: updatedSection })
  }
)

// DELETE /api/v1/portfolio-sections/[id] - Delete a section and reorder remaining
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Next.js 15 - params is a Promise
    const { id } = await params

    // Verify section exists using typed query helper
    const { data: section, error: fetchError } = await queries.sections.getById(supabase, id)

    if (fetchError || !section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    const deletedOrder = section.display_order
    const portfolioId = section.portfolio_id

    // Delete the section using typed query helper
    const { error: deleteError } = await queries.sections.delete(supabase, id)

    if (deleteError) {
      console.error('Failed to delete section:', deleteError)
      return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
    }

    // Reorder remaining sections (decrement display_order for all sections after the deleted one)
    // Use typed query helper for reordering which handles the RPC or fallback internally
    const remainingSectionIds = await queries.sections.getIdsAfterOrder(
      supabase,
      portfolioId,
      deletedOrder ?? 0
    )

    // If there are sections to reorder, decrement their display_order
    if (remainingSectionIds && remainingSectionIds.length > 0) {
      const { error: reorderError } = await queries.sections.decrementOrders(
        supabase,
        remainingSectionIds
      )

      if (reorderError) {
        console.warn('Failed to reorder sections after delete:', reorderError)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/v1/portfolio-sections/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
