/**
 * GitHub API Client
 *
 * Handles GitHub API interactions for repository management and deployment.
 * Uses the GitHub REST API v3.
 */

import type { ExportBundle, GitHubRepoInfo } from '../export/types'

// ============================================================================
// Types
// ============================================================================

export interface GitHubClientConfig {
  /** GitHub personal access token or OAuth token */
  accessToken: string
}

export interface CreateRepoOptions {
  /** Repository name */
  name: string
  /** Repository description */
  description?: string
  /** Whether the repo should be private */
  isPrivate?: boolean
  /** Auto-initialize with README */
  autoInit?: boolean
  /** Enable GitHub Pages */
  enablePages?: boolean
}

export interface CommitOptions {
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Branch to commit to */
  branch: string
  /** Commit message */
  message: string
  /** Files to commit */
  files: Array<{
    path: string
    content: string | Buffer
  }>
}

export interface GitHubUser {
  login: string
  id: number
  avatarUrl: string
  name: string | null
  email: string | null
}

interface GitHubAPIError {
  message: string
  documentation_url?: string
  errors?: Array<{
    resource: string
    code: string
    field: string
    message?: string
  }>
}

// ============================================================================
// GitHub Client Class
// ============================================================================

export class GitHubClient {
  private accessToken: string
  private baseUrl = 'https://api.github.com'

  constructor(config: GitHubClientConfig) {
    this.accessToken = config.accessToken
  }

