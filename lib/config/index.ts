/**
 * Centralized Configuration Module
 * 
 * Provides type-safe configuration for the application.
 * All settings can be overridden via environment variables.
 * 
 * Usage:
 * ```typescript
 * import { config } from '@/lib/config'
 * const limit = config.rateLimit.api.maxRequests
 * ```
 */

// ============================================================================
// Environment Helpers
// ============================================================================

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

// ============================================================================
// Rate Limit Configuration
// ============================================================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
  /** Whether to include user ID in the rate limit key (per-user limiting) */
  perUser: boolean
}

export interface RateLimitSettings {
  /** Enable/disable rate limiting globally */
  enabled: boolean
  /** Default rate limit for general API routes */
  api: RateLimitConfig
  /** Rate limit for authentication routes (stricter) */
  auth: RateLimitConfig
  /** Rate limit for AI/expensive operations (most strict) */
  ai: RateLimitConfig
  /** Rate limit for public routes */
  public: RateLimitConfig
}

const rateLimitConfig: RateLimitSettings = {
  enabled: getEnvBoolean('RATE_LIMIT_ENABLED', true),
  api: {
    maxRequests: getEnvNumber('RATE_LIMIT_API_MAX', 100),
    windowSeconds: getEnvNumber('RATE_LIMIT_API_WINDOW', 60),
    perUser: true,
  },
  auth: {
    maxRequests: getEnvNumber('RATE_LIMIT_AUTH_MAX', 10),
    windowSeconds: getEnvNumber('RATE_LIMIT_AUTH_WINDOW', 60),
    perUser: false, // IP-based for auth
  },
  ai: {
    maxRequests: getEnvNumber('RATE_LIMIT_AI_MAX', 20),
    windowSeconds: getEnvNumber('RATE_LIMIT_AI_WINDOW', 60),
    perUser: true,
  },
  public: {
    maxRequests: getEnvNumber('RATE_LIMIT_PUBLIC_MAX', 30),
    windowSeconds: getEnvNumber('RATE_LIMIT_PUBLIC_WINDOW', 60),
    perUser: false, // IP-based for public
  },
}

// ============================================================================
// API Configuration
// ============================================================================

export interface ApiConfig {
  /** Base URL for API routes */
  baseUrl: string
  /** API version prefix */
  version: string
  /** Request timeout in milliseconds */
  timeoutMs: number
  /** Maximum request body size in bytes */
  maxBodySize: number
}

const apiConfig: ApiConfig = {
  baseUrl: getEnvString('NEXT_PUBLIC_API_URL', '/api/v1'),
  version: 'v1',
  timeoutMs: getEnvNumber('API_TIMEOUT_MS', 30000),
  maxBodySize: getEnvNumber('API_MAX_BODY_SIZE', 10 * 1024 * 1024), // 10MB
}

// ============================================================================
// Security Configuration
// ============================================================================

export interface SecurityConfig {
  /** List of allowed origins for CORS */
  allowedOrigins: string[]
  /** Whether to enable CORS */
  corsEnabled: boolean
  /** Session expiry in seconds */
  sessionExpirySeconds: number
  /** API key header name */
  apiKeyHeader: string
}

const securityConfig: SecurityConfig = {
  allowedOrigins: getEnvString('ALLOWED_ORIGINS', '*').split(',').map(s => s.trim()),
  corsEnabled: getEnvBoolean('CORS_ENABLED', true),
  sessionExpirySeconds: getEnvNumber('SESSION_EXPIRY_SECONDS', 3600),
  apiKeyHeader: 'x-api-key',
}

// ============================================================================
// Logging Configuration
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LoggingConfig {
  /** Current log level */
  level: LogLevel
  /** Whether to include timestamps */
  timestamps: boolean
  /** Whether to log request/response bodies (careful in production) */
  logBodies: boolean
}

const loggingConfig: LoggingConfig = {
  level: getEnvString('LOG_LEVEL', 'info') as LogLevel,
  timestamps: getEnvBoolean('LOG_TIMESTAMPS', true),
  logBodies: getEnvBoolean('LOG_BODIES', false),
}

// ============================================================================
// Feature Flags
// ============================================================================

export interface FeatureFlags {
  /** Enable AI features */
  aiEnabled: boolean
  /** Enable public portfolio sharing */
  publicPortfoliosEnabled: boolean
  /** Enable file uploads */
  fileUploadsEnabled: boolean
  /** Enable rate limiting */
  rateLimitEnabled: boolean
}

const featureFlags: FeatureFlags = {
  aiEnabled: getEnvBoolean('FEATURE_AI_ENABLED', true),
  publicPortfoliosEnabled: getEnvBoolean('FEATURE_PUBLIC_PORTFOLIOS', true),
  fileUploadsEnabled: getEnvBoolean('FEATURE_FILE_UPLOADS', true),
  rateLimitEnabled: getEnvBoolean('RATE_LIMIT_ENABLED', true),
}

// ============================================================================
// External Services Configuration
// ============================================================================

export interface ExternalServicesConfig {
  supabase: {
    url: string
    anonKey: string
  }
  groq: {
    apiKey: string
    model: string
  }
}

const externalServicesConfig: ExternalServicesConfig = {
  supabase: {
    url: getEnvString('NEXT_PUBLIC_SUPABASE_URL', ''),
    anonKey: getEnvString('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
  },
  groq: {
    apiKey: getEnvString('GROQ_API_KEY', ''),
    model: getEnvString('GROQ_MODEL', 'llama-3.3-70b-versatile'),
  },
}

// ============================================================================
// Main Configuration Export
// ============================================================================

export interface AppConfig {
  rateLimit: RateLimitSettings
  api: ApiConfig
  security: SecurityConfig
  logging: LoggingConfig
  features: FeatureFlags
  services: ExternalServicesConfig
  /** Environment mode */
  env: 'development' | 'production' | 'test'
  /** Whether currently in development mode */
  isDev: boolean
  /** Whether currently in production mode */
  isProd: boolean
}

export const config: AppConfig = {
  rateLimit: rateLimitConfig,
  api: apiConfig,
  security: securityConfig,
  logging: loggingConfig,
  features: featureFlags,
  services: externalServicesConfig,
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}

// Freeze config to prevent accidental mutations
Object.freeze(config)
Object.freeze(config.rateLimit)
Object.freeze(config.api)
Object.freeze(config.security)
Object.freeze(config.logging)
Object.freeze(config.features)
Object.freeze(config.services)

export default config
