# CLAUDE.md - AI Assistant Context for Portfolio Forge

> This file provides context for AI assistants (Claude, Copilot, etc.) working on this project.
> It documents the project state, conventions, and key decisions to ensure continuity across sessions.

---

## Project Overview

**Portfolio Forge** is an AI-powered portfolio builder built with Next.js 15, TypeScript, Supabase, and Groq AI. It enables users to create professional portfolios with AI assistance for content optimization, job-tailored resumes, and smart recommendations.

### Quick Facts

| Aspect | Value |
|--------|-------|
| **Framework** | Next.js 15.1.3 (App Router) |
| **Language** | TypeScript 5.7.2 (strict mode) |
| **Database** | Supabase (PostgreSQL + Auth + Storage) |
| **AI Provider** | Groq API (llama-3.3-70b-versatile) |
| **Styling** | Tailwind CSS 3.4.17 |
| **Testing** | Jest 30 + React Testing Library + Playwright |
| **Package Manager** | npm |
| **License** | Apache 2.0 |

### Repository

- **Owner:** leonidasdev
- **Repo:** portfolio-forge
- **Branch:** main
- **CI/CD:** GitHub Actions

---

## Architecture Overview

```
portfolio-forge/
├── app/                    # Next.js App Router
│   ├── api/v1/            # Versioned REST API
│   │   ├── ai/            # AI endpoints (10 routes)
│   │   ├── portfolios/    # Portfolio CRUD
│   │   ├── certifications/# Certification management
│   │   └── tags/          # Tag system
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard
│   └── p/[token]/         # Public portfolio viewing
│
├── components/             # React components
│   ├── portfolio-builder/ # Builder UI (Builder, SectionEditor, etc.)
│   ├── portfolio-sections/# Section renderers
│   ├── portfolio-templates/# Template components
│   ├── portfolio-themes/  # Theme system
│   ├── certifications/    # Certification UI
│   ├── tags/              # Tag selector
│   └── ui/                # Reusable UI library
│
├── lib/                    # Core libraries
│   ├── ai/                # AI integration layer
│   │   ├── abilities/     # Single-purpose AI functions
│   │   ├── agents/        # Multi-step AI workflows
│   │   ├── provider.ts    # Groq API client
│   │   └── router.ts      # Provider abstraction
│   ├── api/               # API utilities
│   │   ├── client.ts      # Frontend API client
│   │   ├── errors.ts      # Centralized error classes
│   │   ├── route-handler.ts# Error handling wrapper
│   │   ├── auth-middleware.ts# Auth utilities
│   │   └── rate-limit.ts  # Rate limiting
│   ├── supabase/          # Supabase client setup
│   ├── validation/        # Zod schemas
│   ├── config/            # Configuration
│   └── constants.ts       # Application constants
│
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
├── docs/                   # Documentation
└── supabase/              # Database schema
```

### AI Layer Architecture

```
API Routes (/api/v1/ai/*)
         ↓
    Agents (multi-step workflows)
         ↓
   Abilities (single-purpose functions)
         ↓
     Router (provider abstraction)
         ↓
    Provider (Groq API)
```

---

## Key Conventions

### Code Style

1. **TypeScript Strict Mode** - No implicit any (except documented Supabase edge cases)
2. **Async/Await** - Never use raw Promises with .then()
3. **Zod Validation** - All API inputs validated with Zod schemas
4. **Error Handling** - Use centralized error classes from `lib/api/errors.ts`
5. **Logging** - Use structured logger from `lib/logger.ts` (not console.*)

### API Routes

- All routes under `/api/v1/` namespace
- Use `createRouteHandler()` wrapper from `lib/api/route-handler.ts`
- Apply rate limiting via `withRateLimit()` middleware
- Validate input with Zod schemas from `lib/validation/`

### Components

- Use UI components from `components/ui/` (Button, Modal, Toast, Input, etc.)
- Follow the pattern of existing components
- Split large components (>400 lines) into smaller files
- Use `BuilderContext` for portfolio builder state

