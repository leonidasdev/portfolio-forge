/**
 * Template Selector Component
 * 
 * Allows users to browse and select portfolio templates.
 * Fetches available templates from the API and updates the portfolio.
 * 
 * Features:
 * - Loads templates from GET /api/v1/templates
 * - Displays template cards with name, description, layout type
 * - Highlights currently selected template
 * - Updates portfolio via PATCH /api/v1/portfolios/[id]/template
 * - Optimistic UI updates for better UX
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Template } from '@/lib/templates-themes/definitions'

interface TemplateSelectorProps {
  portfolioId: string
  currentTemplate: string
  onTemplateChange: (templateId: string) => void
}

export function TemplateSelector({
  portfolioId,
  currentTemplate,
  onTemplateChange,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch available templates on mount
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await apiClient.get<Template[]>('/templates')
        setTemplates(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  // Handle template selection
  async function handleSelectTemplate(templateId: string) {
    if (templateId === selectedTemplate || isSaving) return

    // Optimistic update
    const previousTemplate = selectedTemplate
    setSelectedTemplate(templateId)
    setIsSaving(true)

    try {
      await apiClient.patch(`/portfolios/${portfolioId}/template`, { 
        template: templateId 
      })

      // Notify parent component of change
      onTemplateChange(templateId)
    } catch (err) {
      // Revert on error
      setSelectedTemplate(previousTemplate)
      setError(err instanceof Error ? err.message : 'Failed to update template')
    } finally {
      setIsSaving(false)
    }
  }

  // Get layout badge color
  function getLayoutBadgeColor(layout: string) {
    const colors: Record<string, string> = {
      'single-column': '#3b82f6',
      'two-column': '#8b5cf6',
      'timeline': '#10b981',
      'grid': '#f59e0b',
    }
    return colors[layout] || '#6b7280'
  }

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading templates...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <p style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
        Select Template
      </h3>

      {isSaving && (
        <div
          style={{
            padding: '0.5rem',
            background: '#dbeafe',
            color: '#1e40af',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}
        >
          Updating template...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplate
          const layoutColor = getLayoutBadgeColor(template.layout)

          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              disabled={isSaving}
              style={{
                padding: '1rem',
                textAlign: 'left',
                background: isSelected ? '#f0f9ff' : 'white',
                border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '0.5rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.borderColor = '#3b82f6'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isSaving) {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }
              }}
            >
              {/* Template Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {template.name}
                </h4>
                {isSelected && (
                  <span
                    style={{
                      padding: '0.125rem 0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      fontSize: '0.75rem',
                      borderRadius: '0.25rem',
                      fontWeight: '500',
                    }}
                  >
                    Active
                  </span>
                )}
              </div>

              {/* Layout Badge */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: layoutColor,
                    color: 'white',
                    fontSize: '0.75rem',
                    borderRadius: '0.25rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {template.layout.replace('-', ' ')}
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: '1.5',
                }}
              >
                {template.description}
              </p>

              {/* Supported Sections Count */}
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  margin: '0.5rem 0 0 0',
                }}
              >
                Supports {template.supportedSections.length} section types
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
