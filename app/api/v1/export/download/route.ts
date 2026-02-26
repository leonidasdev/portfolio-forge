/**
 * Download Export API Route
 *
 * POST /api/v1/export/download - Generate and download portfolio as ZIP
 *
 * Request body:
 * {
 *   portfolioId: string - Portfolio ID to export
 * }
 *
 * Returns: ZIP file download
 */

import { getDefaultTheme, getTheme } from '@/components/portfolio-themes/registry'
import { requireAuth } from '@/lib/api/auth-middleware'
import { rateLimitConfigs, withRateLimit } from '@/lib/api/rate-limit'
import { ApiError, withApiHandler } from '@/lib/api/route-handler'
import type { ExportData } from '@/lib/export'
import { generateZipBundle, validateExportData } from '@/lib/export'
import { queries } from '@/lib/supabase/queries'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Request validation schema
const downloadSchema = z.object({
  portfolioId: z.string().uuid('Invalid portfolio ID'),
})

export const POST = withRateLimit(
  withApiHandler(async (request: NextRequest) => {
    const { supabase } = await requireAuth(request)

    // Parse and validate request body
    const json = await request.json()
    const parseResult = downloadSchema.safeParse(json)

    if (!parseResult.success) {
      throw new ApiError(parseResult.error.issues.map((e) => e.message).join(', '), 400)
    }

    const { portfolioId } = parseResult.data

    // 1. Fetch portfolio data using typed query helper
    const { data: portfolio, error: portfolioError } = await queries.portfolios.getById(
      supabase,
      portfolioId
    )

    if (portfolioError || !portfolio) {
      throw new ApiError('Portfolio not found', 404)
    }

    // 2. Fetch portfolio sections using typed query helper
    const { data: sections, error: sectionsError } = await queries.sections.listByPortfolio(
      supabase,
      portfolioId
    )

    if (sectionsError) {
      throw new ApiError('Failed to fetch portfolio sections', 500)
    }

    // 3. Get theme
    const theme = getTheme(portfolio.theme || 'light-blue') || getDefaultTheme()

    // 4. Prepare export data
    const exportData: ExportData = {
      portfolio,
      sections: sections || [],
      theme,
      templateLayout: portfolio.template || 'single-column',
    }

    // 5. Validate export data
    const validation = validateExportData(exportData)
    if (!validation.valid) {
      throw new ApiError(`Invalid export data: ${validation.errors.join(', ')}`, 400)
    }

    // 6. Generate ZIP bundle
    let zipBuffer: Buffer
    try {
      zipBuffer = await generateZipBundle({
        config: {
          portfolioId,
          platform: 'zip',
          minify: true,
          generateSitemap: true,
          generateRobots: true,
        },
        data: exportData,
        baseUrl: '', // Relative URLs for local hosting
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new ApiError(`ZIP generation failed: ${error.message}`, 500)
      }
      throw new ApiError('Failed to generate ZIP file', 500)
    }

    // 7. Generate filename
    const sanitizedTitle = (portfolio.title || 'portfolio')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const filename = `${sanitizedTitle}-export.zip`

    // 8. Return ZIP file (convert Buffer to Uint8Array for NextResponse compatibility)
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    })
  }),
  rateLimitConfigs.export
)
