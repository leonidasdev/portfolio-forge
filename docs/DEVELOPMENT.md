# Development Guide

This guide covers local development setup, workflow practices, and project conventions for Portfolio Forge.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [Code Conventions](#code-conventions)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Node.js 18+** - [nodejs.org](https://nodejs.org/)
- **npm/yarn/pnpm** - Package manager
- **Git** - Version control
- **VS Code** (recommended) - Editor with workspace settings included

### Accounts Needed

- **Supabase** - Database and authentication ([supabase.com](https://supabase.com))
- **Groq** - AI provider ([console.groq.com](https://console.groq.com))
- **(Optional) Upstash** - Redis for production rate limiting ([upstash.com](https://upstash.com))

---

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/portfolio-forge.git
cd portfolio-forge
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider
GROQ_API_KEY=your-groq-api-key

# Optional: Redis for production rate limiting
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional: Logging level (debug, info, warn, error)
LOG_LEVEL=debug
```

### 3. Database Setup

Run the schema SQL in your Supabase SQL Editor:

```bash
# Copy and paste into Supabase SQL Editor:
# 1. supabase/schema.sql - Tables and RLS policies
# 2. supabase/storage-buckets.sql - Storage buckets
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Development Workflow

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |
| `npm run validate` | Run all checks (lint + typecheck + test) |

### Git Hooks (Husky)

Pre-commit and pre-push hooks are configured:

- **pre-commit**: Runs lint-staged (ESLint + Prettier on staged files)
- **pre-push**: Runs typecheck and tests

### Branch Strategy

1. Create feature branches from `main`
2. Use conventional commit messages
3. Open PR for review
4. Merge after CI passes

---

## Project Structure

```
portfolio-forge/
├── app/                    # Next.js App Router
│   ├── api/v1/            # API routes (versioned)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── p/[token]/         # Public portfolio view
│
├── components/            # React components
│   ├── certifications/    # Certification components
│   ├── portfolio-builder/ # Builder with context
│   ├── portfolio-renderer/# Portfolio rendering
│   ├── portfolio-sections/# Section components
│   ├── portfolio-templates/# Template components
│   ├── portfolio-themes/  # Theme components
│   ├── tags/              # Tag management
│   └── ui/                # Reusable UI components
│
├── lib/                   # Core utilities
│   ├── ai/               # AI integration layer
│   │   ├── abilities/    # AI atomic operations
│   │   ├── agents/       # Complex AI workflows
│   │   ├── provider.ts   # Groq SDK wrapper
│   │   └── router.ts     # Model routing
│   ├── api/              # API utilities
│   │   ├── client.ts     # Frontend API client
│   │   ├── errors.ts     # Error classes
│   │   ├── rate-limit.ts # Rate limiting
│   │   └── route-handler.ts # Route wrapper
│   ├── auth/             # Authentication utilities
│   ├── storage/          # File storage utilities
│   ├── supabase/         # Supabase client setup
│   ├── validation/       # Zod schemas
│   ├── constants.ts      # App constants
│   ├── logger.ts         # Structured logging
│   └── utils.ts          # Common utilities
│
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── docs/                 # Documentation
├── supabase/             # Database schema
└── __mocks__/            # Test mocks
```

### Key Directories

#### `/app/api/v1/`
All API routes are versioned under `/api/v1/`. Routes use the `withRouteHandler` wrapper for consistent error handling and rate limiting.

#### `/lib/ai/`
AI integration follows a layered architecture:
- **provider.ts** - Groq SDK initialization
- **router.ts** - Model selection based on task
- **abilities/** - Atomic AI operations (improve text, suggest tags)
- **agents/** - Complex workflows (analyze portfolio, optimize for job)

#### `/components/ui/`
Reusable UI components with consistent styling:
- Button, Input, Select, Textarea
- Modal, ConfirmModal, AlertModal
- Toast notifications
- Card, Skeleton

---

## Code Conventions

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` when necessary)
- Export types alongside components

```typescript
// Good
export interface ButtonProps {
  variant: 'primary' | 'secondary'
}
export function Button({ variant }: ButtonProps) { ... }

// Avoid
export function Button({ variant }: any) { ... }
```

### Components

- Use named exports
- Props interface above component
- JSDoc for complex props

```typescript
/**
 * Button component with multiple variants
 * @param variant - Visual style
 * @param isLoading - Shows spinner when true
 */
export function Button({ variant, isLoading }: ButtonProps) {
  // ...
}
```

### API Routes

- Use `withRouteHandler` wrapper
- Validate input with Zod
- Return consistent JSON structure

```typescript
export const POST = withRouteHandler({
  rateLimit: RATE_LIMIT_CONFIGS.standard,
  handler: async (req) => {
    const body = await req.json()
    const validated = mySchema.parse(body)
    // ...
    return { success: true, data: result }
  }
})
```

### Logging

Use the structured logger instead of `console.*`:

```typescript
import { logger } from '@/lib/logger'

// Good
logger.info('User logged in', { userId: '123' })
logger.error('Failed to save', { error, portfolioId })

// Avoid
console.log('User logged in:', userId)
console.error('Error:', error)
```

### Constants

Use constants from `lib/constants.ts`:

```typescript
import { TEXT_LIMITS, FIELD_LIMITS } from '@/lib/constants'

if (text.length > TEXT_LIMITS.MAX_AI_INPUT_LENGTH) {
  throw new Error('Input too long')
}
```

---

## Testing

### Test Structure

```
lib/
├── api/
│   └── __tests__/
│       ├── client.test.ts
│       ├── rate-limit.test.ts
│       └── route-handler.test.ts
├── validation/
│   └── __tests__/
│       └── helpers.test.ts
└── __tests__/
    ├── logger.test.ts
    └── utils.test.ts

components/
├── ui/
│   └── __tests__/
│       ├── Button.test.tsx
│       ├── Modal.test.tsx
│       └── Toast.test.tsx
└── tags/
    └── __tests__/
        └── TagSelector.test.tsx
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific file
npm test -- TagSelector.test.tsx
```

### Writing Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle click', async () => {
    const onClick = jest.fn()
    render(<MyComponent onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(onClick).toHaveBeenCalled()
    })
  })
})
```

---

## Debugging

### VS Code Launch Configurations

Debugging configurations are pre-configured in `.vscode/launch.json`:

- **Next.js: debug server-side** - Debug server components and API routes
- **Next.js: debug client-side** - Debug client components in Chrome
- **Next.js: debug full stack** - Debug both simultaneously

### Common Debug Points

1. **API Routes**: Add breakpoints in route handlers
2. **Server Components**: Debug in server-side configuration
3. **Client Components**: Use browser DevTools or client-side debugger

### Logging

Enable debug logging:

```env
LOG_LEVEL=debug
```

View structured logs in terminal during development.

---

## Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### TypeScript errors after changes
```bash
# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
npm run typecheck
```

#### Tests failing unexpectedly
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

#### Supabase connection issues
1. Verify `.env.local` has correct values
2. Check Supabase project is active
3. Verify RLS policies allow your operation

#### Rate limiting in development
In development mode, rate limiting uses in-memory storage and is less restrictive. For production testing, configure Redis.

### Getting Help

1. Check existing [documentation](./README.md)
2. Search [GitHub Issues](https://github.com/yourusername/portfolio-forge/issues)
3. Open a new issue with reproduction steps

---

## Additional Resources

- [Architecture Deep Dive](./architecture/ARCHITECTURE_DEEP_DIVE.md)
- [API Versioning Guide](./api/api-versioning.md)
- [Rate Limiting Guide](./RATE_LIMITING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Policy](../SECURITY.md)
