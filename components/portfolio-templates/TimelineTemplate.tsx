/**
 * Timeline Template
 * 
 * A chronological timeline layout that emphasizes career progression.
 * Sections are displayed with a vertical timeline connector.
 * Best for showcasing experience and project history.
 */

'use client'

import { SectionRenderer } from '@/components/portfolio-sections/SectionRenderer'
import type { TemplateComponentProps } from './registry'

export function TimelineTemplate({ portfolio, sections, theme }: TemplateComponentProps) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Portfolio Header */}
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
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

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Vertical Line */}
        <div
          style={{
            position: 'absolute',
            left: '0',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'var(--color-primary)',
            opacity: 0.3,
          }}
        />

        {/* Timeline Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {sections.map((section, index) => (
            <div key={section.id} style={{ position: 'relative' }}>
              {/* Timeline Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2.5rem',
                  top: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '3px solid var(--color-background)',
                }}
              />

              {/* Section Content */}
              <div>
                <SectionRenderer section={section} mode="view" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
