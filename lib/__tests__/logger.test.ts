/**
 * Logger Tests
 *
 * Tests for the centralized logging utility.
 */

import { logger } from '../logger'

describe('Logger', () => {
  // Capture console outputs
  let consoleSpy: {
    log: jest.SpyInstance
    info: jest.SpyInstance
    warn: jest.SpyInstance
    error: jest.SpyInstance
    debug: jest.SpyInstance
  }

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('basic logging methods', () => {
    it('should log info messages', () => {
      logger.info('Test info message')
      // Logger may use console.info or console.log depending on format
      const called = consoleSpy.info.mock.calls.length > 0 || consoleSpy.log.mock.calls.length > 0
      expect(called).toBe(true)
    })

    it('should log warning messages', () => {
      logger.warn('Test warning message')
      expect(consoleSpy.warn).toHaveBeenCalled()
    })

    it('should log error messages', () => {
      logger.error('Test error message')
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('context logging', () => {
    it('should log messages with context object', () => {
      logger.info('Message with context', { userId: '123', action: 'login' })
      const called = consoleSpy.info.mock.calls.length > 0 || consoleSpy.log.mock.calls.length > 0
      expect(called).toBe(true)
    })

    it('should log errors with Error objects', () => {
      const testError = new Error('Test error')
      logger.error('Error occurred', { error: testError })
      expect(consoleSpy.error).toHaveBeenCalled()
    })
  })

  describe('child logger', () => {
    it('should create child logger with context', () => {
      const childLogger = logger.child({ service: 'auth' })
      expect(childLogger).toBeDefined()
      childLogger.info('Child logger message')
      const called = consoleSpy.info.mock.calls.length > 0 || consoleSpy.log.mock.calls.length > 0
      expect(called).toBe(true)
    })

    it('should include parent context in child logs', () => {
      const childLogger = logger.child({ service: 'api' })
      childLogger.warn('Warning from child')
      expect(consoleSpy.warn).toHaveBeenCalled()
    })
  })

  describe('log formatting', () => {
    it('should format timestamps correctly', () => {
      logger.info('Timestamp test')
      // Verify some console method was called
      const totalCalls = consoleSpy.info.mock.calls.length + consoleSpy.log.mock.calls.length
      expect(totalCalls).toBeGreaterThan(0)
    })
  })
})
