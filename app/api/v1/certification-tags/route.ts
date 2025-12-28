/**
 * Certification-Tags API Routes
 * 
 * POST   /api/v1/certification-tags - Assign a tag to a certification
 * DELETE /api/v1/certification-tags - Remove a tag from a certification
 * 
 * Note: This is a junction table endpoint for managing many-to-many relationships.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/v1/certification-tags - Assign a tag to a certification
export async function POST(request: NextRequest) {
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
    const { certification_id, tag_id } = body
    
    // Validate required fields
    if (!certification_id || !tag_id) {
      return NextResponse.json(
        { error: 'certification_id and tag_id are required' },
        { status: 400 }
      )
    }
    
    // Verify certification belongs to user
    const { data: certification, error: certError } = await supabase
      .from('certifications')
      .select('id')
      .eq('id', certification_id)
      .eq('user_id', user.id)
      .single()
    
    if (certError || !certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }
    
    // Verify tag belongs to user
    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('id', tag_id)
      .eq('user_id', user.id)
      .single()
    
    if (tagError || !tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }
    
    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('certification_tags')
      .select('id')
      .eq('certification_id', certification_id)
      .eq('tag_id', tag_id)
      .single()
    
    if (existing) {
      // Already assigned, return success (idempotent)
      return NextResponse.json({ success: true }, { status: 200 })
    }
    
    // Create the assignment
    const { error } = await supabase
      .from('certification_tags')
      .insert({
        certification_id,
        tag_id,
      })
    
    if (error) {
      console.error('Failed to assign tag:', error)
      return NextResponse.json(
        { error: 'Failed to assign tag' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true }, { status: 201 })
    
  } catch (error) {
    console.error('POST /api/v1/certification-tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/certification-tags - Remove a tag from a certification
export async function DELETE(request: NextRequest) {
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
    const { certification_id, tag_id } = body
    
    // Validate required fields
    if (!certification_id || !tag_id) {
      return NextResponse.json(
        { error: 'certification_id and tag_id are required' },
        { status: 400 }
      )
    }
    
    // Verify certification belongs to user
    const { data: certification, error: certError } = await supabase
      .from('certifications')
      .select('id')
      .eq('id', certification_id)
      .eq('user_id', user.id)
      .single()
    
    if (certError || !certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }
    
    // Delete the assignment
    const { error } = await supabase
      .from('certification_tags')
      .delete()
      .eq('certification_id', certification_id)
      .eq('tag_id', tag_id)
    
    if (error) {
      console.error('Failed to remove tag:', error)
      return NextResponse.json(
        { error: 'Failed to remove tag' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true }, { status: 200 })
    
  } catch (error) {
    console.error('DELETE /api/v1/certification-tags error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
