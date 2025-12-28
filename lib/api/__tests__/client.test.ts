/**
 * API Client Tests
 * 
 * Tests for the centralized API client functionality.
 */

import { ApiClient, ApiError } from '../client'

describe('ApiClient', () => {
  let apiClient: ApiClient
  
  beforeEach(() => {
    apiClient = new ApiClient('/api/v1')
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockReset()
  })
  
  describe('constructor', () => {
    it('should use default base URL when not provided', () => {
      const client = new ApiClient()
      expect(client).toBeDefined()
    })
    
    it('should accept custom base URL', () => {
      const client = new ApiClient('/api/v2')
      expect(client).toBeDefined()
    })
  })
  
  describe('GET requests', () => {
    it('should make GET request and return data', async () => {
      const mockData = { portfolios: [{ id: '1', title: 'Test' }] }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      })
      
      const result = await apiClient.get('/portfolios')
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockData)
    })
    
    it('should throw ApiError on non-OK response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      })
      
      await expect(apiClient.get('/portfolios/invalid')).rejects.toThrow(ApiError)
    })
    
    it('should include error data in ApiError', async () => {
      const errorData = { error: 'Portfolio not found', code: 'NOT_FOUND' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorData),
      })
      
      try {
        await apiClient.get('/portfolios/invalid')
        fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).statusCode).toBe(404)
        expect((error as ApiError).message).toBe('Portfolio not found')
      }
    })
  })
  
  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      const requestBody = { title: 'New Portfolio' }
      const mockResponse = { portfolio: { id: '1', title: 'New Portfolio' } }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      })
      
      const result = await apiClient.post('/portfolios', requestBody)
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
    
    it('should throw ApiError on validation error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Title is required' }),
      })
      
      await expect(
        apiClient.post('/portfolios', { title: '' })
      ).rejects.toThrow('Title is required')
    })
  })
  
  describe('PATCH requests', () => {
    it('should make PATCH request with partial body', async () => {
      const requestBody = { title: 'Updated Title' }
      const mockResponse = { portfolio: { id: '1', title: 'Updated Title' } }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })
      
      const result = await apiClient.patch('/portfolios/1', requestBody)
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })
  
  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      })
      
      const result = await apiClient.delete('/portfolios/1')
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toBeUndefined()
    })
    
    it('should throw on unauthorized delete', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      })
      
      await expect(apiClient.delete('/portfolios/1')).rejects.toThrow('Unauthorized')
    })
  })
  
  describe('error handling', () => {
    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      
      await expect(apiClient.get('/portfolios')).rejects.toThrow('Network error')
    })
    
    it('should handle JSON parse errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
      
      await expect(apiClient.get('/portfolios')).rejects.toThrow()
    })
  })
})

describe('ApiError', () => {
  it('should create error with message and status code', () => {
    const error = new ApiError('Not found', 404)
    
    expect(error.message).toBe('Not found')
    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('ApiError')
  })
  
  it('should include additional data', () => {
    const data = { field: 'title', code: 'REQUIRED' }
    const error = new ApiError('Validation failed', 400, data)
    
    expect(error.data).toEqual(data)
  })
  
  it('should be instanceof Error', () => {
    const error = new ApiError('Test', 500)
    
    expect(error instanceof Error).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})
