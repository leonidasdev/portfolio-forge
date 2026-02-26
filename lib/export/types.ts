/**
 * Export System Types
 *
 * Type definitions for the GitHub Pages export feature.
 */

import type { Theme } from '@/lib/templates-themes/definitions'
import type { Portfolio, Section } from '@/types/portfolio'

// ============================================================================
// Export Configuration
// ============================================================================

export interface ExportConfig {
  /** Portfolio ID to export */
  portfolioId: string
  /** Target platform for export */
  platform: 'github_pages' | 'zip' | 'netlify'
  /** Custom domain (optional) */
  customDomain?: string
  /** Repository name (for GitHub Pages) */
  repoName?: string
  /** Include assets (images, etc.) */
  includeAssets?: boolean
  /** Minify output */
  minify?: boolean
  /** Generate sitemap */
  generateSitemap?: boolean
  /** Generate robots.txt */
  generateRobots?: boolean
}

// ============================================================================
// Export Data
// ============================================================================

export interface ExportData {
  portfolio: Portfolio
  sections: Section[]
  theme: Theme
  templateLayout: string
  profile?: {
    fullName: string
    email: string
    avatarUrl?: string
    headline?: string
    location?: string
  }
}

// ============================================================================
// Generated Files
// ============================================================================

export interface GeneratedFile {
  /** File path relative to output root */
  path: string
  /** File content (string for text, Buffer for binary) */
  content: string | Buffer
  /** MIME type */
  mimeType: string
}

export interface ExportBundle {
  /** All generated files */
  files: GeneratedFile[]
  /** Main entry point (usually index.html) */
  entryPoint: string
  /** Total size in bytes */
  totalSize: number
  /** Generation timestamp */
  generatedAt: Date
}

// ============================================================================
// Export Status
// ============================================================================

export type ExportStatus =
  | 'pending'
  | 'generating'
  | 'uploading'
  | 'deploying'
  | 'deployed'
  | 'failed'

export interface ExportResult {
  /** Unique export ID */
  exportId: string
  /** Current status */
  status: ExportStatus
  /** Progress percentage (0-100) */
  progress: number
  /** Status message */
  message: string
  /** Deployed URL (when status is 'deployed') */
  deployedUrl?: string
  /** GitHub repository URL */
  repoUrl?: string
  /** Commit SHA */
  commitSha?: string
  /** Error message (when status is 'failed') */
  error?: string
  /** Timestamps */
  startedAt: Date
  completedAt?: Date
}

// ============================================================================
// GitHub-specific Types
// ============================================================================

export interface GitHubExportConfig extends ExportConfig {
  platform: 'github_pages'
  /** GitHub access token */
  accessToken: string
  /** GitHub username */
  username: string
  /** Whether to use username.github.io (user site) or username/repo (project site) */
  siteType: 'user' | 'project'
  /** Repository name (required for project sites) */
  repoName: string
  /** Branch for GitHub Pages (usually 'gh-pages' or 'main') */
  branch?: string
  /** Custom domain (CNAME) */
  customDomain?: string
}

export interface GitHubRepoInfo {
  owner: string
  repo: string
  fullName: string
  htmlUrl: string
  defaultBranch: string
  isPrivate: boolean
  hasPages: boolean
  pagesUrl?: string
}

// ============================================================================
// HTML Generation
// ============================================================================

export interface HTMLGeneratorOptions {
  /** Portfolio data */
  data: ExportData
  /** Base URL for assets */
  baseUrl?: string
  /** Include inline styles (vs external CSS) */
  inlineStyles?: boolean
  /** Minify HTML output */
  minify?: boolean
  /** Meta tags for SEO */
  meta?: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
    twitterCard?: 'summary' | 'summary_large_image'
  }
}

export interface CSSGeneratorOptions {
  /** Theme to use */
  theme: Theme
  /** Template layout */
  layout: string
  /** Minify CSS output */
  minify?: boolean
  /** Include CSS reset */
  includeReset?: boolean
}
