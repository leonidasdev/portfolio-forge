/**
 * Structured Logger
 *
 * Centralized logging utility with support for:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output for production
 * - Pretty printing for development
 * - Context/metadata support
 * - Environment-aware log filtering
 *
 * @example
 * import { logger } from '@/lib/logger'
 *
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Failed to save', { error: err, portfolioId: '456' })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * Log level priority (higher = more severe)
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Get the minimum log level from environment
 * Default: 'debug' in development, 'info' in production
 */
function getMinLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

/**
 * Check if logging is enabled for a given level
 */
function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
}

/**
 * Format error object for logging
 */
function formatError(error: unknown): LogEntry['error'] | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

/**
 * Create a log entry
 */
function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (context) {
    // Extract error from context if present
    if ('error' in context && context.error) {
      entry.error = formatError(context.error)
      // Remove error from context to avoid duplication
      const { error: _, ...restContext } = context
      if (Object.keys(restContext).length > 0) {
        entry.context = restContext
      }
    } else {
      entry.context = context
    }
  }

  return entry
}

/**
 * Output log entry to console
 */
function outputLog(entry: LogEntry): void {
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    // JSON output for production (easier to parse by log aggregators)
    const output = JSON.stringify(entry)
    switch (entry.level) {
      case 'error':
        console.error(output)
        break
      case 'warn':
        console.warn(output)
        break
      default:
        console.log(output)
    }
  } else {
    // Pretty output for development
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const errorStr = entry.error
      ? `\n  Error: ${entry.error.name}: ${entry.error.message}${entry.error.stack ? `\n${entry.error.stack}` : ''}`
      : ''

    const fullMessage = `${prefix} ${entry.message}${contextStr}${errorStr}`

    switch (entry.level) {
      case 'error':
        console.error(fullMessage)
        break
      case 'warn':
        console.warn(fullMessage)
        break
      case 'debug':
        console.debug(fullMessage)
        break
      default:
        console.log(fullMessage)
    }
  }
}

/**
 * Main logger implementation
 */
class Logger {
  private prefix?: string

  constructor(prefix?: string) {
    this.prefix = prefix
  }

  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): Logger {
    const fullPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix
    return new Logger(fullPrefix)
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!shouldLog(level)) return

    const fullMessage = this.prefix ? `[${this.prefix}] ${message}` : message
    const entry = createLogEntry(level, fullMessage, context)
    outputLog(entry)
  }

  /**
   * Debug level - detailed information for debugging
   * Not shown in production by default
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context)
  }

  /**
   * Info level - general operational information
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context)
  }

  /**
   * Warn level - potentially harmful situations
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context)
  }

  /**
   * Error level - error events that might still allow the app to run
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context)
  }

  /**
   * Log an API request (info level)
   */
  request(method: string, url: string, context?: LogContext): void {
    this.info(`${method} ${url}`, context)
  }

  /**
   * Log an API response (info or error level based on status)
   */
  response(
    method: string,
    url: string,
    status: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = status >= 400 ? 'error' : 'info'
    this.log(level, `${method} ${url} ${status} ${duration}ms`, context)
  }

  /**
   * Log a timed operation
   */
  time<T>(label: string, fn: () => T): T {
    const start = performance.now()
    try {
      const result = fn()
      const duration = Math.round(performance.now() - start)
      this.debug(`${label} completed`, { duration: `${duration}ms` })
      return result
    } catch (error) {
      const duration = Math.round(performance.now() - start)
      this.error(`${label} failed`, { duration: `${duration}ms`, error })
      throw error
    }
  }

  /**
   * Log an async timed operation
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = Math.round(performance.now() - start)
      this.debug(`${label} completed`, { duration: `${duration}ms` })
      return result
    } catch (error) {
      const duration = Math.round(performance.now() - start)
      this.error(`${label} failed`, { duration: `${duration}ms`, error })
      throw error
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger()

/**
 * Create domain-specific loggers
 */
export const apiLogger = logger.child('API')
export const authLogger = logger.child('Auth')
export const aiLogger = logger.child('AI')
export const dbLogger = logger.child('DB')

/**
 * Export Logger class for custom instances
 */
export { Logger }
export type { LogContext, LogEntry, LogLevel }
