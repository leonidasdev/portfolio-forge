/**
 * Mock for next/navigation module
 */

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
})

export const usePathname = () => '/'

export const useSearchParams = () => new URLSearchParams()

// Mock redirect - note: Next.js redirect throws an error internally
export const redirect = jest.fn((path: string) => {
  const error = new Error(`NEXT_REDIRECT:${path}`)
  ;(error as any).digest = `NEXT_REDIRECT;push;${path};`
  throw error
})

// Mock notFound
export const notFound = jest.fn(() => {
  const error = new Error('NEXT_NOT_FOUND')
  ;(error as any).digest = 'NEXT_NOT_FOUND'
  throw error
})
