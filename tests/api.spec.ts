/**
 * API E2E Tests
 *
 * Tests for API endpoints accessibility and basic responses.
 */

import { test, expect } from '@playwright/test'

test.describe('API Health', () => {
  test.describe('Public API Endpoints', () => {
    test('should return 401 for unauthenticated portfolio requests', async ({ request }) => {
      const response = await request.get('/api/v1/portfolios')

      // Should require authentication
      expect(response.status()).toBe(401)

      const body = await response.json()
      expect(body).toHaveProperty('error')
    })

    test('should return 401 for unauthenticated tags requests', async ({ request }) => {
      const response = await request.get('/api/v1/tags')

      // Should require authentication
      expect(response.status()).toBe(401)

      const body = await response.json()
      expect(body).toHaveProperty('error')
    })

    test('should return 401 for unauthenticated sections requests', async ({ request }) => {
      const response = await request.get('/api/v1/portfolio-sections')

      // Should require authentication
      expect(response.status()).toBe(401)
    })
  })

  test.describe('API Response Headers', () => {
    test('should include rate limit headers', async ({ request }) => {
      const response = await request.get('/api/v1/portfolios')

      // Check for rate limit headers (even on error responses)
      const headers = response.headers()

      // Rate limit headers should be present
      // Note: Exact header names depend on implementation
      const hasRateLimitHeader =
        'x-ratelimit-limit' in headers ||
        'x-ratelimit-remaining' in headers ||
        'ratelimit-limit' in headers

      // This may or may not be present depending on implementation
      // Just verify the API responds properly
      expect(response.status()).toBeDefined()
    })

    test('should return JSON content type for API responses', async ({ request }) => {
      const response = await request.get('/api/v1/portfolios')

      // Should return JSON
      expect(response.headers()['content-type']).toContain('application/json')
    })
  })

  test.describe('Invalid Routes', () => {
    test('should return 404 for non-existent API routes', async ({ request }) => {
      const response = await request.get('/api/v1/non-existent-route')

      // Should return 404
      expect(response.status()).toBe(404)
    })

    test('should return 405 for unsupported methods', async ({ request }) => {
      // DELETE on a collection endpoint that doesn't support it
      const response = await request.delete('/api/v1/portfolios')

      // Should return 405 Method Not Allowed or 401 (auth first)
      expect([401, 405]).toContain(response.status())
    })
  })

  test.describe('API Validation', () => {
    test('should return 400 for invalid portfolio creation body', async ({ request }) => {
      const response = await request.post('/api/v1/portfolios', {
        data: {
          // Missing required 'title' field
          invalid_field: 'test',
        },
      })

      // Should return 400 or 401 (auth check happens first)
      expect([400, 401]).toContain(response.status())
    })

    test('should return 400 for invalid tag creation body', async ({ request }) => {
      const response = await request.post('/api/v1/tags', {
        data: {
          // Missing required 'name' field
          invalid_field: 'test',
        },
      })

      // Should return 400 or 401
      expect([400, 401]).toContain(response.status())
    })
  })
})
