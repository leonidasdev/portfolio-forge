/**
 * Tags API Routes (Individual)
 *
 * DELETE /api/v1/tags/[id] - Delete a tag
 *
 * Note: Deleting a tag will cascade delete all junction table entries
 * (certification_tags, project_tags, etc.) due to database constraints.
 */

import { requireAuth } from '@/lib/api/auth-middleware'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/v1/tags/[id] - Delete a tag
export const DELETE = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { user, supabase } = await requireAuth(request)

    // Get tag ID from params (Next.js 15 - params is a Promise)
    const { id } = await params

    if (!id) {
      throw new ApiError('Tag ID is required', 400)
    }

    // Verify tag exists and belongs to user
    const { data: tag, error: fetchError } = await (supabase.from('tags') as any)
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !tag) {
      throw new ApiError('Tag not found', 404)
    }

    // Delete the tag (cascade will handle junction tables)
    const { error } = await (supabase.from('tags') as any)
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new ApiError('Failed to delete tag', 500)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  }
)
