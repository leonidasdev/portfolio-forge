/**
 * Jest Configuration for Portfolio Forge
 * 
 * Configured for TypeScript + React Testing Library
 */

/** @type {import('jest').Config} */
const config = {
  // Use ts-jest for TypeScript support
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  
  // Module path aliases (matching tsconfig paths)
  moduleNameMapper: {
    '^@/lib/supabase/server$': '<rootDir>/__mocks__/lib/supabase/server.ts',
    '^@/lib/supabase/types$': '<rootDir>/__mocks__/lib/supabase/types.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^next/server$': '<rootDir>/__mocks__/next/server.ts',
    '^next/navigation$': '<rootDir>/__mocks__/next/navigation.ts',
    '^@supabase/supabase-js$': '<rootDir>/__mocks__/@supabase/supabase-js.ts',
  },
  
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,  // Skip type checking for faster tests
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        target: 'ES2020',
        module: 'commonjs',
        strict: false,  // Less strict for tests
        noImplicitAny: false,
      },
    }],
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
}

module.exports = config
