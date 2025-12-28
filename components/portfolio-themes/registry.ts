/**
 * Theme Registry
 * 
 * Maps theme IDs to their theme definitions.
 * Themes from the API (Subtask 6.1) are available here.
 */

import { THEMES, type Theme } from '@/lib/templates-themes/definitions'

/**
 * Registry mapping theme IDs to theme objects
 */
export const themeRegistry: Record<string, Theme> = THEMES.reduce(
  (acc, theme) => {
    acc[theme.id] = theme
    return acc
  },
  {} as Record<string, Theme>
)

/**
 * Check if a theme ID is registered
 */
export function isRegisteredTheme(themeId: string): themeId is keyof typeof themeRegistry {
  return themeId in themeRegistry
}

/**
 * Get theme by ID
 */
export function getTheme(themeId: string): Theme | null {
  if (!isRegisteredTheme(themeId)) {
    console.warn(`Unknown theme ID: ${themeId}`)
    return null
  }
  return themeRegistry[themeId]
}

/**
 * Get default theme (fallback)
 */
export function getDefaultTheme(): Theme {
  return THEMES[0] // light-blue
}
