/**
 * Skills Section Component
 * 
 * Displays a list of skills.
 * Uses CSS variables from ThemeProvider for theming.
 * 
 * Content structure:
 * {
 *   skills: string[]
 * }
 */

import type { SectionComponentProps } from './registry'

export function SkillsSection({ section, mode }: SectionComponentProps) {
  const content = section.content as { skills?: string[] } | null
  const skills = content?.skills || []
  
  if (mode === 'edit') {
    return (
      <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Skills
        </h3>
        {skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.map((skill, index) => (
              <span
                key={index}
                style={{ padding: '0.5rem 0.75rem', background: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.875rem', opacity: 0.8 }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No skills yet. Click Edit to add skills.</p>
        )}
      </div>
    )
  }
  
  // View mode
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
        Skills
      </h2>
      {skills.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.map((skill, index) => (
            <span
              key={index}
              style={{ padding: '0.75rem 1rem', background: 'var(--color-primary)', color: 'white', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500', fontFamily: 'var(--font-body)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No skills listed.</p>
      )}
    </section>
  )
}
