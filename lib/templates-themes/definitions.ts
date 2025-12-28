/**
 * Template and Theme Definitions
 * 
 * Static definitions for portfolio templates and themes.
 * These can be moved to a database or CMS in the future.
 */

export interface Template {
  id: string
  name: string
  description: string
  supportedSections: string[]
  layout: 'single-column' | 'two-column' | 'timeline' | 'grid'
}

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
  }
  typography: {
    headingFont: string
    bodyFont: string
  }
  spacing: {
    base: number
  }
}

/**
 * Available templates
 */
export const TEMPLATES: Template[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'A clean, single-column layout perfect for showcasing your work with minimal distractions.',
    supportedSections: ['summary', 'skills', 'work_experience', 'projects', 'certifications', 'custom'],
    layout: 'single-column',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'A two-column layout with sidebar for contact info and skills, ideal for traditional portfolios.',
    supportedSections: ['summary', 'skills', 'work_experience', 'projects', 'certifications', 'custom'],
    layout: 'two-column',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'A chronological timeline layout that emphasizes your career progression and achievements.',
    supportedSections: ['summary', 'work_experience', 'projects', 'certifications', 'custom'],
    layout: 'timeline',
  },
  {
    id: 'grid-showcase',
    name: 'Grid Showcase',
    description: 'A grid-based layout optimized for displaying projects and visual work in a portfolio gallery.',
    supportedSections: ['summary', 'projects', 'skills', 'certifications', 'custom'],
    layout: 'grid',
  },
]

/**
 * Available themes
 */
export const THEMES: Theme[] = [
  {
    id: 'light-blue',
    name: 'Light Blue',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    spacing: {
      base: 16,
    },
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    colors: {
      primary: '#10b981',
      secondary: '#06b6d4',
      background: '#0f172a',
      text: '#f1f5f9',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    spacing: {
      base: 16,
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Sunset',
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      background: '#fffbeb',
      text: '#78350f',
    },
    typography: {
      headingFont: 'Merriweather',
      bodyFont: 'Open Sans',
    },
    spacing: {
      base: 18,
    },
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      background: '#faf5ff',
      text: '#4c1d95',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Lato',
    },
    spacing: {
      base: 16,
    },
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    colors: {
      primary: '#14b8a6',
      secondary: '#0ea5e9',
      background: '#f0fdfa',
      text: '#134e4a',
    },
    typography: {
      headingFont: 'Montserrat',
      bodyFont: 'Roboto',
    },
    spacing: {
      base: 16,
    },
  },
]
