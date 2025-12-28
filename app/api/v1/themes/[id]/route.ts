/**
 * GET /api/v1/themes/[id]
 * 
 * Fetch a single theme definition by ID.
 * 
 * Returns:
 * - 200: Theme definition
 * - 404: Theme not found
 */

import { NextResponse } from 'next/server'
import { THEMES } from '@/lib/templates-themes/definitions'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const theme = THEMES.find((t) => t.id === id)
  
  if (!theme) {
    return NextResponse.json(
      { error: 'Theme not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(theme)
}
