/**
 * Validation Helpers
 * 
 * Helper functions for validating request data with Zod schemas.
 * Integrates with the API route handler for consistent error handling.
 */

import { NextRequest } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { ApiError } from '@/lib/api/route-handler'

/**
 * Validates request body against a Zod schema
 * 
 * @param request - The Next.js request object
 * @param schema - The Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ApiError with 400 status if validation fails
 * 
 * @example
 * const data = await validateBody(request, createPortfolioSchema)
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod v4 uses .issues instead of .errors
      const issues = (error as any).issues || (error as any).errors || []
      const errorMessages = issues.map((err: any) => {
        const path = err.path?.join('.') || ''
        return path ? `${path}: ${err.message}` : err.message
      })
      throw new ApiError(
        `Validation failed: ${errorMessages.join(', ')}`,
        400,
        { errors: issues }
      )
    }
    throw new ApiError('Invalid request body', 400)
  }
}

/**
 * Validates query parameters against a Zod schema
 * 
 * @param request - The Next.js request object
 * @param schema - The Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ApiError with 400 status if validation fails
 * 
 * @example
 * const params = validateQuery(request, paginationSchema)
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, any> = {}
    
    // Convert search params to object
    searchParams.forEach((value, key) => {
      // Try to parse numbers
      if (!isNaN(Number(value))) {
        params[key] = Number(value)
      } else if (value === 'true') {
        params[key] = true
      } else if (value === 'false') {
        params[key] = false
      } else {
        params[key] = value
      }
    })
    
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod v4 uses .issues instead of .errors
      const issues = (error as any).issues || (error as any).errors || []
      const errorMessages = issues.map((err: any) => {
        const path = err.path?.join('.') || ''
        return path ? `${path}: ${err.message}` : err.message
      })
      throw new ApiError(
        `Validation failed: ${errorMessages.join(', ')}`,
        400,
        { errors: issues }
      )
    }
    throw new ApiError('Invalid query parameters', 400)
  }
}

/**
 * Validates path parameters against a Zod schema
 * 
 * @param params - The path parameters object
 * @param schema - The Zod schema to validate against
 * @returns Parsed and validated data
 * @throws ApiError with 400 status if validation fails
 * 
 * @example
 * const { id } = validateParams(params, z.object({ id: idSchema }))
 */
export function validateParams<T>(
  params: Record<string, string | string[]>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod v4 uses .issues instead of .errors
      const issues = (error as any).issues || (error as any).errors || []
      const errorMessages = issues.map((err: any) => {
        const path = err.path?.join('.') || ''
        return path ? `${path}: ${err.message}` : err.message
      })
      throw new ApiError(
        `Validation failed: ${errorMessages.join(', ')}`,
        400,
        { errors: issues }
      )
    }
    throw new ApiError('Invalid path parameters', 400)
  }
}