  /**
   * Make an authenticated request to the GitHub API
   */
  private async request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }

    if (body) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorData: GitHubAPIError = await response.json().catch(() => ({
        message: `GitHub API error: ${response.status} ${response.statusText}`,
      }))

      throw new GitHubAPIException(errorData.message, response.status, errorData.errors)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  /**
   * Get the authenticated user
   */
  async getAuthenticatedUser(): Promise<GitHubUser> {
    interface GitHubUserResponse {
      login: string
      id: number
      avatar_url: string
      name: string | null
      email: string | null
    }

    const data = await this.request<GitHubUserResponse>('GET', '/user')
    return {
      login: data.login,
      id: data.id,
      avatarUrl: data.avatar_url,
      name: data.name,
      email: data.email,
    }
  }

  // ============================================================================
  // Repository Operations
  // ============================================================================

  /**
   * Check if a repository exists
   */
  async repoExists(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request('GET', `/repos/${owner}/${repo}`)
      return true
    } catch (error) {
      if (error instanceof GitHubAPIException && error.statusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Get repository information
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepoInfo> {
    interface GitHubRepoResponse {
      owner: { login: string }
      name: string
      full_name: string
      html_url: string
      default_branch: string
      private: boolean
      has_pages: boolean
      homepage?: string
    }

    const data = await this.request<GitHubRepoResponse>('GET', `/repos/${owner}/${repo}`)

    return {
      owner: data.owner.login,
      repo: data.name,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      hasPages: data.has_pages,
      pagesUrl: data.homepage || undefined,
    }
  }

  /**
   * Create a new repository
   */
  async createRepo(options: CreateRepoOptions): Promise<GitHubRepoInfo> {
    interface CreateRepoResponse {
      owner: { login: string }
      name: string
      full_name: string
      html_url: string
      default_branch: string
      private: boolean
      has_pages: boolean
    }

    const data = await this.request<CreateRepoResponse>('POST', '/user/repos', {
      name: options.name,
      description: options.description || 'Portfolio generated by Portfolio Forge',
      private: options.isPrivate ?? false,
      auto_init: options.autoInit ?? true,
      has_pages: options.enablePages ?? true,
    })

    return {
      owner: data.owner.login,
      repo: data.name,
      fullName: data.full_name,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
      isPrivate: data.private,
      hasPages: data.has_pages,
    }
  }

  /**
   * Delete a repository (use with caution!)
   */
  async deleteRepo(owner: string, repo: string): Promise<void> {
    await this.request('DELETE', `/repos/${owner}/${repo}`)
  }

  // ============================================================================
  // Content Operations
  // ============================================================================

  /**
   * Get the SHA of a branch
   */
  async getBranchSha(owner: string, repo: string, branch: string): Promise<string> {
    interface BranchResponse {
      commit: { sha: string }
    }

    const data = await this.request<BranchResponse>(
      'GET',
      `/repos/${owner}/${repo}/branches/${branch}`
    )
    return data.commit.sha
  }

  /**
   * Create a blob (file content)
   */
  private async createBlob(owner: string, repo: string, content: string | Buffer): Promise<string> {
    interface BlobResponse {
      sha: string
    }

    const isBuffer = Buffer.isBuffer(content)
    const data = await this.request<BlobResponse>('POST', `/repos/${owner}/${repo}/git/blobs`, {
      content: isBuffer ? content.toString('base64') : content,
      encoding: isBuffer ? 'base64' : 'utf-8',
    })
    return data.sha
  }

  /**
   * Create a tree with multiple files
   */
  private async createTree(
    owner: string,
    repo: string,
    baseTreeSha: string,
    files: Array<{ path: string; sha: string }>
  ): Promise<string> {
    interface TreeResponse {
      sha: string
    }

    const data = await this.request<TreeResponse>('POST', `/repos/${owner}/${repo}/git/trees`, {
      base_tree: baseTreeSha,
      tree: files.map((file) => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: file.sha,
      })),
    })
    return data.sha
  }

  /**
   * Create a commit
   */
  private async createCommit(
    owner: string,
    repo: string,
    message: string,
    treeSha: string,
    parentSha: string
  ): Promise<string> {
    interface CommitResponse {
      sha: string
    }

    const data = await this.request<CommitResponse>('POST', `/repos/${owner}/${repo}/git/commits`, {
      message,
      tree: treeSha,
      parents: [parentSha],
    })
    return data.sha
  }

  /**
   * Update a branch reference
   */
  private async updateRef(owner: string, repo: string, branch: string, sha: string): Promise<void> {
    await this.request('PATCH', `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      sha,
      force: true,
    })
  }

  /**
   * Commit multiple files to a repository
   */
  async commitFiles(options: CommitOptions): Promise<string> {
    const { owner, repo, branch, message, files } = options

    // Get the current branch SHA
    const branchSha = await this.getBranchSha(owner, repo, branch)

    // Create blobs for each file
    const blobPromises = files.map(async (file) => ({
      path: file.path,
      sha: await this.createBlob(owner, repo, file.content),
    }))
    const blobs = await Promise.all(blobPromises)

    // Create tree with all files
    const treeSha = await this.createTree(owner, repo, branchSha, blobs)

    // Create commit
    const commitSha = await this.createCommit(owner, repo, message, treeSha, branchSha)

    // Update branch reference
    await this.updateRef(owner, repo, branch, commitSha)

    return commitSha
  }

  // ============================================================================
  // GitHub Pages Operations
  // ============================================================================

  /**
   * Enable GitHub Pages for a repository
   */
  async enablePages(
    owner: string,
    repo: string,
    options: { branch?: string; path?: '/' | '/docs' } = {}
  ): Promise<{ url: string }> {
    interface PagesResponse {
      html_url: string
    }

    const data = await this.request<PagesResponse>('POST', `/repos/${owner}/${repo}/pages`, {
      source: {
        branch: options.branch || 'main',
        path: options.path || '/',
      },
    })

    return { url: data.html_url }
  }

  /**
   * Get GitHub Pages status
   */
  async getPagesStatus(
    owner: string,
    repo: string
  ): Promise<{
    status: 'built' | 'building' | 'errored' | null
    url: string | null
  }> {
    interface PagesStatusResponse {
      status: 'built' | 'building' | 'errored' | null
      html_url: string | null
    }

    try {
      const data = await this.request<PagesStatusResponse>('GET', `/repos/${owner}/${repo}/pages`)
      return {
        status: data.status,
        url: data.html_url,
      }
    } catch (error) {
      if (error instanceof GitHubAPIException && error.statusCode === 404) {
        return { status: null, url: null }
      }
      throw error
    }
  }
}

// ============================================================================
// Exceptions
// ============================================================================

export class GitHubAPIException extends Error {
  statusCode: number
  errors?: Array<{
    resource: string
    code: string
    field: string
    message?: string
  }>

  constructor(
    message: string,
    statusCode: number,
    errors?: Array<{
      resource: string
      code: string
      field: string
      message?: string
    }>
  ) {
    super(message)
    this.name = 'GitHubAPIException'
    this.statusCode = statusCode
    this.errors = errors
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Deploy an export bundle to GitHub Pages
 */
export async function deployToGitHubPages(
  client: GitHubClient,
  bundle: ExportBundle,
  options: {
    owner: string
    repo: string
    branch?: string
    message?: string
  }
): Promise<{ commitSha: string; pagesUrl: string }> {
  const { owner, repo, branch = 'main', message = 'Deploy portfolio' } = options

  // Convert bundle files to commit format
  const files = bundle.files.map((file) => ({
    path: file.path,
    content: file.content,
  }))

  // Commit all files
  const commitSha = await client.commitFiles({
    owner,
    repo,
    branch,
    message,
    files,
  })

  // Get or enable Pages
  let pagesStatus = await client.getPagesStatus(owner, repo)

  if (pagesStatus.status === null) {
    // Pages not enabled, enable it
    const pages = await client.enablePages(owner, repo, { branch })
    pagesStatus = { status: 'building', url: pages.url }
  }

  // Construct pages URL
  const pagesUrl = pagesStatus.url || `https://${owner}.github.io/${repo}`

  return { commitSha, pagesUrl }
}

/**
 * Create or get a portfolio repository
 */
export async function ensurePortfolioRepo(
  client: GitHubClient,
  options: {
    repoName: string
    description?: string
    isPrivate?: boolean
  }
): Promise<GitHubRepoInfo> {
  const user = await client.getAuthenticatedUser()
  const { repoName, description, isPrivate } = options

  // Check if repo exists
  const exists = await client.repoExists(user.login, repoName)

  if (exists) {
    return client.getRepo(user.login, repoName)
  }

  // Create new repo
  return client.createRepo({
    name: repoName,
    description,
    isPrivate,
    autoInit: true,
    enablePages: true,
  })
}
