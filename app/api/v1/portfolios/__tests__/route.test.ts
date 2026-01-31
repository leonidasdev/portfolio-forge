/**
 * Portfolios API Route Tests
 *
 * Integration tests for the portfolios API endpoints.
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
import { GET, POST } from '../route'
import { requireAuth, AuthError } from '@/lib/api/auth-middleware'

describe('Portfolios API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/v1/portfolios', () => {
    const createRequest = (url = 'http://localhost:3000/api/v1/portfolios') => {
      return new NextRequest(url)
    }

    it('should return portfolios for authenticated user', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          title: 'My Portfolio',
          description: 'A test portfolio',
          is_public: false,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-15T00:00:00Z',
        },
        {
          id: 'portfolio-2',
          title: 'Public Portfolio',
          description: 'A public portfolio',
          is_public: true,
          public_link_token: 'abc123',
          created_at: '2026-01-10T00:00:00Z',
          updated_at: '2026-01-20T00:00:00Z',
        },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockPortfolios, error: null }),
        }),
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.portfolios).toEqual(mockPortfolios)
      expect(data.portfolios).toHaveLength(2)
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios')
    })

    it('should return empty array when no portfolios exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })

      const response = await GET(createRequest())
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.portfolios).toEqual([])
    })

    it('should return 500 on database error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
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

    it('should order portfolios by updated_at descending', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })

      await GET(createRequest())

      const selectMock = mockSupabase.from.mock.results[0].value.select
      const orderMock = selectMock.mock.results[0].value.order

      expect(orderMock).toHaveBeenCalledWith('updated_at', { ascending: false })
    })
  })

  describe('POST /api/v1/portfolios', () => {
    const createRequest = (body: Record<string, unknown>) => {
      return new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    it('should create a new portfolio', async () => {
      const newPortfolio = {
        id: 'portfolio-new',
        title: 'New Portfolio',
        description: 'A new portfolio',
        is_public: false,
        user_id: mockUser.id,
        created_at: '2026-01-31T00:00:00Z',
        updated_at: '2026-01-31T00:00:00Z',
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: newPortfolio, error: null }),
          }),
        }),
      })

      const response = await POST(
        createRequest({
          title: 'New Portfolio',
          description: 'A new portfolio',
        })
      )
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.portfolio).toEqual(newPortfolio)
      expect(data.portfolio.title).toBe('New Portfolio')
    })

    it('should create a public portfolio when is_public is true', async () => {
      const publicPortfolio = {
        id: 'portfolio-public',
        title: 'Public Portfolio',
        description: 'A public portfolio',
        is_public: true,
        user_id: mockUser.id,
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: publicPortfolio, error: null }),
          }),
        }),
      })

      const response = await POST(
        createRequest({
          title: 'Public Portfolio',
          description: 'A public portfolio',
          is_public: true,
        })
      )
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.portfolio.is_public).toBe(true)
    })

    it('should default is_public to false when not provided', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test', is_public: false },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({ insert: insertMock })

      await POST(createRequest({ title: 'Test Portfolio' }))

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_public: false,
        })
      )
    })

    it('should return 400 when title is missing', async () => {
      const response = await POST(createRequest({ description: 'No title' }))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should return 400 when title is empty', async () => {
      const response = await POST(createRequest({ title: '' }))
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should return 500 on database insert error', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          }),
        }),
      })

      const response = await POST(createRequest({ title: 'Failed Portfolio' }))
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })

    it('should return 401 when not authenticated', async () => {
      ;(requireAuth as jest.Mock).mockRejectedValueOnce(new AuthError('Unauthorized'))

      const response = await POST(createRequest({ title: 'Test' }))

      expect(response.status).toBe(401)
    })

    it('should include user_id in the insert', async () => {
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test', user_id: mockUser.id },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockReturnValue({ insert: insertMock })

      await POST(createRequest({ title: 'User Portfolio' }))

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
        })
      )
    })
  })
})
