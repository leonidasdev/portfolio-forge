/**
 * Two Column Template
 * 
 * A two-column layout with sidebar for quick access information.
 * Main content flows in the larger right column.
 * Ideal for traditional portfolios and resumes.
 */

'use client'

import { SectionRenderer } from '@/components/portfolio-sections/SectionRenderer'
import type { TemplateComponentProps } from './registry'

export function TwoColumnTemplate({ portfolio, sections, theme }: TemplateComponentProps) {
  // Split sections: summary/skills in sidebar, rest in main content
  const sidebarSections = sections.filter(
    (s) => s.section_type === 'summary' || s.section_type === 'skills'
  )
  const mainSections = sections.filter(
    (s) => s.section_type !== 'summary' && s.section_type !== 'skills'
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Portfolio Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: 'var(--color-text)',
          }}
        >
          {portfolio.title}
        </h1>
        {portfolio.description && (
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text)',
              opacity: 0.8,
            }}
          >
            {portfolio.description}
          </p>
        )}
      </header>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sidebarSections.map((section) => (
            <div key={section.id}>
              <SectionRenderer section={section} mode="view" />
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {mainSections.map((section) => (
            <div key={section.id}>
              <SectionRenderer section={section} mode="view" />
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
