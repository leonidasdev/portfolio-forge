/**
 * Theme Provider
 * 
 * Applies theme values using CSS variables.
 * Wraps portfolio content to enable consistent theming across templates.
 * 
 * CSS Variables:
 * - --color-primary
 * - --color-secondary
 * - --color-background
 * - --color-text
 * - --font-heading
 * - --font-body
 * - --spacing-base
 */

'use client'

import type { Theme } from '@/lib/templates-themes/definitions'

interface ThemeProviderProps {
  theme: Theme
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const style = {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-background': theme.colors.background,
    '--color-text': theme.colors.text,
    '--font-heading': theme.typography.headingFont,
    '--font-body': theme.typography.bodyFont,
    '--spacing-base': `${theme.spacing.base}px`,
  } as React.CSSProperties

  return (
    <div
      style={{
        ...style,
        minHeight: '100vh',
        background: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </div>
  )
}
