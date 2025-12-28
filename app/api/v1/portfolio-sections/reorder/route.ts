/**
 * Portfolio Sections Reorder API Route
 * 
 * PATCH /api/v1/portfolio-sections/reorder - Reorder sections in bulk
 * 
 * This endpoint allows updating the display order of multiple sections
 * at once, which is essential for drag-and-drop functionality.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// PATCH /api/v1/portfolio-sections/reorder - Bulk reorder sections
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { portfolio_id, section_ids } = body
    
    // Validate required fields
    if (!portfolio_id) {
      return NextResponse.json(
        { error: 'portfolio_id is required' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(section_ids) || section_ids.length === 0) {
      return NextResponse.json(
        { error: 'section_ids must be a non-empty array' },
        { status: 400 }
      )
    }
    
    // Verify portfolio exists and belongs to user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolio_id)
      .single()
    
    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }
    
    // Verify all sections exist and belong to this portfolio
    const { data: sections, error: sectionsError } = await supabase
      .from('portfolio_sections')
      .select('id')
      .eq('portfolio_id', portfolio_id)
      .in('id', section_ids)
    
    if (sectionsError || !sections || sections.length !== section_ids.length) {
      return NextResponse.json(
        { error: 'One or more sections not found or do not belong to this portfolio' },
        { status: 400 }
      )
    }
    
    // Update display_order for each section
    // Note: Supabase doesn't support batch updates natively, so we do this in sequence
    // In production, consider using a PostgreSQL function for better performance
    const updatePromises = section_ids.map((sectionId, index) => {
      return supabase
        .from('portfolio_sections')
        .update({ display_order: index + 1 })
        .eq('id', sectionId)
        .eq('portfolio_id', portfolio_id)
    })
    
    const results = await Promise.all(updatePromises)
    
    // Check if any updates failed
    const failedUpdates = results.filter((result) => result.error)
    if (failedUpdates.length > 0) {
      console.error('Some section updates failed:', failedUpdates)
      return NextResponse.json(
        { error: 'Failed to update some sections' },
        { status: 500 }
      )
    }
    
    // Fetch the updated sections
    const { data: updatedSections, error: fetchError } = await supabase
      .from('portfolio_sections')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .order('display_order', { ascending: true })
    
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
