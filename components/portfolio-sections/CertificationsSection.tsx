/**
 * Certifications Section Component
 * 
 * Displays certifications (auto-populated from user's certifications).
 * Uses CSS variables from ThemeProvider for theming.
 * 
 * Content structure:
 * {
 *   certificationIds?: string[]
 * }
 * 
 * For now, this is a placeholder that shows IDs.
 * TODO: Fetch actual certification data and display titles, issuers, etc.
 */

import type { SectionComponentProps } from './registry'

export function CertificationsSection({ section, mode }: SectionComponentProps) {
  const content = section.content as { certificationIds?: string[] } | null
  const certificationIds = content?.certificationIds || []
  
  if (mode === 'edit') {
    return (
      <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          Certifications
        </h3>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          This section is auto-populated from your certifications.
        </div>
        {certificationIds.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certificationIds.map((id) => (
              <div key={id} style={{ padding: '0.5rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                Certification ID: <code style={{ fontSize: '0.75rem' }}>{id}</code>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>
            No certifications selected. Add certifications to your profile first.
          </p>
        )}
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.5 }}>
          Full certification display coming soon
        </p>
      </div>
    )
  }
  
  // View mode
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-text)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
        Certifications
      </h2>
      {certificationIds.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {certificationIds.map((id) => (
            <div key={id} style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text)', opacity: 0.7, fontFamily: 'var(--font-body)' }}>
                Certification ID: <code style={{ fontSize: '0.75rem' }}>{id}</code>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text)', opacity: 0.5, marginTop: '0.25rem' }}>
                Full certification details coming soon
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--color-text)', fontStyle: 'italic', opacity: 0.5 }}>No certifications listed.</p>
      )}
    </section>
  )
}
