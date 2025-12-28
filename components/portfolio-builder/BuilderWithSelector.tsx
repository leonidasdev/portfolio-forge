/**
 * Portfolio Builder with Template & Theme Selectors
 * 
 * Client component that manages the builder interface with:
 * - Template selector in sidebar
 * - Theme selector in sidebar
 * - Section builder in main area
 * - Live preview with selected template and theme
 */

'use client'

import { useState } from 'react'
import { Builder } from '@/components/portfolio-builder/Builder'
import { TemplateSelector } from '@/components/portfolio-templates/TemplateSelector'
import { ThemeSelector } from '@/components/portfolio-themes/ThemeSelector'
import { PortfolioRenderer } from '@/components/portfolio-renderer/PortfolioRenderer'
import type { Database } from '@/lib/supabase/types'

type Portfolio = Database['public']['Tables']['portfolios']['Row']
type Section = Database['public']['Tables']['portfolio_sections']['Row']

interface BuilderWithSelectorProps {
  portfolio: Portfolio
  initialSections: Section[]
}

type SidebarTab = 'template' | 'theme'

export function BuilderWithSelector({
  portfolio: initialPortfolio,
  initialSections,
}: BuilderWithSelectorProps) {
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [showPreview, setShowPreview] = useState(false)
  const [sections, setSections] = useState(initialSections)
  const [activeTab, setActiveTab] = useState<SidebarTab>('template')

  // Handle template change
  function handleTemplateChange(newTemplateId: string) {
    setPortfolio({
      ...portfolio,
      template: newTemplateId,
    })
  }

  // Handle theme change
  function handleThemeChange(newThemeId: string) {
    setPortfolio({
      ...portfolio,
      theme: newThemeId,
    })
  }

  return (
    <div>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
            Portfolio Builder
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            {portfolio.title}
          </p>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          style={{
            padding: '0.5rem 1rem',
            background: showPreview ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
          }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <aside
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            height: 'fit-content',
            position: 'sticky',
            top: '1rem',
            overflow: 'hidden',
          }}
        >
          {/* Tab Navigation */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={() => setActiveTab('template')}
              style={{
                padding: '1rem',
                background: activeTab === 'template' ? 'white' : '#f9fafb',
                border: 'none',
                borderBottom: activeTab === 'template' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === 'template' ? '600' : '400',
                color: activeTab === 'template' ? '#3b82f6' : '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              Template
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              style={{
                padding: '1rem',
                background: activeTab === 'theme' ? 'white' : '#f9fafb',
                border: 'none',
                borderBottom: activeTab === 'theme' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === 'theme' ? '600' : '400',
                color: activeTab === 'theme' ? '#3b82f6' : '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              Theme
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'template' ? (
              <TemplateSelector
                portfolioId={portfolio.id}
                currentTemplate={portfolio.template || 'single-column'}
                onTemplateChange={handleTemplateChange}
              />
            ) : (
              <ThemeSelector
                portfolioId={portfolio.id}
                currentTheme={portfolio.theme || 'light-blue'}
                onThemeChange={handleThemeChange}
              />
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main>
          {showPreview ? (
            /* Preview Mode */
            <div>
              <div
                style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  border: '1px solid #fbbf24',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#92400e',
                }}
              >
                <strong>Preview Mode:</strong> This is how your portfolio will look with the
                selected template and theme. Click &quot;Hide Preview&quot; to continue editing.
              </div>
              <div
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  background: 'white',
                }}
              >
                <PortfolioRenderer portfolio={portfolio} sections={sections} />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <Builder
              portfolio={portfolio}
              initialSections={initialSections}
            />
          )}
        </main>
      </div>
    </div>
  )
}