### Testing

- Unit tests: `*.test.ts` or `*.test.tsx` in `__tests__/` folders
- E2E tests: `e2e/*.spec.ts` with Playwright
- Run tests: `npm test` or `npm run test:e2e`

---

## Known Technical Debt

### 1. Supabase Query Type Safety (P3 - Low Impact/High Effort)

**Issue:** ~10 ESLint warnings for `@typescript-eslint/no-explicit-any` in API routes

**Root Cause:** Supabase's query builder loses type inference with:
- Complex joins (e.g., `certification_tags -> tags`)
- Dynamic queries with conditional `.eq()`, `.limit()`

**Affected Files:**
- `app/api/v1/certifications/route.ts`
- `app/api/v1/certifications/[id]/route.ts`
- `app/api/v1/certification-tags/route.ts`
- Other routes with complex Supabase queries

**Decision:** Keep warnings visible. The `as any` casts are functionally correct:
- RLS ensures data security
- Runtime behavior is correct
- Fixing requires significant refactoring (typed repository layer)

### 2. In-Memory Rate Limiting

**Issue:** Rate limiting uses in-memory store by default

**For Production:** Configure Redis via:
```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### 3. Missing E2E Tests for Authenticated Flows

**Issue:** E2E tests exist but don't cover authenticated user flows

**Reason:** Requires auth fixtures setup in Playwright

---

## Recent Changes (as of January 31, 2026)

### Completed Recently

1. **Next.js 15.5 Compatibility**
   - Added async params handling in dynamic routes
   - Added Suspense boundaries for `useSearchParams()`
   - Fixed all build errors

2. **ESLint Configuration**
   - Migrated to flat config (`eslint.config.mjs`)
   - Set `@typescript-eslint/no-explicit-any` to `warn`
   - Documented Supabase typing as tech debt

3. **Test Coverage**
   - 356+ unit tests passing
   - 19 test files
   - Accessibility tests with jest-axe

4. **Component Refactoring**
   - Split `Builder.tsx` (1150 → 209 lines)
   - Split `SectionEditor.tsx` (759 → 459 lines)
   - Created UI component library

5. **Documentation**
   - Updated all markdown files
   - Created CLAUDE.md for AI continuity

---

## Environment Variables

### Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Provider
GROQ_API_KEY=gsk_your_key
```

### Optional

```env
# Redis (for production rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_API_MAX=100
RATE_LIMIT_API_WINDOW=60

# Logging
LOG_LEVEL=debug  # debug, info, warn, error
```

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run typecheck        # TypeScript check

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
npm run test:e2e         # Run Playwright E2E

# Validation (pre-commit runs this)
npm run validate         # typecheck + lint + test
```

---

## How to Continue Work

### When Starting a New Session

1. Check `docs/TODO.md` for pending tasks
2. Review recent commits for context
3. Run `npm run validate` to verify state

### Making Changes

1. Create feature branch: `git checkout -b feature/name`
2. Make changes following conventions above
3. Run `npm run validate` before committing
4. Pre-commit hooks will run lint-staged

### Common Tasks

**Add a new API route:**
1. Create file in `app/api/v1/[resource]/route.ts`
2. Use `createRouteHandler()` wrapper
3. Add Zod schema in `lib/validation/`
4. Apply rate limiting with `withRateLimit()`

**Add a new UI component:**
1. Create in `components/ui/`
2. Export from `components/ui/index.ts`
3. Add tests in `components/ui/__tests__/`

**Add a new AI feature:**
1. Create ability in `lib/ai/abilities/`
2. Create API route in `app/api/v1/ai/`
3. (Optional) Create agent in `lib/ai/agents/` for multi-step flows

---

## Project Contacts

- **Repository:** https://github.com/leonidasdev/portfolio-forge
- **Owner:** leonidasdev

---

## Document History

| Date | Changes |
|------|---------|
| 2026-01-31 | Initial creation - comprehensive project context |

---

*This file should be updated when significant architectural decisions or conventions change.*
