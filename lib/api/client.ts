/**
 * API Client Service
 * 
 * Centralized HTTP client for making API requests.
 * Provides consistent error handling, request/response interceptors,
 * and type-safe request methods.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl
  }

  /**
   * Make a generic HTTP request
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || errorData.message || 'Request failed',
          response.status,
          errorData
        )
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T
      }

      return response.json()
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError('Network error. Please check your connection.', 0)
      }

      // Handle other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      )
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Specific AI endpoint methods
export const aiApi = {
  improveText: (data: { text: string; tone: string }) =>
    apiClient.post('/ai/improve-text', data),

  generateSummary: (data: {
    certificationsText?: string
    experienceText?: string
    skillsText?: string
    maxWords?: number
  }) => apiClient.post('/ai/generate-summary', data),

  suggestTags: (data: { text: string; maxTags?: number }) =>
    apiClient.post('/ai/suggest-tags', data),

  analyzePortfolio: () => apiClient.post('/ai/analyze-portfolio'),

  recommendTemplateTheme: () =>
    apiClient.post('/ai/recommend-template-theme'),

  rewritePortfolio: (data: { tone: string }) =>
    apiClient.post('/ai/rewrite-portfolio', data),

  optimizeForJob: (data: { jobDescription: string }) =>
    apiClient.post('/ai/optimize-portfolio-for-job', data),

  generateFromResume: (data: { resumeText: string }) =>
    apiClient.post('/ai/generate-portfolio-from-resume', data),
}
