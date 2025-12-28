/**
 * Validation Helpers Tests
 * 
 * Tests for the Zod validation helper functions.
 */

import { z } from 'zod'
import { validateBody, validateQuery, validateParams } from '../helpers'
import { ApiError } from '@/lib/api/route-handler'

// Mock NextRequest
class MockNextRequest {
  url: string
  private body: any
  
  constructor(url: string, body?: any) {
    this.url = url
    this.body = body
  }
  
  json() {
    if (this.body === undefined) {
      return Promise.reject(new Error('No body'))
    }
    return Promise.resolve(this.body)
  }
}

describe('validateBody', () => {
  const testSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    isPublished: z.boolean().default(false),
  })
  
  it('should validate and return valid body data', async () => {
    const body = { title: 'Test Portfolio', description: 'A description' }
    const request = new MockNextRequest('http://localhost/api/test', body)
    
    const result = await validateBody(request as any, testSchema)
    
    expect(result.title).toBe('Test Portfolio')
    expect(result.description).toBe('A description')
    expect(result.isPublished).toBe(false) // default value
  })
  
  it('should throw ApiError for missing required field', async () => {
    const body = { description: 'Missing title' }
    const request = new MockNextRequest('http://localhost/api/test', body)
    
    await expect(
      validateBody(request as any, testSchema)
    ).rejects.toThrow(ApiError)
    
    try {
      await validateBody(request as any, testSchema)
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as any).status).toBe(400)
      expect((error as any).message).toContain('title')
    }
  })
  
  it('should throw ApiError for invalid field type', async () => {
    const body = { title: 123 } // should be string
    const request = new MockNextRequest('http://localhost/api/test', body)
    
    await expect(
      validateBody(request as any, testSchema)
    ).rejects.toThrow(ApiError)
  })
  
  it('should throw ApiError for invalid JSON body', async () => {
    const request = new MockNextRequest('http://localhost/api/test')
    
    await expect(
      validateBody(request as any, testSchema)
    ).rejects.toThrow(ApiError)
  })
  
  it('should apply transformations', async () => {
    const schemaWithTransform = z.object({
      email: z.string().email().toLowerCase(),
    })
    const body = { email: 'TEST@EXAMPLE.COM' }
    const request = new MockNextRequest('http://localhost/api/test', body)
    
    const result = await validateBody(
      request as any,
      schemaWithTransform
    )
    
    expect(result.email).toBe('test@example.com')
  })
})

describe('validateQuery', () => {
  const paginationSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    includeArchived: z.boolean().default(false),
  })
  
  it('should validate and return valid query params', () => {
    const request = new MockNextRequest(
      'http://localhost/api/test?page=2&limit=20&sortBy=title'
    )
    
    const result = validateQuery(
      request as any,
      paginationSchema
    )
    
    expect(result.page).toBe(2)
    expect(result.limit).toBe(20)
    expect(result.sortBy).toBe('title')
  })
  
  it('should apply default values for missing params', () => {
    const request = new MockNextRequest('http://localhost/api/test')
    
    const result = validateQuery(
      request as any,
      paginationSchema
    )
    
    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
    expect(result.includeArchived).toBe(false)
  })
  
  it('should parse boolean values correctly', () => {
    const request = new MockNextRequest(
      'http://localhost/api/test?includeArchived=true'
    )
    
    const result = validateQuery(
      request as any,
      paginationSchema
    )
    
    expect(result.includeArchived).toBe(true)
  })
  
  it('should throw ApiError for invalid query params', () => {
    const request = new MockNextRequest(
      'http://localhost/api/test?page=-1' // min is 1
    )
    
    expect(() =>
      validateQuery(request as any, paginationSchema)
    ).toThrow(ApiError)
  })
  
  it('should throw ApiError for value exceeding max', () => {
    const request = new MockNextRequest(
      'http://localhost/api/test?limit=500' // max is 100
    )
    
    expect(() =>
      validateQuery(request as any, paginationSchema)
    ).toThrow(ApiError)
  })
})

describe('validateParams', () => {
  const idSchema = z.object({
    id: z.string().uuid(),
  })
  
  const slugSchema = z.object({
    slug: z.string().min(1).max(100),
    version: z.string().optional(),
  })
  
  it('should validate and return valid path params', () => {
    const params = { id: '550e8400-e29b-41d4-a716-446655440000' }
    
    const result = validateParams(params, idSchema)
    
    expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })
  
  it('should validate slug params', () => {
    const params = { slug: 'my-portfolio', version: 'v2' }
    
    const result = validateParams(params, slugSchema)
    
    expect(result.slug).toBe('my-portfolio')
    expect(result.version).toBe('v2')
  })
  
  it('should throw ApiError for invalid UUID', () => {
    const params = { id: 'not-a-valid-uuid' }
    
    expect(() => validateParams(params, idSchema)).toThrow(ApiError)
  })
  
  it('should throw ApiError for missing required param', () => {
    const params = { version: 'v1' } // missing slug
    
    expect(() => validateParams(params, slugSchema)).toThrow(ApiError)
  })
  
  it('should include error details in ApiError', () => {
    const params = { id: 'invalid' }
    
    try {
      validateParams(params, idSchema)
      fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as any).status).toBe(400)
      expect((error as any).message).toContain('Validation failed')
    }
  })
})
