/**
 * GitHub Module
 *
 * GitHub API integration for Portfolio Forge.
 * Handles repository management and GitHub Pages deployment.
 */

export {
  GitHubAPIException,
  GitHubClient,
  deployToGitHubPages,
  ensurePortfolioRepo,
} from './client'

export type { CommitOptions, CreateRepoOptions, GitHubClientConfig, GitHubUser } from './client'
