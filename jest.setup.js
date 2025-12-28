/**
 * Jest Setup File
 * 
 * Configures testing utilities and global mocks.
 */

require('@testing-library/jest-dom')

// Polyfill TextEncoder/TextDecoder if not available
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js navigation (virtual module)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}), { virtual: true })

// Mock Next.js server module (virtual module)
jest.mock('next/server', () => {
  class MockNextResponse {
    constructor(body, init) {
      this._body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || (this.status < 400 ? 'OK' : 'Error')
      this.ok = this.status < 400
      this.headers = new Headers(init?.headers || {})
    }
    
    json() {
      if (this._body) {
        if (typeof this._body === 'string') {
          return Promise.resolve(JSON.parse(this._body))
        }
        if (this._body instanceof ArrayBuffer) {
          const text = new TextDecoder().decode(this._body)
          return Promise.resolve(JSON.parse(text))
        }
      }
      return Promise.resolve(null)
    }
    
    text() {
      if (this._body) {
        if (typeof this._body === 'string') {
          return Promise.resolve(this._body)
        }
        if (this._body instanceof ArrayBuffer) {
          return Promise.resolve(new TextDecoder().decode(this._body))
        }
      }
      return Promise.resolve('')
    }
    
    arrayBuffer() {
      if (this._body) {
        if (this._body instanceof ArrayBuffer) {
          return Promise.resolve(this._body)
        }
        if (typeof this._body === 'string') {
          return Promise.resolve(new TextEncoder().encode(this._body).buffer)
        }
      }
      return Promise.resolve(new ArrayBuffer(0))
    }
  }
  
  // Add static json method
  MockNextResponse.json = (data, init) => {
    const body = JSON.stringify(data)
    return new MockNextResponse(body, init)
  }
  
  return {
    NextRequest: class MockNextRequest {
      constructor(url, init) {
        this.url = url
        this.method = init?.method || 'GET'
        this._body = init?.body
        this.headers = new Headers(init?.headers || {})
      }
      
      json() {
        if (this._body) {
          return Promise.resolve(JSON.parse(this._body))
        }
        return Promise.reject(new Error('No body'))
      }
    },
    NextResponse: MockNextResponse,
  }
}, { virtual: true })

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NODE_ENV = 'test'

// Global fetch mock (can be overridden in individual tests)
global.fetch = jest.fn()

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks()
})
