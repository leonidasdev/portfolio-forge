/**
 * Static Generator
 *
 * Main orchestrator for generating static portfolio exports.
 * Coordinates HTML rendering, asset bundling, and file generation.
 */

import type { Theme } from '@/lib/templates-themes/definitions'
import { generatePortfolioHTML } from './html-renderer'
import type {
  ExportBundle,
  ExportConfig,
  ExportData,
  GeneratedFile,
  HTMLGeneratorOptions,
} from './types'

// ============================================================================
// File Generators
// ============================================================================

/**
 * Generate robots.txt content
 */
function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`
}

/**
 * Generate sitemap.xml content
 */
function generateSitemapXml(baseUrl: string, lastMod: Date): string {
  const dateStr = lastMod.toISOString().split('T')[0]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
}

/**
 * Generate CNAME file for custom domain
 */
function generateCNAME(domain: string): string {
  return domain.trim()
}

/**
 * Generate 404.html (GitHub Pages will serve this for missing routes)
 */
function generate404Page(theme: Theme, portfolioTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - ${portfolioTitle}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: ${theme.colors.background};
      color: ${theme.colors.text};
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    p {
      opacity: 0.8;
      margin-bottom: 2rem;
    }
    a {
      color: ${theme.colors.primary};
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border: 2px solid ${theme.colors.primary};
      border-radius: 0.5rem;
    }
    a:hover {
      background: ${theme.colors.primary};
      color: white;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go to Portfolio</a>
  </div>
</body>
</html>`
}

/**
 * Generate GitHub Pages workflow file for automatic deployment
 */
function generateGitHubWorkflow(): string {
  return `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`
}

/**
 * Generate .nojekyll file (prevents Jekyll processing on GitHub Pages)
 */
function generateNoJekyll(): string {
  return ''
}

// ============================================================================
// Main Generator
// ============================================================================

export interface StaticGeneratorOptions {
  /** Export configuration */
  config: ExportConfig
  /** Portfolio data */
  data: ExportData
  /** Base URL for the deployed site */
  baseUrl?: string
}

/**
 * Generate a complete static site bundle from portfolio data
 */
export async function generateStaticSite(options: StaticGeneratorOptions): Promise<ExportBundle> {
  const { config, data, baseUrl = '' } = options
  const { theme, portfolio } = data

  const files: GeneratedFile[] = []
  const now = new Date()

  // 1. Generate main HTML
  const htmlOptions: HTMLGeneratorOptions = {
    data,
    baseUrl,
    inlineStyles: false, // Use external CSS for caching
    minify: config.minify,
    meta: {
      title: portfolio.title || 'My Portfolio',
      description: portfolio.description || undefined,
    },
  }

  const { html, css } = generatePortfolioHTML(htmlOptions)

  files.push({
    path: 'index.html',
    content: html,
    mimeType: 'text/html',
  })

  // 2. Generate CSS file
  files.push({
    path: 'styles.css',
    content: css,
    mimeType: 'text/css',
  })

  // 3. Generate 404 page
  files.push({
    path: '404.html',
    content: generate404Page(theme, portfolio.title || 'Portfolio'),
    mimeType: 'text/html',
  })

  // 4. Generate robots.txt (if enabled)
  if (config.generateRobots !== false) {
    files.push({
      path: 'robots.txt',
      content: generateRobotsTxt(baseUrl || 'https://example.com'),
      mimeType: 'text/plain',
    })
  }

  // 5. Generate sitemap.xml (if enabled)
  if (config.generateSitemap !== false) {
    files.push({
      path: 'sitemap.xml',
      content: generateSitemapXml(baseUrl || 'https://example.com', now),
      mimeType: 'application/xml',
    })
  }

  // 6. Generate CNAME for custom domain (GitHub Pages)
  if (config.customDomain) {
    files.push({
      path: 'CNAME',
      content: generateCNAME(config.customDomain),
      mimeType: 'text/plain',
    })
  }

  // 7. Generate .nojekyll (GitHub Pages)
  if (config.platform === 'github_pages') {
    files.push({
      path: '.nojekyll',
      content: generateNoJekyll(),
      mimeType: 'text/plain',
    })

    // 8. Generate GitHub Actions workflow
    files.push({
      path: '.github/workflows/deploy.yml',
      content: generateGitHubWorkflow(),
      mimeType: 'text/yaml',
    })
  }

  // Calculate total size
  const totalSize = files.reduce((sum, file) => {
    const content = file.content
    return sum + (typeof content === 'string' ? Buffer.byteLength(content) : content.length)
  }, 0)

  return {
    files,
    entryPoint: 'index.html',
    totalSize,
    generatedAt: now,
  }
}

/**
 * Generate a ZIP-downloadable bundle
 * Note: Requires 'jszip' package to be installed
 */
export async function generateZipBundle(options: StaticGeneratorOptions): Promise<Buffer> {
  // Dynamic import to avoid bundling jszip if not used
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  const bundle = await generateStaticSite(options)

  for (const file of bundle.files) {
    zip.file(file.path, file.content)
  }

  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Estimate the size of the generated bundle without actually generating it
 */
export function estimateBundleSize(data: ExportData): number {
  // Rough estimates based on typical portfolio sizes
  const baseSize = 15000 // ~15KB base (HTML + CSS)
  const perSectionSize = 2000 // ~2KB per section

  return baseSize + data.sections.length * perSectionSize
}

/**
 * Validate export data before generation
 */
export function validateExportData(data: ExportData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.portfolio) {
    errors.push('Portfolio data is required')
  }

  if (!data.theme) {
    errors.push('Theme is required')
  }

  if (!data.templateLayout) {
    errors.push('Template layout is required')
  }

  if (!Array.isArray(data.sections)) {
    errors.push('Sections must be an array')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
