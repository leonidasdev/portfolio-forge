/**
 * Tags API Route Tests
 *
 * Integration tests for the tags API endpoints.
 * Tests authentication, validation, and CRUD operations.
 */

import { NextRequest } from 'next/server'

// Mock the auth middleware
const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockSupabase = {
  from: jest.fn(),
}

jest.mock('@/lib/api/auth-middleware', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    user: mockUser,
    supabase: mockSupabase,
  }),
  AuthError: class AuthError extends Error {
    constructor(
      message: string,
      public status: number = 401
    ) {
      super(message)
      this.name = 'AuthError'
    }
  },
}))

// Import after mocking
import { AuthError, requireAuth } from '@/lib/api/auth-middleware'
import { GET, POST } from '../route'

describe('Tags API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/tags', () => {
    const createRequest = (url = 'http://localhost:3000/api/v1/tags') => {
      return new NextRequest(url)
    }

    it('should return tags for authenticated user', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'JavaScript', user_id: mockUser.id },
        { id: 'tag-2', name: 'React', user_id: mockUser.id },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockTags, error: null }),
          }),
        }),
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tags).toEqual(mockTags)
      expect(mockSupabase.from).toHaveBeenCalledWith('tags')
    })

    it('should return empty array when no tags exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tags).toEqual([])
    })

    it('should return 500 on database error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    it('should return 401 when not authenticated', async () => {
      ;(requireAuth as jest.Mock).mockRejectedValueOnce(new AuthError('Unauthorized'))

      const response = await GET(createRequest())

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/v1/tags', () => {
    const createRequest = (body: Record<string, unknown>) => {
      return new NextRequest('http://localhost:3000/api/v1/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    it('should create a new tag', async () => {
      const newTag = { id: 'tag-new', name: 'TypeScript', user_id: mockUser.id }

      // Mock no existing tag
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })

      // Mock insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: newTag, error: null }),
          }),
        }),
      })

      const response = await POST(createRequest({ name: 'TypeScript' }))
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.tag).toEqual(newTag)
    })

    it('should return 409 when tag name already exists', async () => {
      // Mock existing tag found
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: 'existing-tag' },
                error: null,
              }),
            }),
          }),
        }),
      })

      const response = await POST(createRequest({ name: 'Existing' }))
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    it('should return 400 for invalid body', async () => {
      const response = await POST(createRequest({ name: '' }))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should return 400 when name is missing', async () => {
      const response = await POST(createRequest({}))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should accept optional color field', async () => {
      const newTag = {
        id: 'tag-color',
        name: 'Colored',
        color: '#ff0000',
        user_id: mockUser.id,
      }

      // Mock no existing tag
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })

      // Mock insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: newTag, error: null }),
          }),
        }),
      })

      const response = await POST(createRequest({ name: 'Colored', color: '#ff0000' }))
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.tag.color).toBe('#ff0000')
    })

    it('should return 500 on database insert error', async () => {
      // Mock no existing tag
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      })

      // Mock insert failure
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      })

      const response = await POST(createRequest({ name: 'Failed' }))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})
