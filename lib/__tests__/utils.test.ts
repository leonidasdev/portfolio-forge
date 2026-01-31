/**
 * Utils Tests
 *
 * Tests for utility functions.
 */

import {
  cn,
  formatRelativeTime,
  truncate,
  capitalize,
  generateId,
  deepClone,
  debounce,
  isBrowser,
  sleep,
} from '../utils'

describe('cn (class name merge)', () => {
  it('should merge class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should resolve Tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end')
  })
})

describe('formatRelativeTime', () => {
  it('should return "just now" for recent times', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('should format minutes correctly', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
  })

  it('should format single minute correctly', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
  })

  it('should format hours correctly', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('should format days correctly', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('should format months correctly', () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoMonthsAgo)).toBe('2 months ago')
  })

  it('should format years correctly', () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoYearsAgo)).toBe('2 years ago')
  })

  it('should accept string dates', () => {
    const dateString = new Date(Date.now() - 60 * 1000).toISOString()
    expect(formatRelativeTime(dateString)).toBe('1 minute ago')
  })
})

describe('truncate', () => {
  it('should not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('should truncate long strings with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
  })

  it('should handle exact length strings', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle already capitalized string', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should only capitalize first letter', () => {
    expect(capitalize('hELLO')).toBe('HELLO')
  })
})

describe('generateId', () => {
  it('should generate a string', () => {
    expect(typeof generateId()).toBe('string')
  })

  it('should generate unique IDs', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })

  it('should generate IDs of consistent length', () => {
    const id = generateId()
    expect(id.length).toBe(7)
  })
})

describe('deepClone', () => {
  it('should clone simple objects', () => {
    const obj = { a: 1, b: 2 }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned).not.toBe(obj)
  })

  it('should clone nested objects', () => {
    const obj = { a: { b: { c: 1 } } }
    const cloned = deepClone(obj)
    expect(cloned).toEqual(obj)
    expect(cloned.a).not.toBe(obj.a)
    expect(cloned.a.b).not.toBe(obj.a.b)
  })

  it('should clone arrays', () => {
    const arr = [1, 2, { a: 3 }]
    const cloned = deepClone(arr)
    expect(cloned).toEqual(arr)
    expect(cloned).not.toBe(arr)
    expect(cloned[2]).not.toBe(arr[2])
  })
})

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should pass arguments to debounced function', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn('arg1', 'arg2')

    jest.advanceTimersByTime(100)

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should reset timer on subsequent calls', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 100)

    debouncedFn()
    jest.advanceTimersByTime(50)
    debouncedFn()
    jest.advanceTimersByTime(50)

    expect(mockFn).not.toHaveBeenCalled()

    jest.advanceTimersByTime(50)

    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})

describe('isBrowser', () => {
  it('should detect browser environment correctly', () => {
    // In Jest with jsdom, window is defined, so isBrowser returns true
    // This test verifies the function returns a boolean based on window availability
    const result = isBrowser()
    expect(typeof result).toBe('boolean')
    // In jsdom environment, window exists so it should be true
    expect(result).toBe(true)
  })
})

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return a promise', () => {
    const result = sleep(100)
    expect(result).toBeInstanceOf(Promise)
  })

  it('should resolve after specified time', async () => {
    const promise = sleep(100)
    jest.advanceTimersByTime(100)
    await expect(promise).resolves.toBeUndefined()
  })
})
