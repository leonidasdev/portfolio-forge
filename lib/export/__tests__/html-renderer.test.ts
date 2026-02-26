/**
 * HTML Renderer Tests
 *
 * Tests for static HTML generation from portfolio data.
 */

import type { Theme } from '@/lib/templates-themes/definitions'
import type { Portfolio, Section } from '@/types/portfolio'
import { generateCSS, generatePortfolioHTML } from '../html-renderer'
import type { ExportData, HTMLGeneratorOptions } from '../types'

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
  title: 'Test Portfolio',
  slug: 'test-portfolio',
  description: 'A test portfolio description',
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
    description: null,
    display_order: 0,
    is_visible: true,
    custom_content: {
      text: 'I am a software developer',
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'section-2',
    portfolio_id: 'test-portfolio-id',
    section_type: 'skills',
    title: 'Skills',
    description: null,
    display_order: 1,
    is_visible: true,
    custom_content: {
      skills: ['JavaScript', 'TypeScript', 'React'],
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

// Helper to create HTMLGeneratorOptions
function createOptions(overrides?: Partial<ExportData>): HTMLGeneratorOptions {
  const data: ExportData = {
    portfolio: mockPortfolio,
    sections: mockSections,
    theme: mockTheme,
    templateLayout: 'single-column',
    ...overrides,
  }
  return { data }
}

describe('generatePortfolioHTML', () => {
  it('should generate valid HTML document', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('</html>')
    expect(html).toContain('Test Portfolio')
  })

  it('should include meta tags', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('<meta charset="UTF-8">')
    expect(html).toContain('<meta name="viewport"')
    expect(html).toContain('<meta name="description"')
  })

  it('should include Open Graph tags', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('og:title')
    expect(html).toContain('og:description')
    expect(html).toContain('og:type')
  })

  it('should include portfolio title', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('Test Portfolio')
  })

  it('should include portfolio description in meta', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('A test portfolio description')
  })

  it('should render about section content', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('About Me')
    expect(html).toContain('I am a software developer')
  })

  it('should render skills section', () => {
    const { html } = generatePortfolioHTML(createOptions())

    expect(html).toContain('Skills')
    expect(html).toContain('JavaScript')
    expect(html).toContain('TypeScript')
  })

  it('should escape HTML in content', () => {
    const maliciousPortfolio: Portfolio = {
      ...mockPortfolio,
      title: 'Test <script>alert("XSS")</script>',
    }

    const { html } = generatePortfolioHTML(createOptions({ portfolio: maliciousPortfolio }))

    expect(html).not.toContain('<script>alert("XSS")</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('should generate CSS with html', () => {
    const result = generatePortfolioHTML(createOptions())

    expect(result.html).toBeDefined()
    expect(result.css).toBeDefined()
    expect(typeof result.css).toBe('string')
    expect(result.css.length).toBeGreaterThan(0)
  })
})

describe('generateCSS', () => {
  it('should generate CSS with theme colors', () => {
    const css = generateCSS(mockTheme)

    expect(css).toContain('--color-primary: #3b82f6')
    expect(css).toContain('--color-secondary: #6366f1')
    expect(css).toContain('--color-background: #ffffff')
    expect(css).toContain('--color-text: #111827')
  })

  it('should generate CSS with theme fonts', () => {
    const css = generateCSS(mockTheme)

    expect(css).toContain('Inter')
  })

  it('should include base styles', () => {
    const css = generateCSS(mockTheme)

    expect(css).toContain('box-sizing: border-box')
    expect(css).toContain('font-family: var(--font-body)')
  })

  it('should include portfolio container styles', () => {
    const css = generateCSS(mockTheme)

    expect(css).toContain('.portfolio-container')
  })
})
