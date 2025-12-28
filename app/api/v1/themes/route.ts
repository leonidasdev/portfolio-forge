/**
 * GET /api/v1/themes
 * 
 * List all available portfolio themes.
 * 
 * Returns:
 * - 200: Array of theme definitions
 * 
 * Themes are currently static but can be moved to database in the future.
 */

import { NextResponse } from 'next/server'
import { THEMES } from '@/lib/templates-themes/definitions'

export async function GET() {
  return NextResponse.json(THEMES)
}
