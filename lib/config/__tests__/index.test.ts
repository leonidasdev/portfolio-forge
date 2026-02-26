/**
 * Configuration Module Tests
 *
 * Tests for centralized application configuration.
 */

describe('Configuration Module', () => {
  // Store original env
  const originalEnv = process.env

  beforeEach(() => {
    // Reset modules to re-import config with new env values
    jest.resetModules()
    // Create a clean copy of env
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original env
    process.env = originalEnv
  })

  describe('Default Values', () => {
    it('should have default rate limit settings', async () => {
      const { config } = await import('../index')

      expect(config.rateLimit.enabled).toBe(true)
      expect(config.rateLimit.api.maxRequests).toBe(100)
      expect(config.rateLimit.api.windowSeconds).toBe(60)
      expect(config.rateLimit.api.perUser).toBe(true)
    })

    it('should have default auth rate limit settings', async () => {
      const { config } = await import('../index')

      expect(config.rateLimit.auth.maxRequests).toBe(10)
      expect(config.rateLimit.auth.windowSeconds).toBe(60)
      expect(config.rateLimit.auth.perUser).toBe(false)
    })

    it('should have default AI rate limit settings', async () => {
      const { config } = await import('../index')

      expect(config.rateLimit.ai.maxRequests).toBe(20)
      expect(config.rateLimit.ai.windowSeconds).toBe(60)
      expect(config.rateLimit.ai.perUser).toBe(true)
    })

    it('should have default API config', async () => {
      const { config } = await import('../index')

      expect(config.api.baseUrl).toBe('/api/v1')
      expect(config.api.version).toBe('v1')
      expect(config.api.timeoutMs).toBe(30000)
      expect(config.api.maxBodySize).toBe(10 * 1024 * 1024)
    })

    it('should have default security config', async () => {
      const { config } = await import('../index')

      expect(config.security.corsEnabled).toBe(true)
      expect(config.security.sessionExpirySeconds).toBe(3600)
      expect(config.security.apiKeyHeader).toBe('x-api-key')
    })

    it('should have default logging config', async () => {
      const { config } = await import('../index')

      expect(config.logging.level).toBe('info')
      expect(config.logging.timestamps).toBe(true)
      expect(config.logging.logBodies).toBe(false)
    })

    it('should have default feature flags', async () => {
      const { config } = await import('../index')

      expect(config.features.aiEnabled).toBe(true)
      expect(config.features.publicPortfoliosEnabled).toBe(true)
      expect(config.features.fileUploadsEnabled).toBe(true)
      expect(config.features.rateLimitEnabled).toBe(true)
    })
  })

  describe('Environment Variables Override', () => {
    it('should override rate limit enabled from env', async () => {
      process.env.RATE_LIMIT_ENABLED = 'false'
      const { config } = await import('../index')

      expect(config.rateLimit.enabled).toBe(false)
    })

    it('should override API rate limit from env', async () => {
      process.env.RATE_LIMIT_API_MAX = '200'
      process.env.RATE_LIMIT_API_WINDOW = '120'
      const { config } = await import('../index')

      expect(config.rateLimit.api.maxRequests).toBe(200)
      expect(config.rateLimit.api.windowSeconds).toBe(120)
    })

    it('should override AI rate limit from env', async () => {
      process.env.RATE_LIMIT_AI_MAX = '50'
      const { config } = await import('../index')

      expect(config.rateLimit.ai.maxRequests).toBe(50)
    })

    it('should override API timeout from env', async () => {
      process.env.API_TIMEOUT_MS = '60000'
      const { config } = await import('../index')

      expect(config.api.timeoutMs).toBe(60000)
    })

    it('should override log level from env', async () => {
      process.env.LOG_LEVEL = 'debug'
      const { config } = await import('../index')

      expect(config.logging.level).toBe('debug')
    })

    it('should parse allowed origins from env', async () => {
      process.env.ALLOWED_ORIGINS = 'https://example.com, https://app.example.com'
      const { config } = await import('../index')

      expect(config.security.allowedOrigins).toEqual([
        'https://example.com',
        'https://app.example.com',
      ])
    })

    it('should handle Groq config from env', async () => {
      process.env.GROQ_API_KEY = 'gsk_test_key'
      process.env.GROQ_MODEL = 'llama-3-8b'
      const { config } = await import('../index')

      expect(config.services.groq.apiKey).toBe('gsk_test_key')
      expect(config.services.groq.model).toBe('llama-3-8b')
    })

    it('should handle feature flags from env', async () => {
      process.env.FEATURE_AI_ENABLED = 'false'
      process.env.FEATURE_FILE_UPLOADS = 'false'
      const { config } = await import('../index')

      expect(config.features.aiEnabled).toBe(false)
      expect(config.features.fileUploadsEnabled).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should use default for invalid number', async () => {
      process.env.RATE_LIMIT_API_MAX = 'not-a-number'
      const { config } = await import('../index')

      expect(config.rateLimit.api.maxRequests).toBe(100)
    })

    it('should handle empty string for boolean', async () => {
      process.env.RATE_LIMIT_ENABLED = ''
      const { config } = await import('../index')

      // Empty string should use default
      expect(config.rateLimit.enabled).toBe(true)
    })

    it('should handle case-insensitive boolean parsing', async () => {
      process.env.CORS_ENABLED = 'TRUE'
      const { config } = await import('../index')

      expect(config.security.corsEnabled).toBe(true)
    })

    it('should handle FALSE boolean value', async () => {
      process.env.LOG_BODIES = 'false'
      const { config } = await import('../index')

      expect(config.logging.logBodies).toBe(false)
    })
  })

  describe('Environment Mode', () => {
    it('should detect test environment', async () => {
      ;(process.env as any).NODE_ENV = 'test'
      const { config } = await import('../index')

      expect(config.env).toBe('test')
      expect(config.isDev).toBe(false)
      expect(config.isProd).toBe(false)
    })

    it('should detect development environment', async () => {
      ;(process.env as any).NODE_ENV = 'development'
      const { config } = await import('../index')

      expect(config.env).toBe('development')
      expect(config.isDev).toBe(true)
      expect(config.isProd).toBe(false)
    })

    it('should detect production environment', async () => {
      ;(process.env as any).NODE_ENV = 'production'
      const { config } = await import('../index')

      expect(config.env).toBe('production')
      expect(config.isDev).toBe(false)
      expect(config.isProd).toBe(true)
    })
  })

  describe('Immutability', () => {
    it('should not allow modifying config object', async () => {
      const { config } = await import('../index')

      // Object.freeze prevents modifications
      expect(Object.isFrozen(config)).toBe(true)
      expect(Object.isFrozen(config.rateLimit)).toBe(true)
      expect(Object.isFrozen(config.api)).toBe(true)
      expect(Object.isFrozen(config.security)).toBe(true)
    })
  })
})
