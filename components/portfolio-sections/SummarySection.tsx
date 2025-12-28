/**
 * Summary Section Component
 * 
 * Displays a summary/bio section with text content.
 * Uses CSS variables from ThemeProvider for theming.
 * 
 * Content structure:
 * {
 *   text: string
 * }
 */

import type { SectionComponentProps } from './registry'

export function SummarySection({ section, mode }: SectionComponentProps) {
  const content = section.content as { text?: string } | null
  const text = content?.text || ''
  
  if (mode === 'edit') {
    return (
      <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Summary
        </h3>
        {text ? (
          <p style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', opacity: 0.9 }}>{text}</p>
        ) : (
          <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No summary text yet. Click Edit to add content.</p>
        )}
      </div>
    )
  }
  
  // View mode
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
        About Me
      </h2>
      {text ? (
        <p style={{ color: 'var(--color-text)', lineHeight: '1.75', whiteSpace: 'pre-wrap', opacity: 0.9, fontFamily: 'var(--font-body)' }}>
          {text}
        </p>
      ) : (
        <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No summary available.</p>
      )}
    </section>
  )
}
