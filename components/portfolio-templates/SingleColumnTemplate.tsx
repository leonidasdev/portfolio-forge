/**
 * Single Column Template
 * 
 * A clean, single-column layout that stacks all sections vertically.
 * Perfect for showcasing work with minimal distractions.
 */

'use client'

import { SectionRenderer } from '@/components/portfolio-sections/SectionRenderer'
import type { TemplateComponentProps } from './registry'

export function SingleColumnTemplate({ portfolio, sections, theme }: TemplateComponentProps) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Portfolio Header */}
      <header style={{ marginBottom: '3rem' }}>
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

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map((section) => (
          <div key={section.id}>
            <SectionRenderer section={section} mode="view" />
          </div>
        ))}
      </div>
    </div>
  )
}
