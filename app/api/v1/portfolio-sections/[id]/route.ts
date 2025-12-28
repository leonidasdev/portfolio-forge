/**
 * Portfolio Sections API Routes (Individual)
 * 
 * PATCH  /api/v1/portfolio-sections/[id] - Update a section
 * DELETE /api/v1/portfolio-sections/[id] - Delete a section
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth-middleware'
import { withApiHandler, ApiError } from '@/lib/api/route-handler'
import { validateBody, validateParams } from '@/lib/validation/helpers'
import { updateSectionSchema, idSchema } from '@/lib/validation/schemas'

// PATCH /api/v1/portfolio-sections/[id] - Update a section
export const PATCH = withApiHandler(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { user, supabase } = await requireAuth(request)
  
  // Validate params
  const { id } = await validateParams(params, idSchema)
  
  // Validate request body
  const body = await validateBody(request, updateSectionSchema)
  
  // Verify section exists and user owns the portfolio
  const { data: section, error: fetchError } = await supabase
    .from('portfolio_sections')
    .select('portfolio_id, portfolios!inner(user_id)')
    .eq('id', id)
    .single()
  
  if (fetchError || !section) {
    throw new ApiError('Section not found', 404)
  }
  
  // RLS will enforce ownership, but we check explicitly for clarity
  const portfolio = section.portfolios as any
  if (portfolio.user_id !== user.id) {
    throw new ApiError('Forbidden', 403)
  }
  
  // Build update object with only provided fields
  const updates: any = {}
  
  if (body.title !== undefined) {
    updates.title = body.title
  }
  
  if (body.content !== undefined) {
    updates.content = body.content
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
  
  // Update the section
  const { data: updatedSection, error } = await supabase
    .from('portfolio_sections')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error || !updatedSection) {
      console.error('Failed to update section:', error)
      return NextResponse.json(
        { error: 'Failed to update section' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ section: updatedSection })
    
  } catch (error) {
    console.error('PATCH /api/v1/portfolio-sections/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/portfolio-sections/[id] - Delete a section and reorder remaining
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params
    
    // Verify section exists and get portfolio_id and current display_order
    const { data: section, error: fetchError } = await supabase
      .from('portfolio_sections')
      .select('id, portfolio_id, display_order, portfolios!inner(user_id)')
      .eq('id', id)
      .single()
    
    if (fetchError || !section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }
    
    // Verify ownership
    const portfolio = section.portfolios as any
    if (portfolio.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const deletedOrder = section.display_order
    const portfolioId = section.portfolio_id
    
    // Delete the section
    const { error: deleteError } = await supabase
      .from('portfolio_sections')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Failed to delete section:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete section' },
        { status: 500 }
      )
    }
    
    // Reorder remaining sections (decrement display_order for all sections after the deleted one)
    const { error: reorderError } = await supabase.rpc('reorder_sections_after_delete', {
      p_portfolio_id: portfolioId,
      p_deleted_order: deletedOrder,
    })
    
    // If the RPC function doesn't exist, fallback to manual reordering
    if (reorderError) {
      console.warn('RPC function not available, using fallback reordering')
      
      // Fetch remaining sections with display_order > deleted order
      const { data: remainingSections } = await supabase
        .from('portfolio_sections')
        .select('id, display_order')
        .eq('portfolio_id', portfolioId)
        .gt('display_order', deletedOrder)
        .order('display_order', { ascending: true })
      
      // Update each section's display_order
      if (remainingSections && remainingSections.length > 0) {
        for (const remainingSection of remainingSections) {
          await supabase
            .from('portfolio_sections')
            .update({ display_order: remainingSection.display_order - 1 })
            .eq('id', remainingSection.id)
        }
      }
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error) {
    console.error('DELETE /api/v1/portfolio-sections/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
