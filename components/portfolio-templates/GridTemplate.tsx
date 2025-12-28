/**
 * Grid Template
 * 
 * A grid-based layout optimized for displaying projects and visual work.
 * Summary appears at top, then sections flow in a responsive grid.
 * Perfect for portfolio galleries.
 */

'use client'

import { SectionRenderer } from '@/components/portfolio-sections/SectionRenderer'
import type { TemplateComponentProps } from './registry'

export function GridTemplate({ portfolio, sections, theme }: TemplateComponentProps) {
  // Summary section gets full width at top
  const summarySection = sections.find((s) => s.section_type === 'summary')
  const gridSections = sections.filter((s) => s.section_type !== 'summary')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Portfolio Header */}
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
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
              fontSize: '1.125rem',
              color: 'var(--color-text)',
              opacity: 0.8,
            }}
          >
            {portfolio.description}
          </p>
        )}
      </header>

      {/* Summary Section (Full Width) */}
      {summarySection && (
        <div style={{ marginBottom: '3rem' }}>
          <SectionRenderer section={summarySection} mode="view" />
        </div>
      )}

      {/* Grid Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
        }}
      >
        {gridSections.map((section) => (
          <div key={section.id}>
            <SectionRenderer section={section} mode="view" />
          </div>
        ))}
      </div>
    </div>
  )
}
