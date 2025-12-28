/**
 * Experience Section Component
 * 
 * Displays work experience or projects.
 * Uses CSS variables from ThemeProvider for theming.
 * 
 * Content structure (simplified for now):
 * {
 *   description?: string
 * }
 * 
 * TODO: Expand to support structured job/project data
 */

import type { SectionComponentProps } from './registry'

export function ExperienceSection({ section, mode }: SectionComponentProps) {
  const content = section.content as { description?: string } | null
  const description = content?.description || ''
  
  const title = section.section_type === 'work_experience' 
    ? 'Work Experience' 
    : 'Projects'
  
  if (mode === 'edit') {
    return (
      <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        {description ? (
          <p style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', opacity: 0.9 }}>{description}</p>
        ) : (
          <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>
            No {title.toLowerCase()} yet. Click Edit to add content.
          </p>
        )}
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.5 }}>
          Structured experience editor coming soon
        </p>
      </div>
    )
  }
  
  // View mode
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
        {title}
      </h2>
      {description ? (
        <div style={{ color: 'var(--color-text)', lineHeight: '1.75', whiteSpace: 'pre-wrap', opacity: 0.9, fontFamily: 'var(--font-body)' }}>
          {description}
        </div>
      ) : (
        <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No {title.toLowerCase()} listed.</p>
      )}
    </section>
  )
}
