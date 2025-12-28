/**
 * Theme Selector Component
 * 
 * Allows users to browse and select portfolio themes.
 * Fetches available themes from the API and updates the portfolio.
 * 
 * Features:
 * - Loads themes from GET /api/v1/themes
 * - Displays theme cards with color swatches and typography preview
 * - Highlights currently selected theme
 * - Updates portfolio via PATCH /api/v1/portfolios/[id]/theme
 * - Optimistic UI updates for better UX
 */

'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Theme } from '@/lib/templates-themes/definitions'

interface ThemeSelectorProps {
  portfolioId: string
  currentTheme: string
  onThemeChange: (themeId: string) => void
}

export function ThemeSelector({
  portfolioId,
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch available themes on mount
  useEffect(() => {
    async function fetchThemes() {
      try {
        const data = await apiClient.get<Theme[]>('/themes')
        setThemes(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load themes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchThemes()
  }, [])

  // Handle theme selection
  async function handleSelectTheme(themeId: string) {
    if (themeId === selectedTheme || isSaving) return

    // Optimistic update
    const previousTheme = selectedTheme
    setSelectedTheme(themeId)
    setIsSaving(true)

    try {
      await apiClient.patch(`/portfolios/${portfolioId}/theme`, { 
        theme: themeId 
      })

      // Notify parent component of change
      onThemeChange(themeId)
    } catch (err) {
      // Revert on error
      setSelectedTheme(previousTheme)
      setError(err instanceof Error ? err.message : 'Failed to update theme')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading themes...</p>
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
        Select Theme
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
          Updating theme...
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {themes.map((theme) => {
          const isSelected = theme.id === selectedTheme

          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme.id)}
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
              {/* Theme Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {theme.name}
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

              {/* Color Swatches */}
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Colors:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.375rem',
                      background: theme.colors.primary,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title={`Primary: ${theme.colors.primary}`}
                  />
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.375rem',
                      background: theme.colors.secondary,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title={`Secondary: ${theme.colors.secondary}`}
                  />
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.375rem',
                      background: theme.colors.background,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title={`Background: ${theme.colors.background}`}
                  />
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.375rem',
                      background: theme.colors.text,
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    title={`Text: ${theme.colors.text}`}
                  />
                </div>
              </div>

              {/* Typography Preview */}
              <div>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Typography:
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
                  Heading: <span style={{ fontWeight: '600' }}>{theme.typography.headingFont}</span>
                </p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
                  Body: <span style={{ fontWeight: '400' }}>{theme.typography.bodyFont}</span>
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
