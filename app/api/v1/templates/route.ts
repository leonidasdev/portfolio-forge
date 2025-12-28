/**
 * GET /api/v1/templates
 * 
 * List all available portfolio templates.
 * 
 * Returns:
 * - 200: Array of template definitions
 * 
 * Templates are currently static but can be moved to database in the future.
 */

import { NextResponse } from 'next/server'
import { TEMPLATES } from '@/lib/templates-themes/definitions'

export async function GET() {
  return NextResponse.json(TEMPLATES)
}
