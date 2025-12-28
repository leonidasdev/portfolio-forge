/**
 * Portfolio Renderer
 * 
 * Unified component that renders a portfolio using:
 * 1. Selected template layout (from template registry)
 * 2. Selected theme (from theme registry)
 * 3. ThemeProvider for CSS variables
 * 4. SectionRenderer for individual sections
 * 
 * Usage:
 * <PortfolioRenderer portfolio={portfolio} sections={sections} />
 * 
 * The component automatically:
 * - Loads the template specified in portfolio.template
 * - Loads the theme specified in portfolio.theme
 * - Falls back to defaults if template/theme not found
 */

'use client'

import { getTemplateComponent } from '@/components/portfolio-templates/registry'
import { getTheme, getDefaultTheme } from '@/components/portfolio-themes/registry'
import { ThemeProvider } from '@/components/portfolio-themes/ThemeProvider'
import type { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface PortfolioRendererProps {
  portfolio: Portfolio
  sections: Section[]
}

export function PortfolioRenderer({ portfolio, sections }: PortfolioRendererProps) {
  // Load theme from registry
  const theme = getTheme(portfolio.theme || 'light-blue') || getDefaultTheme()

  // Load template component from registry
  const TemplateComponent = getTemplateComponent(portfolio.template || 'single-column')

  // Fallback if template not found
  if (!TemplateComponent) {
    return (
      <ThemeProvider theme={theme}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Template Not Found</h1>
          <p>The selected template &quot;{portfolio.template}&quot; could not be loaded.</p>
        </div>
      </ThemeProvider>
    )
  }

  // Render portfolio with template and theme
  return (
    <ThemeProvider theme={theme}>
      <TemplateComponent portfolio={portfolio} sections={sections} theme={theme} />
    </ThemeProvider>
  )
}
