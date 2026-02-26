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
| **Database** | Supabase (PostgreSQL + Auth + Storage + RLS) |
| **AI Provider** | Groq API (llama-3.3-70b-versatile) |
| **Styling** | Tailwind CSS 3.4.17 |
| **Testing** | Jest 30 (388 tests) + Playwright (E2E) |
| **Package Manager** | npm |
| **License** | Apache 2.0 |
| **TypeScript Errors** | 0 |
| **ESLint Errors** | 0 (4 warnings) |

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

### 1. Supabase Query Type Safety (P3 - Resolved)

**Status:** MOSTLY RESOLVED - Typed query helpers created in `lib/supabase/queries.ts`

**Remaining:** 4 ESLint warnings for unused `userId` parameters in AI agents:
- `lib/ai/agents/analyzePortfolio.ts`
- `lib/ai/agents/generateSummary.ts`
- `lib/ai/agents/recommendTemplate.ts`
- `tests/api.spec.ts`

**Decision:** Low priority - these are intentional API signatures that may use userId in future.

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

## Recent Changes (as of February 26, 2026)

### Completed Recently

1. **Type Safety Improvements**
   - Created typed query helpers in `lib/supabase/queries.ts`
   - All API routes now use typed helpers
   - 0 TypeScript compilation errors

2. **Code Quality**
   - Added explicit return types to all exported functions
   - Added `SECTION_TYPE_LABELS` and `SECTION_TYPE_COLORS` constants
   - Refactored SectionCard.tsx to use constants
   - All 10 AI routes have proper rate limiting

3. **Documentation**
   - Added File Headers templates to CONTRIBUTING.md
   - Fixed all markdown file references (kebab-case)
   - Updated TODO.md with Current Sprint section

4. **Test Coverage**
   - 388+ unit tests passing
   - 22 test files
   - Accessibility tests with jest-axe
   - E2E tests for auth, home, API

5. **Component Library**
   - Complete UI library: Button, Modal, Toast, Input, Card, Skeleton
   - All components have JSDoc file headers
   - Props interfaces follow `{ComponentName}Props` pattern

6. **GitHub Pages Export** (COMPLETED)
   - Static export engine with all templates/themes
   - GitHub API client for repo management
   - Export API routes with rate limiting (5 req/min)
   - Dashboard UI with config modal, token input, success/error states
   - Re-deploy support (same flow updates existing repo)

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
| 2026-02-26 | Completed GitHub Pages export; updated docs, rate limits |
| 2026-02-26 | Updated with current state: 388 tests, typed queries, new sprint priorities |
| 2026-01-31 | Initial creation - comprehensive project context |

---

## Current Focus Areas

### Priority 1: CI/CD Improvements
- Configure Vercel preview deployments
- Add production deployment workflow

### Priority 2: Testing
- E2E tests for authenticated flows (portfolio CRUD, AI features)
- Increase coverage threshold to 70%

### Priority 3: Polish
- Dark mode support
- Complete accessibility audit
- Performance optimizations
- Fix 4 ESLint warnings (unused userId in AI agents)

---

*This file should be updated when significant architectural decisions or conventions change.*
