/**
 * Export Module
 *
 * Static site generation and deployment utilities for Portfolio Forge.
 * Supports GitHub Pages, ZIP downloads, and other deployment targets.
 */

// Types
export type {
  CSSGeneratorOptions,
  ExportBundle,
  ExportConfig,
  ExportData,
  ExportResult,
  ExportStatus,
  GeneratedFile,
  GitHubExportConfig,
  GitHubRepoInfo,
  HTMLGeneratorOptions,
} from './types'

// HTML Generation
export { generateCSS, generatePortfolioHTML } from './html-renderer'

// Static Site Generation
export {
  estimateBundleSize,
  generateStaticSite,
  generateZipBundle,
  validateExportData,
} from './static-generator'
