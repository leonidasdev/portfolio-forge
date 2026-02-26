/**
 * Static Generator Tests
 *
 * Tests for static site generation and bundling.
 */

import type { Theme } from '@/lib/templates-themes/definitions'
import type { Portfolio, Section } from '@/types/portfolio'
import {
  generateStaticSite,
  generateZipBundle,
  type StaticGeneratorOptions,
} from '../static-generator'
import type { ExportConfig, ExportData } from '../types'

// Mock theme
const mockTheme: Theme = {
  id: 'test-theme',
  name: 'Test Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    background: '#ffffff',
    text: '#111827',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  spacing: {
    base: 16,
  },
}

// Mock portfolio
const mockPortfolio: Portfolio = {
  id: 'test-portfolio-id',
  user_id: 'test-user-id',
  title: 'My Test Portfolio',
  slug: 'my-test-portfolio',
  description: 'A test portfolio',
  theme: 'test-theme',
  template: 'single-column',
  is_public: true,
  is_deleted: false,
  public_link_token: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock sections
const mockSections: Section[] = [
  {
    id: 'section-1',
    portfolio_id: 'test-portfolio-id',
    section_type: 'about',
    title: 'About Me',
    description: 'I am a software developer',
    display_order: 0,
    is_visible: true,
    custom_content: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Helper to create options
function createOptions(overrides?: Partial<StaticGeneratorOptions>): StaticGeneratorOptions {
  const config: ExportConfig = {
    portfolioId: mockPortfolio.id,
    platform: 'github_pages',
  }
  const data: ExportData = {
    portfolio: mockPortfolio,
    sections: mockSections,
    theme: mockTheme,
    templateLayout: 'single-column',
  }
  return { config, data, ...overrides }
}

describe('generateStaticSite', () => {
  it('should generate a bundle with required files', async () => {
    const bundle = await generateStaticSite(createOptions())

    expect(bundle.files).toBeDefined()
    expect(bundle.files.length).toBeGreaterThan(0)

    const fileNames = bundle.files.map((f) => f.path)
    expect(fileNames).toContain('index.html')
    expect(fileNames).toContain('404.html')
    expect(fileNames).toContain('robots.txt')
    expect(fileNames).toContain('.nojekyll')
  })

  it('should include sitemap.xml when generateSitemap is true', async () => {
    const options = createOptions()
    options.config.generateSitemap = true
    options.baseUrl = 'https://example.github.io/portfolio'

    const bundle = await generateStaticSite(options)

    const sitemap = bundle.files.find((f) => f.path === 'sitemap.xml')
    expect(sitemap).toBeDefined()
    expect(sitemap?.content).toContain('https://example.github.io/portfolio')
  })

  it('should include CNAME file when customDomain is provided', async () => {
    const options = createOptions()
    options.config.customDomain = 'portfolio.example.com'

    const bundle = await generateStaticSite(options)

    const cname = bundle.files.find((f) => f.path === 'CNAME')
    expect(cname).toBeDefined()
    expect(cname?.content).toBe('portfolio.example.com')
  })

  it('should not include CNAME when customDomain is not provided', async () => {
    const bundle = await generateStaticSite(createOptions())

    const cname = bundle.files.find((f) => f.path === 'CNAME')
    expect(cname).toBeUndefined()
  })

  it('should compute total size correctly', async () => {
    const bundle = await generateStaticSite(createOptions())

    expect(bundle.totalSize).toBeGreaterThan(0)

    // totalSize should equal sum of all file content lengths
    const computedSize = bundle.files.reduce(
      (sum, f) => sum + (typeof f.content === 'string' ? f.content.length : f.content.length),
      0
    )
    expect(bundle.totalSize).toBe(computedSize)
  })

  it('should generate valid HTML in index.html', async () => {
    const bundle = await generateStaticSite(createOptions())

    const indexHtml = bundle.files.find((f) => f.path === 'index.html')
    expect(indexHtml).toBeDefined()
    expect(indexHtml?.content).toContain('<!DOCTYPE html>')
    expect(indexHtml?.content).toContain(mockPortfolio.title)
  })

  it('should include entryPoint in bundle', async () => {
    const bundle = await generateStaticSite(createOptions())

    expect(bundle.entryPoint).toBe('index.html')
  })

  it('should include generatedAt timestamp', async () => {
    const bundle = await generateStaticSite(createOptions())

    expect(bundle.generatedAt).toBeInstanceOf(Date)
  })
})

describe('generateZipBundle', () => {
  it('should generate a valid ZIP buffer', async () => {
    const options = createOptions()
    const zipBuffer = await generateZipBundle(options)

    expect(zipBuffer).toBeInstanceOf(Buffer)
    expect(zipBuffer.length).toBeGreaterThan(0)

    // ZIP file magic bytes check (PK..)
    expect(zipBuffer[0]).toBe(0x50) // P
    expect(zipBuffer[1]).toBe(0x4b) // K
  })

  it('should generate ZIP larger than empty', async () => {
    const options = createOptions()
    const zipBuffer = await generateZipBundle(options)

    // ZIP should be at least a few hundred bytes with the base files
    expect(zipBuffer.length).toBeGreaterThan(100)
  })
})
