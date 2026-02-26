/**
 * Portfolio Sections Reorder API Route
 *
 * PATCH /api/v1/portfolio-sections/reorder - Reorder sections in bulk
 *
 * This endpoint allows updating the display order of multiple sections
 * at once, which is essential for drag-and-drop functionality.
 */

import { queries } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/v1/portfolio-sections/reorder - Bulk reorder sections
export async function PATCH(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { portfolio_id, section_ids } = body

    // Validate required fields
    if (!portfolio_id) {
      return NextResponse.json({ error: 'portfolio_id is required' }, { status: 400 })
    }

    if (!Array.isArray(section_ids) || section_ids.length === 0) {
      return NextResponse.json({ error: 'section_ids must be a non-empty array' }, { status: 400 })
    }

    // Verify portfolio exists and belongs to user using typed query helper
    const { data: portfolio, error: portfolioError } = await queries.portfolios.getById(
      supabase,
      portfolio_id
    )

    if (portfolioError || !portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Verify all sections exist and belong to this portfolio using typed query helper
    const { data: sections, error: sectionsError } = await queries.sections.listByPortfolio(
      supabase,
      portfolio_id
    )

    // Filter to only requested sections and validate count matches
    const requestedSections = sections?.filter((s) => section_ids.includes(s.id))
    if (sectionsError || !requestedSections || requestedSections.length !== section_ids.length) {
      return NextResponse.json(
        { error: 'One or more sections not found or do not belong to this portfolio' },
        { status: 400 }
      )
    }

    // Use the typed reorder query helper for bulk update
    const { error: reorderError } = await queries.sections.reorder(
      supabase,
      portfolio_id,
      section_ids
    )

    if (reorderError) {
      console.error('Section reorder failed:', reorderError)
      return NextResponse.json({ error: 'Failed to update sections' }, { status: 500 })
    }

    // Fetch the updated sections using typed query helper
    const { data: updatedSections, error: fetchError } = await queries.sections.listByPortfolio(
      supabase,
      portfolio_id
    )

    if (fetchError) {
      console.error('Failed to fetch updated sections:', fetchError)
      return NextResponse.json(
        { error: 'Reorder succeeded but failed to fetch updated sections' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      sections: updatedSections,
    })
  } catch (error) {
    console.error('PATCH /api/v1/portfolio-sections/reorder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
