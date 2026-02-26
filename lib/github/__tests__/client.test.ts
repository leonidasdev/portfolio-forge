/**
 * GitHub Client Tests
 *
 * Tests for GitHub API client.
 * Uses mocked fetch to avoid actual API calls.
 */

import { GitHubClient } from '../client'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('GitHubClient', () => {
  let client: GitHubClient

  beforeEach(() => {
    mockFetch.mockReset()
    client = new GitHubClient({ accessToken: 'test-token' })
  })

  describe('getAuthenticatedUser', () => {
    it('should return user info on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            login: 'testuser',
            id: 12345,
            avatar_url: 'https://avatars.githubusercontent.com/u/12345',
            name: 'Test User',
            email: 'test@example.com',
          }),
      })

      const user = await client.getAuthenticatedUser()

      expect(user.login).toBe('testuser')
      expect(user.id).toBe(12345)
      expect(user.name).toBe('Test User')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should throw error on unauthorized', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Bad credentials' }),
      })

      await expect(client.getAuthenticatedUser()).rejects.toThrow('Bad credentials')
    })
  })

  describe('createRepo', () => {
    it('should create a public repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'my-portfolio',
            full_name: 'testuser/my-portfolio',
            html_url: 'https://github.com/testuser/my-portfolio',
            clone_url: 'https://github.com/testuser/my-portfolio.git',
            default_branch: 'main',
            private: false,
            owner: { login: 'testuser' },
          }),
      })

      const repo = await client.createRepo({
        name: 'my-portfolio',
        description: 'My portfolio site',
        isPrivate: false,
      })

      expect(repo.repo).toBe('my-portfolio')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user/repos',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('my-portfolio'),
        })
      )
    })

    it('should create a private repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'private-portfolio',
            full_name: 'testuser/private-portfolio',
            html_url: 'https://github.com/testuser/private-portfolio',
            clone_url: 'https://github.com/testuser/private-portfolio.git',
            default_branch: 'main',
            private: true,
            owner: { login: 'testuser' },
          }),
      })

      const repo = await client.createRepo({
        name: 'private-portfolio',
        isPrivate: true,
      })

      expect(repo.isPrivate).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"private":true'),
        })
      )
    })

    it('should throw error if repo already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: () =>
          Promise.resolve({
            message: 'Validation Failed',
            errors: [
              {
                resource: 'Repository',
                code: 'custom',
                field: 'name',
                message: 'name already exists',
              },
            ],
          }),
      })

      await expect(client.createRepo({ name: 'existing-repo' })).rejects.toThrow()
    })
  })

  describe('getRepo', () => {
    it('should return repository info', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'my-portfolio',
            full_name: 'testuser/my-portfolio',
            html_url: 'https://github.com/testuser/my-portfolio',
            clone_url: 'https://github.com/testuser/my-portfolio.git',
            default_branch: 'main',
            private: false,
            owner: { login: 'testuser' },
          }),
      })

      const repo = await client.getRepo('testuser', 'my-portfolio')

      expect(repo.repo).toBe('my-portfolio')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/my-portfolio',
        expect.any(Object)
      )
    })
  })

  describe('repoExists', () => {
    it('should return true if repo exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 1,
            name: 'my-portfolio',
          }),
      })

      const exists = await client.repoExists('testuser', 'my-portfolio')

      expect(exists).toBe(true)
    })

    it('should return false if repo does not exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Not Found' }),
      })

      const exists = await client.repoExists('testuser', 'nonexistent')

      expect(exists).toBe(false)
    })
  })

  describe('commitFiles', () => {
    it('should commit files to repository', async () => {
      // Mock getting branch SHA
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            name: 'main',
            commit: { sha: 'abc123' },
          }),
      })

      // Mock creating blobs (for each file)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: 'blob1' }),
      })

      // Mock creating tree
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: 'newtree123' }),
      })

      // Mock creating commit
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: 'newcommit123' }),
      })

      // Mock updating ref
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ref: 'refs/heads/main' }),
      })

      await client.commitFiles({
        owner: 'testuser',
        repo: 'my-portfolio',
        branch: 'main',
        message: 'Deploy portfolio',
        files: [{ path: 'index.html', content: '<html></html>' }],
      })

      // Should have made 5 API calls: getBranchSha, createBlob, createTree, createCommit, updateRef
      expect(mockFetch).toHaveBeenCalledTimes(5)
    })
  })

  describe('enablePages', () => {
    it('should enable GitHub Pages for repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            url: 'https://api.github.com/repos/testuser/my-portfolio/pages',
            html_url: 'https://testuser.github.io/my-portfolio',
            source: { branch: 'main', path: '/' },
          }),
      })

      const pages = await client.enablePages('testuser', 'my-portfolio')

      expect(pages.url).toContain('github.io')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/testuser/my-portfolio/pages',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})
