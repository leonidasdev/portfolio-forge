/**
 * GET /api/v1/templates/[id]
 * 
 * Fetch a single template definition by ID.
 * 
 * Returns:
 * - 200: Template definition
 * - 404: Template not found
 */

import { NextResponse } from 'next/server'
import { TEMPLATES } from '@/lib/templates-themes/definitions'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  
  const template = TEMPLATES.find((t) => t.id === id)
  
  if (!template) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(template)
}
